import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";

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
