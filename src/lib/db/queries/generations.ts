import { and, eq, lt, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { InsufficientCreditsError, UserNotFoundError } from "@/lib/credits";
import { db } from "../index";
import { generations, transactions, users } from "../schema";

type NewGeneration = Pick<
  InferInsertModel<typeof generations>,
  "userId" | "appName" | "stylePreset" | "category"
>;

/**
 * Atomic: debit one credit and insert a pending generation row in the same
 * transaction. Throws InsufficientCreditsError or UserNotFoundError on failure.
 */
export async function debitAndStartGeneration(input: NewGeneration) {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(users)
      .set({ credits: sql`${users.credits} - 1` })
      .where(sql`${users.id} = ${input.userId} AND ${users.credits} >= 1`)
      .returning({ credits: users.credits });

    if (updated.length === 0) {
      const [exists] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);
      if (!exists) throw new UserNotFoundError(input.userId);
      throw new InsufficientCreditsError();
    }

    await tx.insert(transactions).values({
      userId: input.userId,
      type: "usage",
      amount: -1,
      metadata: { reason: "generation" },
    });

    const [row] = await tx
      .insert(generations)
      .values({ ...input, status: "pending" })
      .returning({ id: generations.id });

    return { generationId: row.id, balance: updated[0].credits };
  });
}

export async function markGenerationComplete(generationId: string) {
  await db
    .update(generations)
    .set({ status: "complete", completedAt: new Date() })
    .where(eq(generations.id, generationId));
}

export async function markGenerationFailed(
  generationId: string,
  reason: string,
) {
  await db
    .update(generations)
    .set({
      status: "failed",
      failureReason: reason.slice(0, 1000),
      completedAt: new Date(),
    })
    .where(eq(generations.id, generationId));
}

/**
 * Atomically transition a single still-pending generation to failed, returning
 * the row only if the transition actually occurred. Idempotent: a concurrent
 * caller will see 0 rows. Caller should refund the credit only on a returned row.
 */
export async function reapStalePending(olderThan: Date) {
  return db
    .update(generations)
    .set({
      status: "failed",
      failureReason: "timeout: marked failed by reconciler",
      completedAt: new Date(),
    })
    .where(
      and(eq(generations.status, "pending"), lt(generations.createdAt, olderThan)),
    )
    .returning({ id: generations.id, userId: generations.userId });
}
