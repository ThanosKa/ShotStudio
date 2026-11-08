import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";

/** Only a `pending` row completes: one already failed and refunded stays so. */
export async function markGenerationComplete(generationId: string) {
  await db
    .update(generations)
    .set({ status: "complete", completedAt: new Date() })
    .where(and(eq(generations.id, generationId), eq(generations.status, "pending")));
}
