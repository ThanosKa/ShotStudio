import type { Metadata } from "next";
import type { Category } from "@/data/categories";
import type { Competitor } from "@/data/competitors";
import { APP_URL } from "@/lib/utils";

/**
 * Title + meta description generation for the programmatic marketing pages.
 *
 * Rules (see reports/02-snippets-schema.md):
 * - The title front-loads the phrase people actually search. GSC shows the
 *   demand is "<category> app screenshot(s)" ("fitness app screenshots",
 *   "vpn app screenshot", "running app screenshot"), NOT "App Store
 *   screenshots for fitness apps" — so the query phrase leads the title.
 * - Titles stay under ~60 chars *including* the " — ShotStudio" suffix the
 *   root layout template appends (13 chars), so the brand always survives
 *   truncation. Reinforcing the brand in every snippet is deliberate: see
 *   the "Shots Studios" brand-collision note in the report.
 * - Descriptions stay under ~155 chars and read as a promise, not a summary.
 */

export type Snippet = { title: string; description: string };

/** The suffix the root metadata template appends to any non-absolute title. */
const TITLE_SUFFIX = " — ShotStudio";

/** Longest suffix the root metadata template appends: " — ShotStudio". */
export const TITLE_SUFFIX_LENGTH = TITLE_SUFFIX.length;
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 155;

/**
 * Metadata for a static hub page (`/screenshots-for`, `/alternatives`, `/blog`,
 * `/privacy`, `/terms`).
 *
 * These five pages had byte-identical metadata blocks varying only by title,
 * description and path — including a hand-repeated `${title} — ShotStudio` for
 * the OpenGraph title. That suffix is only needed on `openGraph.title` because
 * the root layout's title *template* applies it to `title` automatically but
 * does not touch OpenGraph; repeating the literal in five files meant a brand
 * rename would silently miss whichever one you forgot.
 *
 * `/` and `/pricing` deliberately do NOT use this: both set an absolute title
 * (they fold the brand in themselves and must not take the template suffix).
 */
