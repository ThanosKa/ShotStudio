import type { NextRequest } from "next/server";
import { z } from "zod";
import { runGeneration } from "@/lib/generation";
import { STYLE_PRESET_IDS } from "@/lib/generation/presets";
import { jsonError } from "@/lib/http";
import { generationRateLimit } from "@/lib/ratelimit";
import { withAuthenticatedUser } from "@/lib/route-auth";
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

export async function POST(req: NextRequest) {
  return withAuthenticatedUser(
    { action: "generations.create", rateLimit: generationRateLimit },
    async ({ userId, log }) => {
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
        screenshotFiles.push(f);
      }

      const startedAt = Date.now();
      const outcome = await runGeneration({
        userId,
        appName: input.appName,
        tagline: input.tagline,
        category: input.category,
        stylePreset: input.stylePreset,
        screenshots: [screenshotFiles[0], screenshotFiles[1], screenshotFiles[2]],
      });
      const durationMs = Date.now() - startedAt;

      switch (outcome.kind) {
        case "ok":
          log.info(
            { generationId: outcome.generationId, durationMs },
            "generation complete",
          );
          return Response.json({
            generationId: outcome.generationId,
            imageUrls: outcome.imageUrls,
          });
        case "invalid_input":
          return jsonError(400, outcome.message);
        case "insufficient_credits":
          return jsonError(402, "Insufficient credits.");
        case "user_not_ready":
          log.warn("user not ready at debit");
          return jsonError(409, "Account not ready — please retry in a moment.");
        case "failed_and_refunded":
          log.error({ reason: outcome.reason, durationMs }, "generation failed");
          return jsonError(502, "Generation failed. Your credit has been refunded.");
      }
    },
  );
}
