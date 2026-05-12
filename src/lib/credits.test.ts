import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db/schema";
import { ensureUser } from "@/lib/db/queries";
import { grant } from "./credits";

describe("grant", () => {
  test("is idempotent on duplicate stripePaymentId", async () => {
    await ensureUser("u1", "u1@test");

    const a = await grant("u1", 10, "evt_X");
    const b = await grant("u1", 10, "evt_X");

    expect(a).toBe(10);
    expect(b).toBe(10);

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