export function hubMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Root-relative, with leading slash — used for both canonical and OG url. */
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title}${TITLE_SUFFIX}`,
      description,
      url: `${APP_URL}${path}`,
    },
  };
}

/**
 * Turns the plural inline noun into the singular phrase people search with.
 * "fitness apps" -> "Fitness app", "indie games" -> "Indie game",
 * "developer tools" -> "Developer tool", "VPN apps" -> "VPN app".
 */
function searchNoun(noun: string): string {
  const singular = noun.replace(/s$/, "");
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

/**
 * Hand-written snippets for every category page that has GSC impressions.
 * Everything else falls through to the template below — which is still
 * query-phrase-first, just less specific.
 */
const CATEGORY_SNIPPETS: Record<string, Snippet> = {
  "finance-apps": {
    title: "Finance app screenshots: one big number wins",
    description:
      "Finance app screenshots live or die on one hero number. See what converts in the carousel, what kills it, and get three polished 1290×2796 shots for $7.",
  },
  "productivity-apps": {
    title: "Productivity app screenshots that stay calm",
    description:
      "Productivity app screenshots fail when they show everything. See the one-workflow rule, the three don'ts, and get three polished 1290×2796 shots for $7.",
  },
  "indie-games": {
    title: "Indie game screenshots that get tapped",
    description:
      "Indie game screenshots have one job: show the moment of play. What converts in the App Store carousel, what kills it, and three polished shots for $7.",
  },
  "fitness-apps": {
    title: "Fitness app screenshots that sell momentum",
    description:
      "Fitness app screenshots sell the next workout, not the dashboard. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
  "vpn-apps": {
    title: "VPN app screenshots that sell trust, fast",
    description:
      "VPN app screenshots have to prove safety in two seconds. What converts in the App Store carousel, what kills it, and three polished shots for $7.",
  },
  "dating-apps": {
    title: "Dating app screenshots that don't look staged",
    description:
      "Dating app screenshots fail when they look staged. What converts in the App Store carousel, what kills it, and three polished 1290×2796 shots for $7.",
  },
  "running-apps": {
    title: "Running app screenshots that show the run",
    description:
      "Running app screenshots win on pace, route, and streak — not menus. What converts in the App Store carousel, plus three polished shots for $7.",
  },
  "language-translation-apps": {
    title: "Translation app screenshots for the App Store",
    description:
      "Translation app screenshots must show before and after in one frame. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "weather-apps": {
    title: "Weather app screenshots that read at a glance",
    description:
      "Weather app screenshots win on one legible forecast, not five widgets. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "ai-apps": {
    title: "AI app screenshots that show the output",
    description:
      "AI app screenshots sell the output, not the chat box. What converts in the App Store carousel, what kills it, and three polished 1290×2796 shots for $7.",
  },
  "education-apps": {
    title: "Education app screenshots that show progress",
    description:
      "Education app screenshots sell one lesson done, not a syllabus. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
  "budgeting-apps": {
    title: "Budgeting app screenshots that show one number",
    description:
      "Budgeting app screenshots work when one number does the talking. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
  "meditation-apps": {
    title: "Meditation app screenshots that feel calm",
    description:
      "Meditation app screenshots sell the feeling, not the feature list. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
  "ai-chatbot-apps": {
    title: "AI chatbot screenshots that show real replies",
    description:
      "AI chatbot app screenshots need one real exchange, not an empty prompt box. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "pet-care-apps": {
    title: "Pet care app screenshots that show the pet",
    description:
      "Pet care app screenshots need the animal in frame and one clear job done. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "journaling-apps": {
    title: "Journaling app screenshots that feel private",
    description:
      "Journaling app screenshots sell the ritual, not the text field. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
  "social-apps": {
    title: "Social app screenshots that show real people",
    description:
      "Social app screenshots need a feed that looks lived-in, not seeded. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "habit-tracker-apps": {
    title: "Habit tracker screenshots that show the streak",
    description:
      "Habit tracker app screenshots sell the streak, not the settings. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
  "note-taking-apps": {
    title: "Note-taking app screenshots that stay quiet",
    description:
      "Note-taking app screenshots sell one capture flow, not a feature grid. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "invoicing-apps": {
    title: "Invoicing app screenshots that show payment",
    description:
      "Invoicing app screenshots sell one invoice sent and paid. What converts, what kills the App Store carousel, and three polished shots for $7.",
  },
  "health-tracking-apps": {
    title: "Health tracking screenshots that stay legible",
    description:
      "Health tracking app screenshots need one metric, big. What converts in the App Store carousel, what kills it, and three polished shots for $7.",
  },
  "shopping-list-apps": {
    title: "Shopping list app screenshots that look used",
    description:
      "Shopping list app screenshots need a populated list, not an empty state. What converts, what kills the carousel, and three polished shots for $7.",
  },
  "task-management-apps": {
    title: "Task management app screenshots that stay calm",
    description:
      "Task management app screenshots sell one plan, not five panels. What converts, what kills the carousel, and three polished 1290×2796 shots for $7.",
  },
};

export function categorySnippet(category: Category): Snippet {
  const override = CATEGORY_SNIPPETS[category.slug];
  if (override) return override;

  const phrase = `${searchNoun(category.noun)} screenshots`;
  return {
    title: `${phrase} that convert`,
    description: `${phrase} that sell the outcome, not the feature. Three raw uploads in, three polished 1290×2796 shots back. $7 once, never stored.`,
  };
}

/**
 * Competitor pages use an absolute title: the differentiator ($7 one-time)
 * has to be in the snippet, and the default " — ShotStudio" suffix would
 * push these past 60 chars. The brand is folded into the title instead.
 */
const COMPETITOR_SNIPPETS: Record<string, Snippet> = {
  appmockup: {
    title: "AppMockUp alternatives — ShotStudio, $7 one-time",
    description:
      "AppMockUp Studio is free but you still edit templates by hand. ShotStudio generates three polished 1290×2796 App Store shots from three uploads. $7 once.",
  },
};

export function competitorSnippet(competitor: Competitor): Snippet {
  const override = COMPETITOR_SNIPPETS[competitor.slug];
  if (override) return override;

  return {
    title: `${competitor.name} alternatives — ShotStudio, $7 one-time`,
    description: `Why indies leave ${competitor.name}, where it still wins, and how ShotStudio compares: $7 one-time, AI-picked preset, screenshots never stored.`,
  };
}
