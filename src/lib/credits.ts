import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { transactions, users } from "./db/schema";

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

export async function debit(
  userId: string,
  n: number,
  metadata?: Record<string, unknown>,
) {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} - ${n}` })
      .where(sql`${users.id} = ${userId} AND ${users.credits} >= ${n}`)
      .returning({ credits: users.credits });

    if (updated.length === 0) {
      const [exists] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!exists) throw new UserNotFoundError(userId);
      throw new InsufficientCreditsError();
    }

    await tx.insert(transactions).values({
      userId,
      type: "usage",
      amount: -n,
      metadata: metadata ?? null,
    });

    return updated[0].credits;
  });
}

export async function refund(
  userId: string,
  n: number,
  metadata?: Record<string, unknown>,
) {
  return db.transaction(async (tx) => {
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
 * is granted twice, the second call is a no-op and returns the current balance.
 */
export async function grant(
  userId: string,
  n: number,
  stripePaymentId: string,
) {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(transactions)
      .values({
        userId,
        type: "purchase",
        amount: n,
        stripePaymentId,
      })
      .onConflictDoNothing({ target: transactions.stripePaymentId })
      .returning({ id: transactions.id });

    if (inserted.length === 0) {
      const [u] = await tx
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!u) throw new UserNotFoundError(userId);
      return u.credits;
    }

    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${n}` })
      .where(eq(users.id, userId))
      .returning({ credits: users.credits });

    if (updated.length === 0) throw new UserNotFoundError(userId);
    return updated[0].credits;
  });
}
