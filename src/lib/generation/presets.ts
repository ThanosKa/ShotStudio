/**
 * Style presets define **personality only** — typography + headline voice.
 *
 * Theme (light vs dark) and palette (specific accent colors) are NOT bundled
 * into presets. They come from the user's uploaded screenshots, which we
 * attach to the OpenRouter call as reference images. The model sees the
 * actual app pixels and matches them directly — a light app stays light,
 * a dark app stays dark.
 */
export const STYLE_PRESET_IDS = [
  "friendly",
  "professional",
  "minimal",
  "bold",
] as const;

export type StylePresetId = (typeof STYLE_PRESET_IDS)[number];

export type StylePreset = {
  id: StylePresetId;
  label: string;
  /** Type-system feel for headlines and chrome. */
  typography: string;
  /** Headline-writing voice the AI uses for the marketing copy. */
  voice: string;
};

export const STYLE_PRESETS: Record<StylePresetId, StylePreset> = {
  friendly: {
    id: "friendly",
    label: "Friendly",
    typography: "rounded sans-serif, generous letter-spacing, warm and humane",
    voice: "warm, plainspoken, talks-to-a-peer",
  },
  professional: {
    id: "professional",
    label: "Professional",
    typography: "Inter or system sans, sharp, restrained, technical",
    voice: "confident, declarative, no fluff",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    typography: "restrained sans, plenty of whitespace, type does the work",
    voice: "considered, short sentences, calm",
  },
  bold: {
    id: "bold",
    label: "Bold",
    typography: "oversized display sans, sticker-energy, headlines first",
    voice: "punchy, direct, single verb hooks",
  },
};

export function formatCategory(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Default personality preset suggested for a given app category. The user can
 * override on the wizard. Theme/palette is upload-derived regardless of preset.
 */
export const CATEGORY_DEFAULT_PRESET: Record<string, StylePresetId> = {
  productivity: "minimal",
  wellness: "friendly",
  finance: "professional",
  games: "bold",
  social: "friendly",
  education: "minimal",
  lifestyle: "friendly",
  "dev tools": "professional",
  other: "minimal",
};
