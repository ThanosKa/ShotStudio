import { eq, sql } from "drizzle-orm";
import type { Logger } from "pino";
import { InsufficientCreditsError, refund, UserNotFoundError } from "@/lib/credits";
import { db } from "@/lib/db";
import {
  markGenerationComplete,
  markGenerationFailed,
} from "@/lib/db/queries";
import { generations, transactions, users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { generateImage } from "@/lib/openrouter";
import { synthesizeHeadline } from "./headline";
import { STYLE_PRESETS, type StylePresetId } from "./presets";
import { buildPrompt, type ShotRole } from "./prompts";
import { upscaleToAppStore } from "./upscale";

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

const REF_INDEX: Record<ShotRole, number> = {
  hero_feature: 0,
  differentiator: 1,
  another_feature: 2,
};

async function runShot(
  role: ShotRole,
  ctx: {
    appName: string;
    headline: string;
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
    headline: ctx.headline,
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
      const b64 = await generateImage({ prompt, referenceImages });
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

export async function runGeneration(
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

  const headline = await synthesizeHeadline(
    {
      appName: input.appName,
      pitch: input.pitch,
      audience: input.audience,
      category: input.category,
    },
    shotLog,
  );

  const results = await Promise.allSettled(
    ROLES.map((role) =>
      runShot(
        role,
        {
          appName: input.appName,
          headline,
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
    const reason = `Generation failed: ${failed.length}/3 shots failed`;
    await markGenerationFailed(generationId, reason);
    try {
      await refund(input.userId, 1, {
        reason: "generation_failed",
        generationId,
      });
    } catch (refundErr) {
      // Reconciler is the safety net; the user-facing outcome stays the same.
      shotLog.error(
        { err: refundErr },
        "inline refund failed; reconciler will retry",
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
