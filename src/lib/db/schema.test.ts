import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { db } from "@/lib/db";
import { grant, refund } from "@/lib/credits";
import { ensureUser } from "@/lib/db/queries";
import { transactions, users } from "@/lib/db/schema";
import { STYLE_PRESET_IDS } from "@/lib/generation/presets";

/**
 * Fresh-database bootstrap contract.
 *
 * Every test in this file runs against a brand-new PGlite instance with the
 * `drizzle/*.sql` chain applied from empty — i.e. exactly what a brand-new
 * Supabase project looks like after `pnpm db:migrate`. These assertions are
 * the checklist to run against a rebuilt database: if they hold here and the
 * same catalog queries return the same shape in Supabase, the rebuild is
 * faithful.
 */

async function rows<T = Record<string, unknown>>(
  query: ReturnType<typeof sql>,
): Promise<T[]> {
  const res = (await db.execute(query)) as unknown;
  if (Array.isArray(res)) return res as T[];
  return ((res as { rows: T[] }).rows ?? []) as T[];
}

describe("fresh-database bootstrap", () => {
  test("migration chain creates exactly the expected tables", async () => {
    const result = await rows<{ table_name: string }>(sql`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `);
    expect(result.map((r) => r.table_name)).toEqual([
      "generations",
      "transactions",
      "users",
    ]);
  });

  test("credit_packages was dropped by 0001 and does not come back", async () => {
    const result = await rows<{ table_name: string }>(sql`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_name = 'credit_packages'
    `);
    expect(result).toHaveLength(0);
  });

  test("enums carry the current label sets", async () => {
    const result = await rows<{ typname: string; enumlabel: string }>(sql`
      select t.typname, e.enumlabel
      from pg_type t
      join pg_enum e on e.enumtypid = t.oid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public'
      order by t.typname, e.enumsortorder
    `);

    const byType = new Map<string, string[]>();
    for (const r of result) {
      byType.set(r.typname, [...(byType.get(r.typname) ?? []), r.enumlabel]);
    }

    expect(byType.get("transaction_type")).toEqual([
      "purchase",
      "usage",
      "refund",
    ]);
    expect(byType.get("generation_status")).toEqual([
      "pending",
      "complete",
      "failed",
    ]);
    // 0004 renamed these; the old soft_bright/dark_premium/... set must be gone.
    expect(byType.get("style_preset")).toEqual([...STYLE_PRESET_IDS]);
  });

  test("transactions.stripe_payment_id unique index is PARTIAL — grant() depends on it", async () => {
    const [idx] = await rows<{ indexdef: string }>(sql`
      select indexdef from pg_indexes
      where schemaname = 'public'
        and indexname = 'transactions_stripe_payment_id_uniq'
    `);
    expect(idx).toBeDefined();
    expect(idx.indexdef).toMatch(/CREATE UNIQUE INDEX/i);
    // The WHERE clause is the whole point: without it, grant()'s
    // onConflictDoNothing({ where: ... }) cannot infer this arbiter and every
    // Stripe webhook fails.
    expect(idx.indexdef).toMatch(/WHERE .*stripe_payment_id IS NOT NULL/i);
  });

  test("users.stripe_customer_id unique index is PARTIAL (0003)", async () => {
    const [idx] = await rows<{ indexdef: string }>(sql`
      select indexdef from pg_indexes
      where schemaname = 'public'
        and indexname = 'users_stripe_customer_id_uniq'
    `);
    expect(idx).toBeDefined();
    expect(idx.indexdef).toMatch(/CREATE UNIQUE INDEX/i);
    expect(idx.indexdef).toMatch(/WHERE .*stripe_customer_id IS NOT NULL/i);
  });

  test("multiple users may have a null stripe_customer_id", async () => {
    await ensureUser("p1", "p1@test");
    await ensureUser("p2", "p2@test");

    const result = await db.select().from(users);
    expect(result).toHaveLength(2);
    expect(result.every((u) => u.stripeCustomerId === null)).toBe(true);
  });

  test("many transactions may have a null stripe_payment_id", async () => {
    await ensureUser("p3", "p3@test");
    await db.insert(transactions).values([
      { userId: "p3", type: "usage", amount: -1 },
      { userId: "p3", type: "usage", amount: -1 },
      { userId: "p3", type: "refund", amount: 1 },
    ]);

    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "p3"));
    expect(result).toHaveLength(3);
  });

  test("all expected indexes exist", async () => {
    const result = await rows<{ indexname: string }>(sql`
      select indexname from pg_indexes
      where schemaname = 'public'
      order by indexname
    `);
    const names = result.map((r) => r.indexname);
    for (const expected of [
      "generations_pending_idx",
      "generations_user_created_idx",
      "transactions_stripe_payment_id_uniq",
      "transactions_user_created_idx",
      "users_email_uniq",
      "users_stripe_customer_id_uniq",
    ]) {
      expect(names).toContain(expected);
    }
  });

  test("FK delete rules: transactions RESTRICT, generations CASCADE", async () => {
    const result = await rows<{ conname: string; confdeltype: string }>(sql`
      select conname, confdeltype
      from pg_constraint
      where contype = 'f'
        and connamespace = 'public'::regnamespace
      order by conname
    `);
    const byName = new Map(result.map((r) => [r.conname, r.confdeltype]));
    // 'r' = RESTRICT — preserves the financial audit trail on user deletion.
    expect(byName.get("transactions_user_id_users_id_fk")).toBe("r");
    // 'c' = CASCADE.
    expect(byName.get("generations_user_id_users_id_fk")).toBe("c");
  });

  test("gen_random_uuid() default works (uuid PKs generate without pgcrypto setup)", async () => {
    await ensureUser("p4", "p4@test");
    const [row] = await db
      .insert(transactions)
      .values({ userId: "p4", type: "usage", amount: -1 })
      .returning({ id: transactions.id });
    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});

describe("credit accounting on a fresh database", () => {
  test("grant → debit → refund leaves a balanced ledger", async () => {
    await ensureUser("acct", "acct@test");

    // Purchase (Growth pack = 5).
    const afterGrant = await grant("acct", 5, "cs_test_reconcile_1");
    expect(afterGrant).toBe(5);

    // Failure refund.
    const afterRefund = await refund("acct", 1, { reason: "generation_failed" });
    expect(afterRefund).toBe(6);

    const ledger = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "acct"));
    const sum = ledger.reduce((acc, t) => acc + t.amount, 0);

    const [u] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, "acct"));

    // Ledger sum must always equal the cached balance on users.credits.
    expect(sum).toBe(u.credits);
  });

  test("grant is idempotent per Stripe checkout session id (replay-safe)", async () => {
    await ensureUser("acct2", "acct2@test");

    const a = await grant("acct2", 2, "cs_dup");
    const b = await grant("acct2", 2, "cs_dup");
    const c = await grant("acct2", 12, "cs_other");

    expect(a).toBe(2);
    expect(b).toBe(2);
    expect(c).toBe(14);

    const ledger = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, "acct2"));
    expect(ledger).toHaveLength(2);
  });

  test("grant on a missing user row fails without granting credits", async () => {
    await expect(grant("nobody", 5, "cs_ghost")).rejects.toThrow();

    const ledger = await db.select().from(transactions);
    expect(ledger).toHaveLength(0);
  });

  test("refund on a missing user row throws UserNotFoundError", async () => {
    await expect(refund("nobody", 1)).rejects.toThrow(/User not found/);
  });
});
