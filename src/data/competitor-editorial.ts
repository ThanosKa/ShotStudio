import { CATEGORIES, type Category } from "@/data/categories";

/**
 * Editorial + internal-linking layer over `competitors.ts`.
 *
 * `competitors.ts` holds the comparison data (pricing, gaps, strengths, FAQ).
 * This file adds what the linking layer and the "I'm switching tonight"
 * reader need: the anchor phrase people actually search, a short factual
 * answer for the brand query itself, the concrete switch path, and which
 * category pages this competitor's audience should land on next.
 */

export type CompetitorEditorial = {
  /** Real query phrase. Used verbatim as internal-link anchor text. */
  anchor: string;
  /**
   * Two-sentence factual answer to the bare brand query ("appmockup"), placed
   * above the fold so the page earns the click instead of ranking silently.
   */
  quickAnswer: string;
  /** The concrete move from this tool to ShotStudio, three steps. */
  switchSteps: [string, string, string];
  /** Category pages this tool's audience most often needs next. */
  categorySlugs: string[];
};

export const COMPETITOR_EDITORIAL: Record<string, CompetitorEditorial> = {
  appmockup: {
    anchor: "AppMockUp alternatives",
    quickAnswer:
      "AppMockUp is two products under one brand: AppMockUp Studio, a free browser template editor with 400+ App Store screenshot templates, and appmockupgenerator.com, a Gemini-powered AI variant sold as one-time credit packs from $9 for 25 screenshots. Both output the iPhone 6.7\" 1290×2796 spec; both still leave the layout decisions to you.",
    switchSteps: [
      "Keep the three source screens you were about to drop into a template — same PNGs, no re-export needed.",
      "Paste your app name and the one-line pitch you already wrote for the App Store description; ShotStudio writes the headline from it.",
      "Generate, click-to-edit any text on the preview, download three 1290×2796 PNGs. No template picking, no dragging.",
    ],
    categorySlugs: [
      "productivity-apps",
      "fitness-apps",
      "note-taking-apps",
      "indie-games",
    ],
  },
  previewed: {
    anchor: "Previewed alternatives",
    quickAnswer:
      "Previewed is a browser-based 3D mockup tool covering App Store screenshots, social mockups and promo videos. Lite is free at 720p with a Creative Commons attribution requirement, Plus is $9.99 one-time capped at 10 lifetime exports, and Pro runs $19/mo.",
    switchSteps: [
      "Skip the template gallery — ShotStudio picks the personality preset from your app category instead.",
      "Upload the same three screens; theme and palette are sampled from them, so you don't rebuild your brand in an editor.",
      "Regenerate any single shot as many times as you like inside one credit — no 10-export ceiling.",
    ],
    categorySlugs: [
      "finance-apps",
      "photo-editing-apps",
      "productivity-apps",
      "travel-apps",
    ],
  },
  rotato: {
    anchor: "Rotato alternatives",
    quickAnswer:
      "Rotato is a premium one-time-pay 3D mockup desktop app used by Adobe, Google, Amazon and 200,000+ designers, with 8K export, a Figma plugin and full App Preview video support. It is built for designers making animation reels, not for an indie who needs three static shots before tomorrow's submission.",
    switchSteps: [
      "Nothing to install — ShotStudio runs in the browser you already have open at 1am.",
      "Upload three screens, name the app, write one line. No virtual camera, no lighting rig, no scene setup.",
      "Come back to Rotato when you want the App Preview video; the static carousel is done in a minute here.",
    ],
    categorySlugs: [
      "indie-games",
      "ar-apps",
      "photo-editing-apps",
      "music-apps",
    ],
  },
  shotbot: {
    anchor: "Shotbot alternatives",
    quickAnswer:
      "Shotbot is a native iOS, macOS and visionOS app that frames screenshots through the Share Sheet, Shortcuts and iCloud sync, with caption guidance derived from top App Store listings. The free tier caps daily frames and the unlimited tier is an Apple in-app subscription.",
    switchSteps: [
      "No daily frame cap to hit on submission night — one credit is one full set of three shots.",
      "Nothing syncs to iCloud: uploads pass through memory to the model and are never written to disk.",
      "The headline is written for you from your pitch rather than picked from caption guidance.",
    ],
    categorySlugs: [
      "habit-tracker-apps",
      "weather-apps",
      "recipe-apps",
      "journaling-apps",
    ],
  },
  "screenshots-pro": {
    anchor: "Screenshots.pro alternatives",
    quickAnswer:
      "Screenshots.pro is a subscription screenshot generator covering 23 device specs with localization and API access, priced at a free tier plus $19/mo Standard and $49/mo Extended. The locale exports, 3D angles and custom fonts most people want sit behind the paid tiers.",
    switchSteps: [
      "Cancel nothing later — there is no subscription to forget. $7 buys two sets outright.",
      "Bring the same three source screens; ShotStudio picks the preset from your category rather than a template gallery.",
      "Ship the English carousel tonight; keep Screenshots.pro on the shortlist if you later localize across stores.",
    ],
    categorySlugs: [
      "finance-apps",
      "dev-tools",
      "language-translation-apps",
      "ecommerce-apps",
    ],
  },
};

export function competitorAnchor(slug: string, name: string): string {
  return COMPETITOR_EDITORIAL[slug]?.anchor ?? `${name} alternatives`;
}

export function getCompetitorEditorial(
  slug: string,
): CompetitorEditorial | undefined {
  return COMPETITOR_EDITORIAL[slug];
}

export function categoriesForCompetitor(slug: string): Category[] {
  const slugs = COMPETITOR_EDITORIAL[slug]?.categorySlugs ?? [];
  return slugs
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter((c): c is Category => Boolean(c));
}
