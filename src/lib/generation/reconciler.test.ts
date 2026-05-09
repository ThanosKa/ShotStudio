import { eq } from "drizzle-orm";
import { describe, expect, test, vi } from "vitest";
import * as credits from "@/lib/credits";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/db/queries";
import { generations, transactions, users } from "@/lib/db/schema";
import { runReconciliation } from "./reconciler";

async function insertStalePending(
  userId: string,
  ageMinutes = 30,
): Promise<string> {
  const old = new Date(Date.now() - ageMinutes * 60 * 1000);
  const [row] = await db
    .insert(generations)
    .values({
      userId,
      appName: "Acme",
      stylePreset: "soft_bright",
      category: "productivity",
      status: "pending",
      createdAt: old,
    })
    .returning({ id: generations.id });
  return row.id;
}

describe("runReconciliation", () => {
  test("one stale pending: reaps, refunds, summary reports both", async () => {
    await ensureUser("u_rec", "u_rec@test");
    // Simulate a debit-then-orphaned generation: balance debited, pending row left behind.
    await db.update(users).set({ credits: 4 }).where(eq(users.id, "u_rec"));
    const genId = await insertStalePending("u_rec");

    const summary = await runReconciliation();

    expect(summary).toEqual({ reaped: 1, refunded: 1, refundFailures: 0 });

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "u_rec"));
    expect(u.credits).toBe(5);

    const [gen] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, genId));
    expect(gen.status).toBe("failed");
    expect(gen.failureReason).toMatch(/timeout/);

    const refunds = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "u_rec"));
    expect(refunds).toHaveLength(1);
    expect(refunds[0].type).toBe("refund");
    expect(refunds[0].amount).toBe(1);
  });

  test("partial refund failure: one transient throw is isolated and counted", async () => {
    await ensureUser("u_a", "u_a@test");
    await ensureUser("u_b", "u_b@test");
    await db.update(users).set({ credits: 1 }).where(eq(users.id, "u_a"));
    await db.update(users).set({ credits: 1 }).where(eq(users.id, "u_b"));
    await insertStalePending("u_a");
    await insertStalePending("u_b");

    const real = credits.refund;
    const spy = vi
      .spyOn(credits, "refund")
      .mockImplementationOnce(async () => {
        throw new Error("transient: connection reset");
      })
      .mockImplementationOnce((userId, n, meta) => real(userId, n, meta));

    const summary = await runReconciliation();

    expect(summary.reaped).toBe(2);
    expect(summary.refunded).toBe(1);
    expect(summary.refundFailures).toBe(1);

    spy.mockRestore();
  });
});
