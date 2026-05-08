import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { debit, InsufficientCreditsError, refund } from "@/lib/credits";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { generate } from "@/lib/generation";
import { logger } from "@/lib/logger";
import { generationRateLimit } from "@/lib/ratelimit";

export const maxDuration = 300;

const Body = z.object({
  appName: z.string().min(1).max(60),
  tagline: z
    .string()
    .min(1)
    .refine((s) => {
      const w = s.trim().split(/\s+/).filter(Boolean).length;
      return w >= 5 && w <= 10;
    }, "Tagline must be 5–10 words"),
  category: z.string().min(1),
  stylePreset: z.enum([
    "soft_bright",
    "dark_premium",
    "clean_minimal",
    "bold_playful",
  ]),
});

const ALLOWED_MIME = ["image/jpeg", "image/png"];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file after client compression

function jsonError(status: number, error: string, init?: ResponseInit) {
  return Response.json({ error }, { status, ...init });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "Unauthorized");

  const log = logger.child({ action: "generations.create", userId });

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
      headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
    });
  }

  try {
    await debit(userId, 1, { reason: "generation" });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(402, "Insufficient credits.");
    }
    log.error({ err }, "debit failed");
    return jsonError(500, "Server error");
  }

  const [row] = await db
    .insert(generations)
    .values({
      userId,
      appName: input.appName,
      stylePreset: input.stylePreset,
      category: input.category,
      status: "pending",
    })
    .returning({ id: generations.id });
  const generationId = row.id;

  const screenshotDataUrls = (await Promise.all(
    screenshotFiles.map(async (f) => {
      const buf = Buffer.from(await f.arrayBuffer());
      return `data:${f.type};base64,${buf.toString("base64")}`;
    }),
  )) as [string, string, string];

  try {
    const imageUrls = await generate({
      appName: input.appName,
      tagline: input.tagline,
      category: input.category,
      stylePreset: input.stylePreset,
      screenshots: screenshotDataUrls,
    });

    await db
      .update(generations)
      .set({ status: "complete", completedAt: new Date() })
      .where(eq(generations.id, generationId));

    log.info({ generationId }, "generation complete");
    return Response.json({ generationId, imageUrls });
  } catch (err) {
    log.error({ err, generationId }, "generation failed");
    await db
      .update(generations)
      .set({
        status: "failed",
        failureReason: err instanceof Error ? err.message : "unknown",
        completedAt: new Date(),
      })
      .where(eq(generations.id, generationId));
    await refund(userId, 1, { reason: "generation_failed", generationId });
    return jsonError(502, "Generation failed. Your credit has been refunded.");
  }
}
