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
  headlines: z
    .array(z.string().optional())
    .length(3)
    .optional(),
  screenshots: z.array(z.string()).length(3),
});

function jsonError(status: number, error: string, init?: ResponseInit) {
  return Response.json({ error }, { status, ...init });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "Unauthorized");

  const log = logger.child({ action: "generations.create", userId });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }
  const input = parsed.data;

  const rl = await generationRateLimit.limit(userId);
  if (!rl.success) {
    return jsonError(429, "Too many generations — try again later.", {
      headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
    });
  }

  for (const s of input.screenshots) {
    if (!s.startsWith("data:image/png") && !s.startsWith("data:image/jpeg")) {
      return jsonError(400, "Screenshots must be PNG or JPEG.");
    }
    if (s.length > 14_000_000) {
      return jsonError(400, "Screenshot too large (max ~10 MB).");
    }
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

  try {
    const imageUrls = await generate({
      appName: input.appName,
      tagline: input.tagline,
      category: input.category,
      stylePreset: input.stylePreset,
      headlines: input.headlines as
        | [string?, string?, string?]
        | undefined,
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
