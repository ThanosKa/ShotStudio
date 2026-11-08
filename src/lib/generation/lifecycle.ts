import { and, asc, eq, lt, sql } from "drizzle-orm";
import type { Logger } from "pino";
import { InsufficientCreditsError, refund, UserNotFoundError } from "@/lib/credits";
import { db, keepRequestAliveUntil } from "@/lib/db";
import { markGenerationComplete } from "@/lib/db/queries";
import { generations, transactions, users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { generateImage } from "@/lib/openrouter";
import { STYLE_PRESETS, type StylePresetId } from "./presets";
import { buildPrompt, type ShotRole } from "./prompts";
import { upscaleToAppStore } from "@/lib/generation/upscale";

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

const ALLOWED_SCREENSHOT_MIME = ["image/jpeg", "image/png"] as const;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

function validateScreenshots(
  files: readonly File[],
): { kind: "invalid_input"; message: string } | null {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!ALLOWED_SCREENSHOT_MIME.includes(f.type as (typeof ALLOWED_SCREENSHOT_MIME)[number])) {
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
 * Atomic: decrement one credit, write the matching `usage` Transaction, and
 * insert the Pending Generation row in one DB transaction. Throws
 * InsufficientCreditsError or UserNotFoundError; never partially applied.
 */
async function debitAndStartGeneration(
  input: Omit<RunGenerationInput, "pitch" | "audience" | "screenshots">,
): Promise<{ generationId: string }> {
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

const ROLES: ShotRole[] = [
  "hero_feature",
  "differentiator",
  "another_feature",
];

// In dev, run just one shot (hero_feature) to save time and cost while iterating.
const ACTIVE_ROLES: ShotRole[] =
  process.env.NODE_ENV === "development" ? ["hero_feature"] : ROLES;

const REF_INDEX: Record<ShotRole, number> = {
  hero_feature: 0,
  differentiator: 1,
  another_feature: 2,
};

async function runShot(
  role: ShotRole,
  ctx: {
    appName: string;
    pitch: string;
    audience?: string;
    category: string;
    stylePreset: StylePresetId;
    screenshotDataUrls: [string, string, string];
  },
  log: Logger,
): Promise<string> {
  const preset = STYLE_PRESETS[ctx.stylePreset];
  const prompt = buildPrompt({
    appName: ctx.appName,
    pitch: ctx.pitch,
    audience: ctx.audience,
    category: ctx.category,
    role,
    preset,
  });
  const idx = REF_INDEX[role];
  const referenceImages = [ctx.screenshotDataUrls[idx]];

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const b64 = await generateImage({ prompt, referenceImages, imageSize: "1K" });
      const png = await upscaleToAppStore(b64);
      return `data:image/png;base64,${png.toString("base64")}`;
    } catch (err) {
      lastError = err;
      log.warn({ err, role, attempt }, "shot attempt failed");
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    }
  }
  log.error({ err: lastError, role }, "shot exhausted retries");
  throw lastError;
}

/**
 * Fails a `pending` Generation and refunds its Credit in one transaction.
 * Returns false, and changes nothing, when the row is no longer `pending`: the
 * other path (the run itself or the abandoned sweep) already settled it.
 */
async function failAndRefund(
  generation: { id: string; userId: string },
  failureReason: string,
  refundReason: "generation_failed" | "generation_abandoned",
): Promise<boolean> {
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
    await refund(generation.userId, 1, { reason: refundReason, generationId: generation.id }, tx);
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
      const done = await failAndRefund(
        generation,
        "Abandoned: no outcome was recorded",
        "generation_abandoned",
      );
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

  const screenshotDataUrls = (await Promise.all(
    input.screenshots.map(async (f) => {
      const buf = Buffer.from(await f.arrayBuffer());
      return `data:${f.type};base64,${buf.toString("base64")}`;
    }),
  )) as [string, string, string];
  // Release ~5MB-per-file File handles before the long-running shot calls.
  (input.screenshots as File[]).length = 0;

  const results = await Promise.allSettled(
    ACTIVE_ROLES.map((role) =>
      runShot(
        role,
        {
          appName: input.appName,
          pitch: input.pitch,
          audience: input.audience,
          category: input.category,
          stylePreset: input.stylePreset,
          screenshotDataUrls,
        },
        shotLog,
      ),
    ),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    const reason = `Generation failed: ${failed.length}/${ACTIVE_ROLES.length} shots failed`;
    try {
      await failAndRefund({ id: generationId, userId: input.userId }, reason, "generation_failed");
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
    imageUrls: results.map((r) => (r as PromiseFulfilledResult<string>).value),
  };
}
