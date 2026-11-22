import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/identity/user-sync";
import {
  debit,
  grant,
  InsufficientCreditsError,
  UserNotFoundError,
} from "./credits";

describe("grant", () => {
  test("is idempotent on duplicate stripePaymentId", async () => {
    await ensureUser({ userId: "u1", email: "u1@test" });

    const a = await grant({ userId: "u1", credits: 10, stripePaymentId: "evt_X" });
    const b = await grant({ userId: "u1", credits: 10, stripePaymentId: "evt_X" });

    expect(a).toEqual({ granted: true, balance: 10 });
    expect(b).toEqual({ granted: false, balance: 10 });

    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.stripePaymentId, "evt_X"));
    expect(txs).toHaveLength(1);
  });
});

describe("ensureUser", () => {
  test("concurrent calls with same userId produce one row", async () => {
    await Promise.all([
      ensureUser({ userId: "u_race", email: "u_race@test" }),
      ensureUser({ userId: "u_race", email: "u_race@test" }),
      ensureUser({ userId: "u_race", email: "u_race@test" }),
    ]);

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, "u_race"));
    expect(rows).toHaveLength(1);
    expect(rows[0].credits).toBe(0);
  });
});

describe("debit", () => {
  const usageRows = (userId: string) =>
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

  test("lowers the balance by 1 and writes one usage -1 Transaction", async () => {
    await ensureUser({ userId: "d1", email: "d1@test" });
    await grant({ userId: "d1", credits: 3, stripePaymentId: "evt_d1" });

    const balance = await db.transaction((tx) =>
      debit({ userId: "d1", metadata: { reason: "generation" }, within: tx }),
    );

    expect(balance).toBe(2);
    const usage = (await usageRows("d1")).filter((t) => t.type === "usage");
    expect(usage).toHaveLength(1);
    expect(usage[0].amount).toBe(-1);
    expect(usage[0].metadata).toEqual({ reason: "generation" });
  });

  test("at balance 0 throws InsufficientCreditsError and writes nothing", async () => {
    await ensureUser({ userId: "d2", email: "d2@test" });

    await expect(
      db.transaction((tx) => debit({ userId: "d2", metadata: {}, within: tx })),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);

    expect(await usageRows("d2")).toHaveLength(0);
    const [u] = await db.select().from(users).where(eq(users.id, "d2"));
    expect(u.credits).toBe(0);
  });

  test("throws UserNotFoundError for an unknown User", async () => {
    await expect(
      db.transaction((tx) => debit({ userId: "nobody", metadata: {}, within: tx })),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  test("leaves nothing behind if the caller's transaction fails afterwards", async () => {
    await ensureUser({ userId: "d3", email: "d3@test" });
    await grant({ userId: "d3", credits: 1, stripePaymentId: "evt_d3" });

    await expect(
      db.transaction(async (tx) => {
        await debit({ userId: "d3", metadata: {}, within: tx });
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    const [u] = await db.select().from(users).where(eq(users.id, "d3"));
    expect(u.credits).toBe(1);
    expect((await usageRows("d3")).filter((t) => t.type === "usage")).toHaveLength(0);
  });
});
