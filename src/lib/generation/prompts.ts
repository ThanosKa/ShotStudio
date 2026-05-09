import type { StylePreset } from "./presets";

export type ShotRole = "title" | "hero_feature" | "differentiator" | "another_feature";

export type ShotInput = {
  appName: string;
  tagline: string;
  category: string;
  role: ShotRole;
  preset: StylePreset;
};

export function buildPrompt(input: ShotInput): string {
  const referenceLine =
    input.role === "title"
      ? "No reference image provided — invent a hero composition."
      : "A reference screenshot is attached — frame the app's UI inside a stylised device mockup.";
  return `App Store screenshot, ${input.preset.toneModifier}.
Typography: ${input.preset.typography}.
Palette: ${input.preset.palette.join(", ")}.
App: ${input.appName} (${input.category}).
Role: ${input.role}.
${input.role === "title" ? `Headline: ${input.tagline}` : ""}
${referenceLine}
Portrait orientation, no watermarks.`;
}
