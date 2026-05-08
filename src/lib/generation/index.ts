import { generateImage } from "../openrouter";
import { STYLE_PRESETS, type StylePresetId } from "./presets";
import { buildPrompt, type ShotRole } from "./prompts";
import { upscaleToAppStore } from "./upscale";

export type GenerateInput = {
  appName: string;
  tagline: string;
  category: string;
  stylePreset: StylePresetId;
  /**
   * 3 user-uploaded screenshots as data URLs. Mapped to roles in this order:
   * [hero_feature, differentiator, another_feature]. The "title" shot has no reference.
   */
  screenshots: [string, string, string];
};

const ROLES: ShotRole[] = ["title", "hero_feature", "differentiator", "another_feature"];

function referencesForRole(role: ShotRole, screenshots: GenerateInput["screenshots"]): string[] {
  switch (role) {
    case "title":
      return [];
    case "hero_feature":
      return [screenshots[0]];
    case "differentiator":
      return [screenshots[1]];
    case "another_feature":
      return [screenshots[2]];
  }
}

async function runShot(input: GenerateInput, role: ShotRole) {
  const preset = STYLE_PRESETS[input.stylePreset];
  const prompt = buildPrompt({
    appName: input.appName,
    tagline: input.tagline,
    category: input.category,
    role,
    preset,
  });
  const referenceImages = referencesForRole(role, input.screenshots);

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const b64 = await generateImage({ prompt, referenceImages });
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
    ROLES.map((role) => runShot(input, role)),
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    throw new Error(
      `Generation failed: ${failures.length}/4 shots failed`,
    );
  }

  return results.map((r) => (r as PromiseFulfilledResult<string>).value);
}
