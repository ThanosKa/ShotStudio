import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { InsufficientCreditsError, refund, UserNotFoundError } from "@/lib/credits";
import {
  debitAndStartGeneration,
  getEmailAndEnsureUser,
  markGenerationComplete,
  markGenerationFailed,
} from "@/lib/db/queries";
import { generate } from "@/lib/generation";
import { STYLE_PRESET_IDS } from "@/lib/generation/presets";
import { jsonError } from "@/lib/http";
import { logger } from "@/lib/logger";
import { generationRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { taglineSchema } from "@/lib/validation/tagline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const Body = z.object({
  appName: z.string().min(1).max(60),
  tagline: taglineSchema,
  category: z.string().min(1),
  stylePreset: z.enum(STYLE_PRESET_IDS),
});

const ALLOWED_MIME = ["image/jpeg", "image/png"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "Unauthorized");

  const requestId = crypto.randomUUID();
  const log = logger.child({ action: "generations.create", requestId, userId });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return jsonError(400, "Expected multipart/form-data");
  }

  const parsed = Body.safeParse({
    appName: formData.get("appName"),
    tagline: formData.get("tagline"),
    category: formData.get("category"),
    stylePreset: formData.get("stylePreset"),
  });
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }
  const input = parsed.data;

  const screenshotFiles: File[] = [];
  for (let i = 0; i < 3; i++) {
    const f = formData.get(`screenshot_${i}`);
    if (!(f instanceof File)) {
      return jsonError(400, `Missing screenshot_${i}`);
    }
    if (!ALLOWED_MIME.includes(f.type)) {
      return jsonError(400, "Screenshots must be JPEG or PNG.");
    }
    if (f.size > MAX_FILE_BYTES) {
      return jsonError(400, "Screenshot too large after compression.");
    }
    screenshotFiles.push(f);
  }

  const rl = await generationRateLimit.limit(userId);
  if (!rl.success) {
    return jsonError(429, "Too many generations — try again later.", {
      headers: {
        ...rateLimitHeaders(rl),
        "Retry-After": String(Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000))),
      },
    });
  }

  // JIT user sync — closes the Clerk-vs-Stripe webhook race.
  await getEmailAndEnsureUser(userId);

  let generationId: string;
  try {
    const started = await debitAndStartGeneration({
      userId,
      appName: input.appName,
      stylePreset: input.stylePreset,
      category: input.category,
    });
    generationId = started.generationId;
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(402, "Insufficient credits.");
    }
    if (err instanceof UserNotFoundError) {
      log.error({ err }, "user not found at debit");
      return jsonError(409, "Account not ready — please retry in a moment.");
    }
    log.error({ err }, "debit/start failed");
    return jsonError(500, "Server error");
  }

  const screenshotDataUrls = (await Promise.all(
    screenshotFiles.map(async (f) => {
      const buf = Buffer.from(await f.arrayBuffer());
      return `data:${f.type};base64,${buf.toString("base64")}`;
    }),
  )) as [string, string, string];
  // Release ~5MB-per-file File handles before the long-running generate() await.
  screenshotFiles.length = 0;

  try {
    const imageUrls = await generate({
      appName: input.appName,
      tagline: input.tagline,
      category: input.category,
      stylePreset: input.stylePreset,
      screenshots: screenshotDataUrls,
    });

    await markGenerationComplete(generationId);

    log.info({ generationId }, "generation complete");
    return Response.json({ generationId, imageUrls });
  } catch (err) {
    log.error({ err, generationId }, "generation failed");
    await markGenerationFailed(
      generationId,
      err instanceof Error ? err.message : "unknown",
    );
    try {
      await refund(userId, 1, { reason: "generation_failed", generationId });
    } catch (refundErr) {
      log.error({ err: refundErr, generationId }, "refund failed");
    }
    return jsonError(502, "Generation failed. Your credit has been refunded.");
  }
}
