import type { StylePreset } from "./presets";

export type ShotRole = "title" | "hero_feature" | "differentiator" | "another_feature";

export type ShotInput = {
  appName: string;
  headline: string;
  pitch: string;
  audience?: string;
  category: string;
  role: ShotRole;
  preset: StylePreset;
};

export function buildPrompt(input: ShotInput): string {
  const lines = [
    `App Store screenshot, ${input.preset.toneModifier}.`,
    `Typography: ${input.preset.typography}.`,
    `Palette: ${input.preset.palette.join(", ")}.`,
    `App: ${input.appName} (${input.category}).`,
    `What it does: ${input.pitch}.`,
    input.audience ? `For: ${input.audience}.` : null,
    `Role: ${input.role}.`,
    input.role === "title"
      ? `Headline: ${input.headline}`
      : "A reference screenshot is attached — frame the app's UI inside a stylised device mockup.",
    input.role === "title"
      ? "No reference image provided — invent a hero composition."
      : null,
    "Portrait orientation, no watermarks.",
  ];
  return lines.filter(Boolean).join("\n");
}
