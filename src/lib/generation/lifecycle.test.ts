import { eq } from "drizzle-orm";
import { describe, expect, test, vi } from "vitest";
import { db, keepRequestAliveUntil } from "@/lib/db";
import { ensureUser } from "@/lib/db/queries";
import { generations, transactions, users } from "@/lib/db/schema";
import { generateImage } from "@/lib/openrouter";
import { refundAbandonedGenerations, runGeneration } from "./lifecycle";

function makeFile(name = "shot.png", type = "image/png", size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

function inputFor(userId: string) {
  return {
    userId,
    appName: "Acme",
    pitch: "Track calories from a meal photo, no manual logging.",
    audience: "Busy parents",
    category: "productivity",
    stylePreset: "friendly" as const,
    screenshots: [makeFile(), makeFile(), makeFile()] as [File, File, File],
  };
}

describe("runGeneration", () => {
  test("returns insufficient_credits when balance is 0; no rows written", async () => {
    await ensureUser("u_zero", "u_zero@test");

    const outcome = await runGeneration(inputFor("u_zero"));

    expect(outcome.kind).toBe("insufficient_credits");

    const gens = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, "u_zero"));
    expect(gens).toHaveLength(0);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_zero"));
    expect(txs).toHaveLength(0);
  });

  test("happy path: balance −1, one usage row, generation complete, three image URLs", async () => {
    await ensureUser("u_ok", "u_ok@test");
    await db
      .update(users)
      .set({ credits: 3 })
      .where(eq(users.id, "u_ok"));

    const outcome = await runGeneration(inputFor("u_ok"));

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.imageUrls).toHaveLength(3);
    for (const url of outcome.imageUrls) {
      expect(url.startsWith("data:image/png;base64,")).toBe(true);
    }

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_ok"));
    expect(u.credits).toBe(2);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_ok"));
    expect(txs).toHaveLength(1);
    expect(txs[0].type).toBe("usage");
    expect(txs[0].amount).toBe(-1);

    const [gen] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, outcome.generationId));
    expect(gen.status).toBe("complete");
    expect(gen.completedAt).not.toBeNull();
  });

  test("when shots fail: balance restored, matched usage+refund pair, generation failed", async () => {
    await ensureUser("u_fail", "u_fail@test");
    await db
      .update(users)
      .set({ credits: 5 })
      .where(eq(users.id, "u_fail"));

    vi.mocked(generateImage).mockRejectedValue(new Error("openrouter down"));

    const outcome = await runGeneration(inputFor("u_fail"));

    expect(outcome.kind).toBe("failed_and_refunded");

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_fail"));
    expect(u.credits).toBe(5);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_fail"));
    const usage = txs.filter((t) => t.type === "usage");
    const refunds = txs.filter((t) => t.type === "refund");
    expect(usage).toHaveLength(1);
    expect(usage[0].amount).toBe(-1);
    expect(refunds).toHaveLength(1);
    expect(refunds[0].amount).toBe(1);

    const gens = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, "u_fail"));
    expect(gens).toHaveLength(1);
    expect(gens[0].status).toBe("failed");
    expect(gens[0].failureReason).toBeTruthy();
  });

  test("returns user_not_ready when users row is missing; no rows written", async () => {
    const outcome = await runGeneration(inputFor("ghost"));

    expect(outcome.kind).toBe("user_not_ready");

    const gens = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, "ghost"));
    expect(gens).toHaveLength(0);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "ghost"));
    expect(txs).toHaveLength(0);
  });

  test("rejects oversized screenshot before any debit", async () => {
    await ensureUser("u_big", "u_big@test");
    await db
      .update(users)
      .set({ credits: 5 })
      .where(eq(users.id, "u_big"));

    const tooBig = makeFile("big.png", "image/png", 6 * 1024 * 1024);
    const outcome = await runGeneration({
      ...inputFor("u_big"),
      screenshots: [tooBig, makeFile(), makeFile()],
    });

    expect(outcome.kind).toBe("invalid_input");

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_big"));
    expect(u.credits).toBe(5);

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_big"));
    expect(txs).toHaveLength(0);
  });

  test("rejects screenshot with disallowed MIME before any debit", async () => {
    await ensureUser("u_mime", "u_mime@test");
    await db
      .update(users)
      .set({ credits: 5 })
      .where(eq(users.id, "u_mime"));

    const outcome = await runGeneration({
      ...inputFor("u_mime"),
      screenshots: [
        makeFile("bad.gif", "image/gif"),
        makeFile(),
        makeFile(),
      ],
    });

    expect(outcome.kind).toBe("invalid_input");

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_mime"));
    expect(u.credits).toBe(5);
  });
});

