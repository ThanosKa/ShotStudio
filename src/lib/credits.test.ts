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
    await ensureUser("u1", "u1@test");

    const a = await grant("u1", 10, "evt_X");
    const b = await grant("u1", 10, "evt_X");

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
      ensureUser("u_race", "u_race@test"),
      ensureUser("u_race", "u_race@test"),
      ensureUser("u_race", "u_race@test"),
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
    await ensureUser("d1", "d1@test");
    await grant("d1", 3, "evt_d1");

    const balance = await db.transaction((tx) =>
      debit("d1", { reason: "generation" }, tx),
    );

    expect(balance).toBe(2);
    const usage = (await usageRows("d1")).filter((t) => t.type === "usage");
    expect(usage).toHaveLength(1);
    expect(usage[0].amount).toBe(-1);
    expect(usage[0].metadata).toEqual({ reason: "generation" });
  });

  test("at balance 0 throws InsufficientCreditsError and writes nothing", async () => {
    await ensureUser("d2", "d2@test");

    await expect(
      db.transaction((tx) => debit("d2", {}, tx)),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);

    expect(await usageRows("d2")).toHaveLength(0);
    const [u] = await db.select().from(users).where(eq(users.id, "d2"));
    expect(u.credits).toBe(0);
  });

  test("throws UserNotFoundError for an unknown User", async () => {
    await expect(
      db.transaction((tx) => debit("nobody", {}, tx)),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  test("leaves nothing behind if the caller's transaction fails afterwards", async () => {
    await ensureUser("d3", "d3@test");
    await grant("d3", 1, "evt_d3");

    await expect(
      db.transaction(async (tx) => {
        await debit("d3", {}, tx);
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    const [u] = await db.select().from(users).where(eq(users.id, "d3"));
    expect(u.credits).toBe(1);
    expect((await usageRows("d3")).filter((t) => t.type === "usage")).toHaveLength(0);
  });
});
