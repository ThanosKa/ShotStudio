import { eq } from "drizzle-orm";
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
