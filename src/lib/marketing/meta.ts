import type { Metadata } from "next";
import type { Category } from "@/data/categories";
import type { Competitor } from "@/data/competitors";
import { APP_URL } from "@/lib/utils";

export type Snippet = { title: string; description: string };

const TITLE_SUFFIX = " — ShotStudio";

export const TITLE_SUFFIX_LENGTH = TITLE_SUFFIX.length;
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 155;

const SOCIAL_IMAGE = {
  url: `${APP_URL}/og-default.png`,
  width: 1731,
  height: 909,
  alt: "ShotStudio — App Store screenshots in under a minute",
};

export function socialMetadata({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      siteName: "ShotStudio",
      title,
      description,
      url,
      locale: "en_US",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

export function hubMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...socialMetadata({
      title: `${title}${TITLE_SUFFIX}`,
      description,
      url: `${APP_URL}${path}`,
    }),
  };
}

function searchNoun(noun: string): string {
  const singular = noun.replace(/s$/, "");
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

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

const COMPETITOR_SNIPPETS: Record<string, Snippet> = {
  appscreens: {
    title: "AppScreens alternatives — ShotStudio, $7 one-time",
    description:
      "AppScreens Pro is $25/mo or $99/yr. ShotStudio turns three uploads into three polished 1290×2796 App Store shots for $7 one-time, no subscription.",
  },
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
    description: `Why indies leave ${competitor.name}, where it still wins, and how ShotStudio compares: $7 one-time, preset matched to your category, never stored.`,
  };
}
