import type { StylePreset } from "./presets";

export type ShotRole = "hero_feature" | "differentiator" | "another_feature";

export type ShotInput = {
  appName: string;
  headline: string;
  pitch: string;
  audience?: string;
  category: string;
  role: ShotRole;
  preset: StylePreset;
};

/**
 * Theme + palette come from the attached reference screenshot, not the preset.
 * The reference is sent alongside the text prompt to OpenRouter (see
 * `lifecycle.ts` `referenceImages`), so the model can see the user's actual
 * app pixels and match their light/dark theme + dominant accent colors directly.
 *
 * The preset only contributes typography + headline voice.
 */
export function buildPrompt(input: ShotInput): string {
  const lines = [
    `App Store screenshot for "${input.appName}" (${input.category}), role: ${input.role}.`,
    `Headline voice: ${input.preset.voice}.`,
    `Typography: ${input.preset.typography}.`,
    `Tagline: ${input.headline}.`,
    `What it does: ${input.pitch}.`,
    input.audience ? `For: ${input.audience}.` : null,
    "A reference screenshot is attached — frame the app's UI inside a stylised device mockup.",
    "Match the theme (light vs dark) and dominant palette of the attached reference. Sample 1-2 accent colors from it and use them sparingly for chips, charts, or buttons. Never force a theme that conflicts with the reference (no dark backdrops behind a light app, no light backdrops behind a dark app).",
    "Portrait orientation, no watermarks.",
  ];
  return lines.filter(Boolean).join("\n");
}
