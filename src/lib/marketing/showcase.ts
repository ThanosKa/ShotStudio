import type { StylePresetId } from "../generation/presets";

export type ShowcaseSet = {
  id: string;
  app: string;
  category: string;
  preset: StylePresetId;
  tagline: string;
  shots: [string, string, string];
  image: string;
};

export const SHOWCASE_SETS: ShowcaseSet[] = [
  {
    id: "lumen",
    app: "Lumen",
    category: "wellness",
    preset: "friendly",
    tagline: "A calmer morning, every morning",
    shots: ["5 minutes, every morning", "Sleep deeper tonight", "Track how you feel"],
    image: "/showcase/lumen.png",
  },
  {
    id: "sprout",
    app: "Sprout",
    category: "habits",
    preset: "friendly",
    tagline: "Tiny daily habits",
    shots: [
      "Build streaks that stick",
      "Your plant, growing daily",
      "See your week at a glance",
    ],
    image: "/showcase/sprout.png",
  },
  {
    id: "bloom",
    app: "Bloom",
    category: "plant ID",
    preset: "professional",
    tagline: "Snap a plant. Know it instantly.",
    shots: ["Snap. Identify. Learn.", "Care, simplified", "Your garden, in your pocket"],
    image: "/showcase/bloom.png",
  },
  {
    id: "margins",
    app: "Margins",
    category: "reading",
    preset: "minimal",
    tagline: "Every page, tracked",
    shots: ["Currently reading", "Your shelf, in 2026", "Your year, by the page"],
    image: "/showcase/margins.png",
  },
  {
    id: "made",
    app: "Made",
    category: "marketplace",
    preset: "bold",
    tagline: "Your stuff, sold",
    shots: ["Sell what you don't wear", "List in 30 seconds", "Cash out, weekly"],
    image: "/showcase/made.png",
  },
];
