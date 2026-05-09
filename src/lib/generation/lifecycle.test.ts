import { eq } from "drizzle-orm";
import { describe, expect, test, vi } from "vitest";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/db/queries";
import { generations, transactions, users } from "@/lib/db/schema";
import { generateImage, generateText } from "@/lib/openrouter";
import { runGeneration } from "./lifecycle";

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
    stylePreset: "soft_bright" as const,
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

  test("happy path: balance −1, one usage row, generation complete, four image URLs", async () => {
    await ensureUser("u_ok", "u_ok@test");
    await db
      .update(users)
      .set({ credits: 3 })
      .where(eq(users.id, "u_ok"));

    const outcome = await runGeneration(inputFor("u_ok"));

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.imageUrls).toHaveLength(4);
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

  test("succeeds even when headline synthesis throws (falls back to appName)", async () => {
    await ensureUser("u_no_headline", "u_no_headline@test");
    await db
      .update(users)
      .set({ credits: 3 })
      .where(eq(users.id, "u_no_headline"));

    // 1×1 transparent PNG; restore image mock in case a prior test left it rejecting.
    const ONE_PX_PNG_B64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    vi.mocked(generateImage).mockResolvedValue(ONE_PX_PNG_B64);
    vi.mocked(generateText).mockRejectedValueOnce(new Error("haiku down"));

    const outcome = await runGeneration(inputFor("u_no_headline"));

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.imageUrls).toHaveLength(4);

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_no_headline"));
    expect(u.credits).toBe(2);
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
