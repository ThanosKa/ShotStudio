import { and, asc, eq, lt } from "drizzle-orm";
import { debit, InsufficientCreditsError, refund, UserNotFoundError } from "@/lib/credits";
import { db, keepRequestAliveUntil } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import type { StylePresetId } from "./presets";
import { generateSet } from "./shot-set";

export type RunGenerationInput = {
  userId: string;
  appName: string;
  pitch: string;
  audience?: string;
  category: string;
  stylePreset: StylePresetId;
  screenshots: [File, File, File];
};

export type GenerationOutcome =
  | { kind: "ok"; generationId: string; imageUrls: string[] }
  | { kind: "invalid_input"; message: string }
  | { kind: "insufficient_credits" }
  | { kind: "user_not_ready" }
  | { kind: "failed_and_refunded"; reason: string };

const ALLOWED_SCREENSHOT_MIME: readonly string[] = ["image/jpeg", "image/png"];
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

function validateScreenshots(
  files: readonly File[],
): { kind: "invalid_input"; message: string } | null {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!ALLOWED_SCREENSHOT_MIME.includes(f.type)) {
      return { kind: "invalid_input", message: "Screenshots must be JPEG or PNG." };
    }
    if (f.size > MAX_SCREENSHOT_BYTES) {
      return {
        kind: "invalid_input",
        message: "Screenshot too large after compression.",
      };
    }
  }
  return null;
}

/**
 * Atomic: the Credit Ledger's Debit (one Credit and its `usage` Transaction)
 * and the Pending Generation row, in one DB transaction. Throws
 * InsufficientCreditsError or UserNotFoundError; never partially applied.
 */
async function debitAndStartGeneration(
  input: Omit<RunGenerationInput, "pitch" | "audience" | "screenshots">,
): Promise<{ generationId: string }> {
  return db.transaction(async (tx) => {
    await debit({ userId: input.userId, metadata: { reason: "generation" }, within: tx });

    const [row] = await tx
      .insert(generations)
      .values({
        userId: input.userId,
        appName: input.appName,
        stylePreset: input.stylePreset,
        category: input.category,
        status: "pending",
      })
      .returning({ id: generations.id });

    return { generationId: row.id };
  });
}

/** Only a `pending` row completes: one already failed and refunded stays so. */
async function markGenerationComplete(generationId: string) {
  await db
    .update(generations)
    .set({ status: "complete", completedAt: new Date() })
    .where(and(eq(generations.id, generationId), eq(generations.status, "pending")));
}

/**
 * Fails a `pending` Generation and refunds its Credit in one transaction.
 * Returns false, and changes nothing, when the row is no longer `pending`: the
 * other path (the run itself or the abandoned sweep) already settled it.
 */
async function failAndRefund({
  generation,
  failureReason,
  refundReason,
}: {
  generation: { id: string; userId: string };
  failureReason: string;
  refundReason: "generation_failed" | "generation_abandoned";
}): Promise<boolean> {
  return db.transaction(async (tx) => {
    const failed = await tx
      .update(generations)
      .set({
        status: "failed",
        failureReason: failureReason.slice(0, 1000),
        completedAt: new Date(),
      })
      .where(and(eq(generations.id, generation.id), eq(generations.status, "pending")))
      .returning({ id: generations.id });
    if (failed.length === 0) return false;
    await refund({ userId: generation.userId, n: 1, metadata: { reason: refundReason, generationId: generation.id }, within: tx });
    return true;
  });
}

/**
 * A run lasts at most about 4 minutes (two 120 s attempts per shot, in
 * parallel), and a Worker keeps it at most ~30 s after a disconnect. A row
 * still `pending` after this long has no run left to settle it.
 */
const ABANDONED_AFTER_MS = 10 * 60 * 1000;
const SWEEP_BATCH = 100;

/**
 * Refunds Generations whose run was stopped before it recorded an outcome
 * (a Worker cancelled on disconnect, or killed for CPU or memory). Runs from the
 * Worker's Cron Trigger. Returns how many it refunded.
 */
export async function refundAbandonedGenerations(
  cutoff: Date = new Date(Date.now() - ABANDONED_AFTER_MS),
): Promise<number> {
  const log = logger.child({ action: "generation.refund_abandoned" });
  const abandoned = await db
    .select({ id: generations.id, userId: generations.userId })
    .from(generations)
    .where(and(eq(generations.status, "pending"), lt(generations.createdAt, cutoff)))
    .orderBy(asc(generations.createdAt))
    .limit(SWEEP_BATCH);

  let refunded = 0;
  for (const generation of abandoned) {
    try {
      const done = await failAndRefund({
        generation,
        failureReason: "Abandoned: no outcome was recorded",
        refundReason: "generation_abandoned",
      });
      if (done) refunded++;
    } catch (err) {
      log.error({ err, generationId: generation.id }, "abandoned generation refund failed");
    }
  }
  if (refunded > 0) log.warn({ refunded }, "refunded abandoned generations");
  return refunded;
}

/**
 * On a Worker the whole run is handed to the request's `waitUntil`, so the
 * Refund on failure still happens when the visitor closes the tab mid-run.
 * Anything that outlives even that is caught by `refundAbandonedGenerations`.
 */
export function runGeneration(input: RunGenerationInput): Promise<GenerationOutcome> {
  const run = runGenerationToEnd(input);
  keepRequestAliveUntil(run);
  return run;
}

async function runGenerationToEnd(
  input: RunGenerationInput,
): Promise<GenerationOutcome> {
  const log = logger.child({
    action: "generation.run",
    userId: input.userId,
    stylePreset: input.stylePreset,
  });

  const invalid = validateScreenshots(input.screenshots);
  if (invalid) return invalid;

  let generationId: string;
  try {
    const started = await debitAndStartGeneration(input);
    generationId = started.generationId;
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return { kind: "insufficient_credits" };
    }
    if (err instanceof UserNotFoundError) {
      return { kind: "user_not_ready" };
    }
    throw err;
  }

  const shotLog = log.child({ generationId });
  shotLog.info("generation started");

  const toDataUrl = async (f: File) => {
    const buf = Buffer.from(await f.arrayBuffer());
    return `data:${f.type};base64,${buf.toString("base64")}`;
  };
  const screenshotDataUrls = await Promise.all([
    toDataUrl(input.screenshots[0]),
    toDataUrl(input.screenshots[1]),
    toDataUrl(input.screenshots[2]),
  ]);
  // Release ~5MB-per-file File handles before the long-running shot calls.
  input.screenshots.splice(0);

  const set = await generateSet({
    brief: {
      appName: input.appName,
      pitch: input.pitch,
      audience: input.audience,
      category: input.category,
      stylePreset: input.stylePreset,
      referenceScreenshots: screenshotDataUrls,
    },
    log: shotLog,
  });

  if (set.kind === "failed") {
    const reason = `Generation failed: ${set.failed}/${set.total} shots failed`;
    try {
      await failAndRefund({
        generation: { id: generationId, userId: input.userId },
        failureReason: reason,
        refundReason: "generation_failed",
      });
    } catch (refundErr) {
      // The row stays `pending`, so the abandoned sweep refunds it later.
      shotLog.error(
        { err: refundErr },
        "inline refund failed; the abandoned-generation sweep will retry it",
      );
    }
    return { kind: "failed_and_refunded", reason };
  }

  await markGenerationComplete(generationId);
  return {
    kind: "ok",
    generationId,
    imageUrls: set.shots,
  };
}