async function userWithCredits(userId: string, credits: number) {
  await ensureUser(userId, `${userId}@test`);
  await db.update(users).set({ credits }).where(eq(users.id, userId));
}

async function creditsOf(userId: string) {
  const [u] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId));
  return u.credits;
}

async function refundsOf(userId: string) {
  const txs = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));
  return txs.filter((t) => t.type === "refund");
}

/** A Generation whose Debit committed, then the Worker stopped before any outcome. */
async function abandonedGeneration(userId: string, minutesAgo: number) {
  const [row] = await db
    .insert(generations)
    .values({
      userId,
      appName: "Acme",
      stylePreset: "friendly",
      category: "productivity",
      status: "pending",
      createdAt: new Date(Date.now() - minutesAgo * 60_000),
    })
    .returning({ id: generations.id });
  await db.insert(transactions).values({ userId, type: "usage", amount: -1 });
  return row.id;
}

describe("runGeneration on a Worker", () => {
  test("hands its whole run to the request, so a visitor hanging up does not cancel the Refund", async () => {
    await userWithCredits("u_alive", 1);
    vi.mocked(generateImage).mockImplementation(async () => {
      throw new Error("openrouter down");
    });
    vi.mocked(keepRequestAliveUntil).mockClear();

    const outcome = await runGeneration(inputFor("u_alive"));

    expect(vi.mocked(keepRequestAliveUntil)).toHaveBeenCalledTimes(1);
    const handedOver = vi.mocked(keepRequestAliveUntil).mock.calls[0][0];
    await expect(handedOver).resolves.toEqual(outcome);
    expect(outcome.kind).toBe("failed_and_refunded");
    expect(await creditsOf("u_alive")).toBe(1);
  });
});

describe("refundAbandonedGenerations", () => {
  test("fails a Generation left pending past the cutoff and refunds its Credit, once", async () => {
    await userWithCredits("u_gone", 2);
    const generationId = await abandonedGeneration("u_gone", 11);

    expect(await refundAbandonedGenerations()).toBe(1);
    expect(await refundAbandonedGenerations()).toBe(0);

    expect(await creditsOf("u_gone")).toBe(3);
    const refunds = await refundsOf("u_gone");
    expect(refunds).toHaveLength(1);
    expect(refunds[0].amount).toBe(1);
    expect(refunds[0].metadata).toMatchObject({ generationId });
    const [gen] = await db.select().from(generations).where(eq(generations.id, generationId));
    expect(gen.status).toBe("failed");
    expect(gen.failureReason).toBeTruthy();
  });

  test("leaves a Generation that may still be running alone", async () => {
    await userWithCredits("u_running", 2);
    await abandonedGeneration("u_running", 2);

    expect(await refundAbandonedGenerations()).toBe(0);

    expect(await creditsOf("u_running")).toBe(2);
    expect(await refundsOf("u_running")).toHaveLength(0);
  });

  test("does not refund twice when the run's own failure comes after the sweep", async () => {
    await userWithCredits("u_race", 1);
    let failShots!: () => void;
    const shotsFail = new Promise<void>((r) => (failShots = r));
    vi.mocked(generateImage).mockImplementation(async () => {
      await shotsFail;
      throw new Error("openrouter down");
    });

    const run = runGeneration(inputFor("u_race"));
    await vi.waitFor(async () => expect(await creditsOf("u_race")).toBe(0));
    // The sweep treats every pending row as abandoned with a cutoff in the future.
    expect(await refundAbandonedGenerations(new Date(Date.now() + 60_000))).toBe(1);
    failShots();
    await run;

    expect(await creditsOf("u_race")).toBe(1);
    expect(await refundsOf("u_race")).toHaveLength(1);
  });
});
