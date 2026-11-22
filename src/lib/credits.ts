import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db/schema";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits");
    this.name = "InsufficientCreditsError";
  }
}

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = "UserNotFoundError";
  }
}

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Takes one Credit and writes a `usage` Transaction of -1, directly inside the
 * caller's transaction (no savepoint): a Debit never happens alone, only
 * together with the Generation it pays for. Throws InsufficientCreditsError or
 * UserNotFoundError. Returns the new balance.
 */
export async function debit({
  userId,
  metadata,
  within,
}: {
  userId: string;
  metadata: Record<string, unknown>;
  within: Tx;
}): Promise<number> {
  const updated = await within
    .update(users)
    .set({ credits: sql`${users.credits} - 1` })
    .where(sql`${users.id} = ${userId} AND ${users.credits} >= 1`)
    .returning({ credits: users.credits });

  if (updated.length === 0) {
    const [exists] = await within
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!exists) throw new UserNotFoundError(userId);
    throw new InsufficientCreditsError();
  }

  await within.insert(transactions).values({
    userId,
    type: "usage",
    amount: -1,
    metadata,
  });

  return updated[0].credits;
}

/**
 * Pass `within` to make the Refund part of a caller's transaction (it runs as a
 * savepoint), so it commits or rolls back together with the caller's own writes.
 */
export async function refund({
  userId,
  n,
  metadata,
  within,
}: {
  userId: string;
  n: number;
  metadata?: Record<string, unknown>;
  within?: Tx;
}) {
  return (within ?? db).transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${n}` })
      .where(eq(users.id, userId))
      .returning({ credits: users.credits });

    if (updated.length === 0) throw new UserNotFoundError(userId);

    await tx.insert(transactions).values({
      userId,
      type: "refund",
      amount: n,
      metadata: metadata ?? null,
    });

    return updated[0].credits;
  });
}

/**
 * Idempotent on `stripePaymentId` via the unique index. If the same payment id
 * is granted twice, the second call changes nothing and returns
 * `granted: false` with the current balance.
 */
export async function grant({
  userId,
  n,
  stripePaymentId,
}: {
  userId: string;
  n: number;
  stripePaymentId: string;
}): Promise<{ granted: boolean; balance: number }> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(transactions)
      .values({
        userId,
        type: "purchase",
        amount: n,
        stripePaymentId,
      })
      .onConflictDoNothing({
        target: transactions.stripePaymentId,
        // Required: matches the partial unique index's WHERE clause so
        // Postgres' arbiter inference can find it.
        where: sql`${transactions.stripePaymentId} is not null`,
      })
      .returning({ id: transactions.id });

    if (inserted.length === 0) {
      const [u] = await tx
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!u) throw new UserNotFoundError(userId);
      return { granted: false, balance: u.credits };
    }

    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${n}` })
      .where(eq(users.id, userId))
      .returning({ credits: users.credits });

    if (updated.length === 0) throw new UserNotFoundError(userId);
    return { granted: true, balance: updated[0].credits };
  });
}
