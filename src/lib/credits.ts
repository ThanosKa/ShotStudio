import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { transactions, users } from "./db/schema";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits");
    this.name = "InsufficientCreditsError";
  }
}

export async function debit(userId: string, n: number, metadata?: Record<string, unknown>) {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} - ${n}` })
      .where(sql`${users.id} = ${userId} AND ${users.credits} >= ${n}`)
      .returning({ credits: users.credits });

    if (updated.length === 0) throw new InsufficientCreditsError();

    await tx.insert(transactions).values({
      userId,
      type: "usage",
      amount: -n,
      metadata: metadata ?? null,
    });

    return updated[0].credits;
  });
}

export async function refund(userId: string, n: number, metadata?: Record<string, unknown>) {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${n}` })
      .where(eq(users.id, userId))
      .returning({ credits: users.credits });

    await tx.insert(transactions).values({
      userId,
      type: "refund",
      amount: n,
      metadata: metadata ?? null,
    });

    return updated[0].credits;
  });
}

export async function grant(userId: string, n: number, stripePaymentId: string) {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} + ${n}` })
      .where(eq(users.id, userId))
      .returning({ credits: users.credits });

    await tx.insert(transactions).values({
      userId,
      type: "purchase",
      amount: n,
      stripePaymentId,
    });

    return updated[0].credits;
  });
}
