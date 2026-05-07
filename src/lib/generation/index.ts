import { generateImage } from "../openrouter";
import { STYLE_PRESETS, type StylePresetId } from "./presets";
import { buildPrompt, type ShotRole } from "./prompts";
import { upscaleToAppStore } from "./upscale";

export type GenerateInput = {
  appName: string;
  tagline: string;
  category: string;
  stylePreset: StylePresetId;
  headlines?: [string?, string?, string?];
};

const ROLES: ShotRole[] = ["title", "hero_feature", "differentiator", "another_feature"];

async function runShot(input: GenerateInput, role: ShotRole, index: number) {
  const preset = STYLE_PRESETS[input.stylePreset];
  const prompt = buildPrompt({
    appName: input.appName,
    tagline: input.tagline,
    category: input.category,
    role,
    headline: index > 0 ? input.headlines?.[index - 1] : undefined,
    preset,
  });

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const b64 = await generateImage({ prompt, size: "1024x1536" });
      const png = await upscaleToAppStore(b64);
      return `data:image/png;base64,${png.toString("base64")}`;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
    }
  }
  throw lastError;
}

export async function generate(input: GenerateInput): Promise<string[]> {
  const results = await Promise.allSettled(
    ROLES.map((role, idx) => runShot(input, role, idx)),
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    throw new Error(
      `Generation failed: ${failures.length}/4 shots failed`,
    );
  }

  return results.map((r) => (r as PromiseFulfilledResult<string>).value);
}
