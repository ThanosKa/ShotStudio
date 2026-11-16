import { eq, sql } from "drizzle-orm";
import { describe, expect, test, vi } from "vitest";
import { grant } from "@/lib/credits";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/identity/user-sync";
import { generations, transactions, users } from "@/lib/db/schema";
import { refundAbandonedGenerations, runGeneration } from "@/lib/generation/lifecycle";
import { generateImage } from "@/lib/openrouter";

const ONE_PX_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function makeFile(): File {
  return new File([new Uint8Array(1024)], "shot.png", { type: "image/png" });
}

function inputFor(userId: string) {
  return {
    userId,
    appName: "Acme",
    pitch: "Track calories from a meal photo, no manual logging.",
    category: "productivity",
    stylePreset: "friendly" as const,
    screenshots: [makeFile(), makeFile(), makeFile()] as [File, File, File],
  };
}

async function balanceOf(userId: string) {
  const [u] = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId));
  return u.credits;
}

async function transactionsSum(userId: string) {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)::int` })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  return row.total;
}

/** An Abandoned Generation: its Debit committed, then the Worker stopped before any outcome. */
async function leaveAbandonedGeneration(userId: string) {
  await db.insert(generations).values({
    userId,
    appName: "Acme",
    stylePreset: "friendly",
    category: "productivity",
    status: "pending",
    createdAt: new Date(Date.now() - 11 * 60_000),
  });
  await db.insert(transactions).values({ userId, type: "usage", amount: -1 });
  await db
    .update(users)
    .set({ credits: sql`${users.credits} - 1` })
    .where(eq(users.id, userId));
}

describe("Credit Ledger", () => {
  test("Transactions sum equals the balance after a Grant, a Debit, a failed Generation's Refund and a swept Abandoned Generation", async () => {
    const userId = "u_ledger";
    await ensureUser(userId, `${userId}@test`);

    expect(await grant(userId, 5, "cs_ledger")).toEqual({ granted: true, balance: 5 });
    expect(await transactionsSum(userId)).toBe(await balanceOf(userId));

    vi.mocked(generateImage).mockResolvedValue(ONE_PX_PNG_B64);
    expect((await runGeneration(inputFor(userId))).kind).toBe("ok");
    expect(await balanceOf(userId)).toBe(4);
    expect(await transactionsSum(userId)).toBe(4);

    vi.mocked(generateImage).mockRejectedValue(new Error("openrouter down"));
    expect((await runGeneration(inputFor(userId))).kind).toBe("failed_and_refunded");
    expect(await balanceOf(userId)).toBe(4);
    expect(await transactionsSum(userId)).toBe(4);

    await leaveAbandonedGeneration(userId);
    expect(await balanceOf(userId)).toBe(3);
    expect(await transactionsSum(userId)).toBe(3);

    expect(await refundAbandonedGenerations()).toBe(1);

    expect(await balanceOf(userId)).toBe(4);
    expect(await transactionsSum(userId)).toBe(4);
  });
});
