export const STYLE_PRESET_IDS = [
  "soft_bright",
  "dark_premium",
  "clean_minimal",
  "bold_playful",
] as const;

export type StylePresetId = (typeof STYLE_PRESET_IDS)[number];

export type StylePreset = {
  id: StylePresetId;
  label: string;
  palette: string[];
  typography: string;
  toneModifier: string;
};

export const STYLE_PRESETS: Record<StylePresetId, StylePreset> = {
  soft_bright: {
    id: "soft_bright",
    label: "Soft & Bright",
    palette: ["#FFE5EC", "#FFC2D1", "#FF9EBB"],
    typography: "rounded sans-serif, friendly",
    toneModifier: "warm, inviting, soft pastel gradients",
  },
  dark_premium: {
    id: "dark_premium",
    label: "Dark & Premium",
    palette: ["#0B0B0F", "#1A1A22", "#7C5CFF"],
    typography: "Inter, sharp, professional",
    toneModifier: "charcoal background with single bright accent",
  },
  clean_minimal: {
    id: "clean_minimal",
    label: "Clean & Minimal",
    palette: ["#FFFFFF", "#F5F5F5", "#1F1F1F"],
    typography: "restrained sans, plenty of whitespace",
    toneModifier: "calm, focused, single accent color",
  },
  bold_playful: {
    id: "bold_playful",
    label: "Bold & Playful",
    palette: ["#FF3B30", "#FFD60A", "#34C759"],
    typography: "oversized display type, sticker energy",
    toneModifier: "saturated solids, high-energy, fun",
  },
};

export const CATEGORY_DEFAULT_PRESET: Record<string, StylePresetId> = {
  productivity: "clean_minimal",
  wellness: "soft_bright",
  finance: "dark_premium",
  games: "bold_playful",
  social: "soft_bright",
  education: "clean_minimal",
  lifestyle: "soft_bright",
  "dev tools": "dark_premium",
  other: "clean_minimal",
};
