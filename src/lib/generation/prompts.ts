import type { StylePreset } from "./presets";

export type ShotRole = "hero_feature" | "differentiator" | "another_feature";

export type ShotInput = {
  appName: string;
  pitch: string;
  audience?: string;
  category: string;
  role: ShotRole;
  preset: StylePreset;
};

const ROLE_INTENT: Record<ShotRole, string> = {
  hero_feature: "the hook — lead with the single biggest outcome the app delivers",
  differentiator: "the journey — show one specific action the app makes effortless",
  another_feature: "the closer — supporting feature or moment of trust",
};

function stripTrailingPunctuation(s: string): string {
  return s.replace(/[.!?]+$/u, "").trimEnd();
}

/**
 * Theme + palette come from the attached reference screenshot, not the preset.
 * The reference is sent alongside the text prompt to OpenRouter (see
 * `lifecycle.ts` `referenceImages`), so the model can see the user's actual
 * app pixels and matches their light/dark theme + dominant accent colors directly.
 *
 * The preset only contributes typography + headline voice. The image model
 * writes and renders the marketing tagline itself based on the pitch, role,
 * and voice — no separate text pre-pass.
 */
export function buildPrompt(input: ShotInput): string {
  const pitch = stripTrailingPunctuation(input.pitch);
  const audience = input.audience ? stripTrailingPunctuation(input.audience) : undefined;
  const lines = [
    `App Store screenshot for "${input.appName}" (${input.category}).`,
    `Shot role: ${input.role} — ${ROLE_INTENT[input.role]}.`,
    `What the app does: ${pitch}.`,
    audience ? `For: ${audience}.` : null,
    "A reference screenshot of the real app UI is attached. Use it as the visual source of truth — colors, layout, typography, real UI elements. Do NOT invent new UI.",
    "Render the app's screen inside a modern iPhone 16 Pro device mockup: slim uniform bezels, Dynamic Island, titanium frame, no home button. Keep the device at its natural proportions — do not stretch vertically. Center the phone with breathing room above and below.",
    "Match the theme (light vs dark) and dominant palette of the attached reference. Sample 1-2 accent colors and use them sparingly for chips, buttons, highlights. Never force a theme that conflicts with the reference (no dark backdrops behind a light app, no light backdrops behind a dark app).",
    `Write a punchy 2-7 word marketing tagline rendered prominently above the device. Voice: ${input.preset.voice}.`,
    `Typography: ${input.preset.typography}.`,
    "Portrait orientation. No watermarks. No fake App Store badges. No fake status bars added on top of the real one. Do not crop the device. Do not stretch the iPhone.",
    "Safe area: keep ALL text (tagline, any labels) and the entire device fully within the centre 80% of the canvas. Leave at least 10% empty padding on the left edge and 10% on the right edge — the final image is cropped to a narrower aspect ratio and anything near the side edges will be cut off.",
  ];
  return lines.filter(Boolean).join("\n");
}
