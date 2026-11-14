import type { Logger } from "pino";
import { generateImage } from "@/lib/openrouter";
import { STYLE_PRESETS, type StylePresetId } from "./presets";
import { buildPrompt, type ShotRole } from "./prompts";
import { upscaleToAppStore } from "@/lib/generation/upscale";

// Server only: it imports the OpenRouter adapter, which throws at import
// without its key. Never import it from client code. No database here.

export type Brief = {
  appName: string;
  pitch: string;
  audience?: string;
  category: string;
  stylePreset: StylePresetId;
  /** Data URLs, in Shot Role order. */
  referenceScreenshots: readonly [string, string, string];
};

export type SetOutcome =
  | { kind: "ok"; shots: string[] } // 1290x2796 PNG data URLs, in ACTIVE_ROLES order
  | { kind: "failed"; failed: number; total: number };

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
    screenshotDataUrls: readonly [string, string, string];
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

/** No database, never throws. Up to 2 attempts per Shot. One failed Shot fails the Set. */
export async function generateSet(brief: Brief, log: Logger): Promise<SetOutcome> {
  const results = await Promise.allSettled(
    ACTIVE_ROLES.map((role) =>
      runShot(
        role,
        {
          appName: brief.appName,
          pitch: brief.pitch,
          audience: brief.audience,
          category: brief.category,
          stylePreset: brief.stylePreset,
          screenshotDataUrls: brief.referenceScreenshots,
        },
        log,
      ),
    ),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    return { kind: "failed", failed: failed.length, total: ACTIVE_ROLES.length };
  }
  return {
    kind: "ok",
    shots: results.map((r) => (r as PromiseFulfilledResult<string>).value),
  };
}
