export type ShowcaseSet = {
  id: string;
  app: string;
  category: string;
  preset: "soft_bright" | "dark_premium" | "clean_minimal" | "bold_playful";
  /** Tagline used as the headline on Shot 1 */
  tagline: string;
  /** Short headlines for shots 2/3/4 */
  shots: [string, string, string];
};

/**
 * Sample sets shown in the landing-page marquee. Replace with real generated
 * outputs once we have a curated batch — the structure is what each Marquee
 * card renders.
 */
export const SHOWCASE_SETS: ShowcaseSet[] = [
  {
    id: "lumen",
    app: "Lumen",
    category: "wellness",
    preset: "soft_bright",
    tagline: "A calmer morning, every morning",
    shots: ["Track your mood", "Breathe with us", "Sleep deeper"],
  },
  {
    id: "ledger",
    app: "Ledger",
    category: "finance",
    preset: "dark_premium",
    tagline: "Money, finally readable",
    shots: ["Net worth at a glance", "Spending by tag", "Forecast next month"],
  },
  {
    id: "clear",
    app: "Clear",
    category: "productivity",
    preset: "clean_minimal",
    tagline: "Plan less. Ship more.",
    shots: ["One list per day", "Capture in seconds", "Weekly review built-in"],
  },
  {
    id: "smash",
    app: "Smash!",
    category: "games",
    preset: "bold_playful",
    tagline: "Three taps to chaos",
    shots: ["Match & smash", "Daily tournaments", "Beat your friends"],
  },
  {
    id: "graft",
    app: "Graft",
    category: "dev tools",
    preset: "dark_premium",
    tagline: "Postgres queries that read themselves",
    shots: ["Inline EXPLAIN", "Diff two schemas", "Share a query link"],
  },
  {
    id: "pace",
    app: "Pace",
    category: "lifestyle",
    preset: "soft_bright",
    tagline: "Walk further, somehow",
    shots: ["Streaks that stick", "Routes near you", "Cheer your group"],
  },
  {
    id: "tutor",
    app: "Tutor",
    category: "education",
    preset: "clean_minimal",
    tagline: "One-on-one, on demand",
    shots: ["Match an expert", "Whiteboard built-in", "Recap every session"],
  },
  {
    id: "sticker",
    app: "Sticker Studio",
    category: "creator tools",
    preset: "bold_playful",
    tagline: "Make it stick",
    shots: ["AI cut-outs", "Pack templates", "Export anywhere"],
  },
];
