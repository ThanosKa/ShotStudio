import type { StylePreset } from "./presets";

export type ShotRole = "title" | "hero_feature" | "differentiator" | "another_feature";

export type ShotInput = {
  appName: string;
  tagline: string;
  category: string;
  role: ShotRole;
  headline?: string;
  preset: StylePreset;
};

export function buildPrompt(input: ShotInput): string {
  // Placeholder. Real prompts iterated during pre-launch QA.
  return `App Store screenshot, ${input.preset.toneModifier}.
Typography: ${input.preset.typography}.
Palette: ${input.preset.palette.join(", ")}.
App: ${input.appName} (${input.category}).
Role: ${input.role}.
${input.role === "title" ? `Headline: ${input.tagline}` : input.headline ? `Headline: ${input.headline}` : ""}
1290x2796 portrait, no watermarks.`;
}
