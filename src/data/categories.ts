import type { StylePresetId } from "@/lib/generation/presets";

export type CategoryFaq = { q: string; a: string };

export type Category = {
  slug: string;
  name: string;
  /** Plural noun used inline, e.g. "fitness apps" */
  noun: string;
  presetId: StylePresetId;
  /** ~100-150 words — why screenshots matter for THIS category specifically. Hand-written, not templated. */
  lead: string;
  /** 3 dos, each one sentence. Render as a list. */
  whatConverts: string[];
  /** 3 donts, each one sentence. */
  whatHurts: string[];
  /** Example one-line pitch a user in this category might enter into the wizard. */
  pitchExample: string;
  faq: [CategoryFaq, CategoryFaq, CategoryFaq];
};

export const CATEGORIES: Category[] = [
  {
    slug: "fitness-apps",
    name: "Fitness apps",
    noun: "fitness apps",
    presetId: "soft_bright",
    lead: "Fitness apps live or die on the feeling someone gets in the first three seconds. The screenshot has to imply progress — a streak, a chart climbing, a body in motion — without showing a wall of numbers nobody wants to read on a Tuesday morning. Most indie fitness screenshots fail because they over-explain the feature instead of selling the outcome. The hero shot should answer one question: what does my next workout look like if I download this?",
    whatConverts: [
      "Show one personal-record moment, not the entire workout history dashboard.",
      "Lead with a body in motion or a streak count — visual proof of momentum.",
      "Headline copy that promises a specific outcome (\"Run your first 5K in 8 weeks\"), not a feature (\"Track runs\").",
    ],
    whatHurts: [
      "Stock photos of athletes — your real users can tell within a glance.",
      "Five charts on one screen — looks like spreadsheets, not progress.",
      "Generic motivational copy (\"Achieve your goals\") that any app could use.",
    ],
    pitchExample: "A running coach in your pocket that builds a personal plan from your last three runs.",
    faq: [
      {
        q: "Do fitness app screenshots need to show real workout data?",
        a: "Not real — but realistic. Generated mock data should be plausible (a 5K time of 24:07, not 03:00). Apple does not require user-data accuracy in screenshots; reviewers check that screenshots represent the actual experience.",
      },
      {
        q: "Should the hero shot show a chart or a person?",
        a: "A person almost always wins for top-of-funnel apps. A chart wins only if your differentiator is the data itself (e.g. an analytics-heavy app for serious runners). For most consumer fitness apps, lead human, prove with chart.",
      },
      {
        q: "What preset does ShotStudio pick for fitness apps?",
        a: "Soft & Bright by default — warm gradients and rounded type that feel motivating without shouting. Override to Bold & Playful for gamified or social fitness apps where the energy needs to be louder.",
      },
    ],
  },
  {
    slug: "finance-apps",
    name: "Finance apps",
    noun: "finance apps",
    presetId: "dark_premium",
    lead: "Finance app screenshots have an uphill fight: the actual product is a screen full of numbers, and a screen full of numbers reads as noise in the App Store carousel. The trick is to show one number, large, with one piece of context — and let the rest of the screenshot whisper. Premium finance apps lean dark for a reason: it makes a single accent color (your brand green for gains, your charcoal for the rest) feel deliberate instead of cluttered.",
    whatConverts: [
      "One hero number — net worth, balance, or last-month gain — at a size you can read across the room.",
      "A single chart with one line, not three overlapping series with a legend nobody will study.",
      "Context phrasing that translates the number (\"+$1,240 vs last month\") so non-finance users get it instantly.",
    ],
    whatHurts: [
      "Tables with more than 4 rows — the App Store carousel renders too small to read them.",
      "Stock-image \"diverse hands holding phone\" photos that signal generic fintech.",
      "Compliance disclaimers in the screenshot itself — they belong in the app, not the listing.",
    ],
    pitchExample: "Net worth tracker that connects every account once and forecasts next month automatically.",
    faq: [
      {
        q: "Can I show fake money amounts in finance app screenshots?",
        a: "Yes — Apple permits illustrative data in screenshots as long as the app's actual functionality matches what's shown. Use round-ish realistic numbers; reviewers reject screenshots that look like staged scams.",
      },
      {
        q: "Should I use my brand color or App Store conventions (green for up, red for down)?",
        a: "Both. Use the App Store conventions for any data visualization (green up, red down) — users read these in 200ms — and let your brand color be the accent for headlines and CTAs.",
      },
      {
        q: "Why does ShotStudio default finance apps to Dark & Premium?",
        a: "Because finance buyers are pattern-matched to expect it. Robinhood, Wealthfront, Mercury, Stripe — every premium finance product leans dark. Going light feels like a budgeting app for college students, even when you don't mean it to.",
      },
    ],
  },
  {
    slug: "productivity-apps",
    name: "Productivity apps",
    noun: "productivity apps",
    presetId: "clean_minimal",
    lead: "Productivity is the most crowded category on the App Store. Anything generic disappears. The winning shots are obsessively specific — one feature, one workflow, one obvious win — rendered with so much whitespace that the user understands the app is calm. The instinct to show \"everything the app can do\" is the single biggest reason indie productivity apps fail in the carousel.",
    whatConverts: [
      "One workflow rendered in detail — a single list, a single capture flow, a single review screen.",
      "Mostly whitespace, with the type doing the heavy lifting (your typeface IS the brand).",
      "A headline that names the daily moment (\"Plan tomorrow in 90 seconds\"), not the feature (\"Task list\").",
    ],
    whatHurts: [
      "Marquee feature lists — \"Tasks · Notes · Calendar · Goals · Habits\" — make you look unfocused.",
      "Multiple panels squeezed into one screen to prove depth — readers see clutter, not power.",
      "Stock illustrations of people at desks — they signal SaaS template, not indie craft.",
    ],
    pitchExample: "One opinionated list that captures in seconds and reviews itself every Sunday.",
    faq: [
      {
        q: "Should productivity app screenshots show the empty state or a populated one?",
        a: "Populated, but lightly. A real-feeling list with 3-5 items reads as in-use. An empty state reads as \"I haven't started yet\" — which is the buyer's current state, not the desired one.",
      },
      {
        q: "Is dark mode worth showing in a productivity app screenshot?",
        a: "Only as a secondary shot. Lead light — your hero shot has to read at thumbnail size in any App Store carousel, and dark mode loses contrast at small sizes for most fonts.",
      },
      {
        q: "Why is Clean & Minimal the default ShotStudio preset for productivity?",
        a: "Because the productivity buyer's pain is overload — the screenshot has to demonstrate, visually, that the app is the opposite of overload. White space is the proof; ornament is the enemy.",
      },
    ],
  },
  {
    slug: "indie-games",
    name: "Indie games",
    noun: "indie games",
    presetId: "bold_playful",
    lead: "Indie game screenshots are a different game (sorry) from utility apps. Players are scrolling fast and scanning for energy, character, and a hook — not a feature list. The hero shot needs to communicate the genre and the vibe in 200ms. Saturated solids, oversized type, and a hint of motion read better than any in-game render at thumbnail size, especially for casual and puzzle titles where the actual gameplay is hard to summarize visually.",
    whatConverts: [
      "Genre + vibe legible at thumbnail size — a player should know it's a puzzle, runner, or RPG without reading anything.",
      "Oversized headline copy with one verb-driven hook (\"Smash to survive\", \"Match. Chain. Win.\")",
      "Character-forward art on the hero — a face or a creature beats abstract gameplay almost always.",
    ],
    whatHurts: [
      "In-game UI screenshots with HUDs, health bars, and currency icons — players ignore them on the listing.",
      "Tutorial language (\"Tap to jump\") — the listing isn't onboarding.",
      "Muted indie palettes that lose to App Store carousel competitors with brighter art.",
    ],
    pitchExample: "Tap-to-survive arcade game where every level is a 30-second adrenaline shot.",
    faq: [
      {
        q: "Should indie game screenshots include actual gameplay or stylized art?",
        a: "Both. Hero shot can be stylized — your most iconic character or moment, oversized and saturated. Shots 2 and 3 should show actual gameplay so reviewers and players see what they're getting. Apple has rejected listings where every shot is concept art.",
      },
      {
        q: "Do screenshots need to match the in-game art style exactly?",
        a: "Closely, yes. Apple guidelines require screenshots to represent the actual app experience. You can stylize for impact (oversized text, bolder colors) but the core characters and visual style must match.",
      },
      {
        q: "Why Bold & Playful for games?",
        a: "Because a muted palette gets eaten in the App Store carousel by every other game next to yours. Saturated solids and high-contrast type cut through. ShotStudio's Bold & Playful preset is built for exactly this fight.",
      },
    ],
  },
  {
    slug: "dev-tools",
    name: "Developer tools",
    noun: "developer tools",
    presetId: "dark_premium",
    lead: "Developer-tool screenshots are sold to developers, who are the most cynical screenshot audience on the App Store. Stock photography is instant tune-out. Generic productivity tropes (\"Boost your workflow\") are instant tune-out. What works is real-looking code, real-looking UI chrome, and one specific capability that a senior engineer actually wants. Dark mode is table stakes — most dev tools are used in dark mode and the buyer expects to see it.",
    whatConverts: [
      "Real-looking code or UI in the screenshot — syntax highlighting, monospace fonts, plausible variable names.",
      "One specific capability per shot — diff viewer, query plan, terminal output — not a marketing collage.",
      "Headline copy a senior engineer would actually say (\"Postgres queries that read themselves\"), not VC pitch language.",
    ],
    whatHurts: [
      "Stock photos of laptops on coffee tables — read as parody by the buyer.",
      "\"AI-powered\" in the headline without saying what the AI does.",
      "Light-mode hero on a dev tool — visually correct sometimes, but signals consumer product, not developer product.",
    ],
    pitchExample: "Inline EXPLAIN for Postgres queries in your editor, with diff between two query plans.",
    faq: [
      {
        q: "Should dev-tool screenshots show real customer data or sample data?",
        a: "Sample data, but heavily plausible. Real product names, plausible function names, realistic table schemas. Anonymized real customer screenshots are the gold standard if you can get permission.",
      },
      {
        q: "Are mobile dev-tool apps a real category on the App Store?",
        a: "Yes — Working Copy, Termius, Buffer Editor, and a long tail of indie tools rank. The shots that win look like the developer's terminal or editor on a real device, not a marketing render.",
      },
      {
        q: "Why does ShotStudio pick Dark & Premium for dev tools?",
        a: "Because developers expect it. Dark backgrounds with a single bright accent (your brand purple, GitHub's green) match the editor and terminal environments developers spend their day in. Light hero shots feel off-genre.",
      },
    ],
  },
  {
    slug: "meditation-apps",
    name: "Meditation apps",
    noun: "meditation apps",
    presetId: "soft_bright",
    lead: "Meditation apps compete on calm, not features. The screenshot has to make someone scrolling at 11pm feel something quieter than the feed they came from. Soft gradients, breathable type, and a single image of stillness do the work. The instinct to list every meditation length, instructor, or category is the killer — meditation apps that lead with a long menu look like work.",
    whatConverts: [
      "One stillness image — a slow breath, a sunrise, a single object — instead of a session list.",
      "A headline that promises a feeling, not a feature (\"Sleep deeper\", not \"600+ guided sessions\").",
      "Pastel gradients that feel pre-dawn, not pre-school — soft warmth, low contrast.",
    ],
    whatHurts: [
      "Long lists of session titles in the hero — they read as \"more work I have to choose between.\"",
      "Stock photos of people meditating cross-legged — instant generic-wellness vibe.",
      "High-contrast hard edges — the entire visual category is about softness.",
    ],
    pitchExample: "A 5-minute breath that ends every workday before it follows you home.",
    faq: [
      {
        q: "Should meditation app screenshots show a person or a scene?",
        a: "A scene almost always. The buyer is imagining themselves into the app — a person on screen pulls them out of that imagination. Lead with what they'd see during a session, not a stock model.",
      },
      {
        q: "Is it OK to skip session-list screenshots entirely?",
        a: "Yes. The App Store carousel is not your library page. Save the session list for shot 3 or skip it entirely and use that slot for the experience itself.",
      },
      {
        q: "Why is Soft & Bright the default ShotStudio preset for meditation?",
        a: "Because the buyer is pattern-matched on softness. Calm, Headspace, Insight Timer — all soft, gradient-heavy, low-contrast. ShotStudio's Soft & Bright preset is purpose-built for this language.",
      },
    ],
  },
  {
    slug: "budgeting-apps",
    name: "Budgeting apps",
    noun: "budgeting apps",
    presetId: "dark_premium",
    lead: "Budgeting apps live in the same world as finance apps but talk to a different buyer. Where finance apps signal premium-and-aspirational, budgeting apps need to signal in-control-and-honest. The screenshot has to feel like the app would tell you the truth about your spending without judging you. One overspend chart, one envelope total, one savings line — that's the entire job.",
    whatConverts: [
      "One specific category overspend (\"Eating out: $312 / $200\") that names the buyer's actual life.",
      "Envelopes, categories, or buckets — visual metaphors that translate budgeting in 200ms.",
      "A clear monthly view at the top — the buyer wants to see the shape of the month, not yesterday.",
    ],
    whatHurts: [
      "Spreadsheet-looking transaction lists — the buyer left a spreadsheet to find your app.",
      "\"AI-powered insights\" without showing what the AI actually flagged.",
      "Aspirational stock photos of \"financial freedom\" — read as MLM.",
    ],
    pitchExample: "Honest budgeting in envelopes — see what's left, not what's gone.",
    faq: [
      {
        q: "Should budgeting app screenshots show negative balances or only successes?",
        a: "Show one of each. A controlled overspend (\"Eating out is over\") with a recovery path next to it tells the truth and makes the app feel useful. All-green screenshots feel like a demo, not a tool.",
      },
      {
        q: "How specific should the dollar amounts be?",
        a: "Specific enough to feel real. $312.46 reads like a real life. $300.00 reads like a pitch deck. Vary the cents.",
      },
      {
        q: "Does ShotStudio handle the App Store Connect screenshot spec for budgeting apps?",
        a: "Yes — every output is 1290×2796, sRGB, no transparency, regardless of category. That's the iPhone 6.7\" portrait spec App Store Connect requires.",
      },
    ],
  },
  {
    slug: "note-taking-apps",
    name: "Note-taking apps",
    noun: "note-taking apps",
    presetId: "clean_minimal",
    lead: "Note-taking is the most personal category on the App Store. Screenshots have to imply someone's actual brain, not a generic outline of \"how to be organized.\" The winning shots feel like a real person's notes — half-finished, idiosyncratic, with one or two of those personal-formatting ticks (a leftover bullet, a struck-through line, a date written wrong) that signal a human used this for an hour yesterday.",
    whatConverts: [
      "A single, real-feeling note — paragraphs and bullets mixed, not a perfectly clean outline.",
      "Capture flow shown in detail — the moment of writing, not the library afterward.",
      "Headline copy that admits the truth (\"For thinking, not filing\") instead of feature-listing.",
    ],
    whatHurts: [
      "Library views with 47 perfectly-titled notes — feels like a marketing demo.",
      "Lorem ipsum or obviously fake content in the note body — every reader can spot it.",
      "Markdown syntax visible in the hero — kills the magic for non-developer buyers.",
    ],
    pitchExample: "A single notebook for thinking — capture in seconds, find by what you remember.",
    faq: [
      {
        q: "Should note-taking app screenshots show formatting or plain text?",
        a: "Mostly plain text with one or two formatting moments (a list, a bold). Heavy formatting reads as marketing demo; the buyer wants to see what their actual messy notes will look like.",
      },
      {
        q: "Is it worth showing the search or library in a screenshot?",
        a: "Once, on a secondary shot. Search is the killer feature for note-takers but it's the third thing they think about, after capture (shot 1) and the writing experience (shot 2).",
      },
      {
        q: "Why Clean & Minimal for note-taking?",
        a: "Because note-taking buyers are running from cluttered apps. Whitespace is the visual promise. The ShotStudio Clean & Minimal preset uses restraint as the differentiator — typography over ornament.",
      },
    ],
  },
  {
    slug: "language-learning-apps",
    name: "Language-learning apps",
    noun: "language-learning apps",
    presetId: "clean_minimal",
    lead: "Language-learning screenshots have a specific job: prove that progress is possible without showing a wall of grammar. The category leader (Duolingo) trained the entire App Store on what these screenshots should look like — single lesson card, friendly mascot energy, one word being learned, a streak counter somewhere. Indie apps that try to differentiate by looking academic almost always lose. Lean into the lesson moment, not the linguistics.",
    whatConverts: [
      "One word being learned, one example sentence, one tappable answer — the smallest unit of progress.",
      "Streak count or daily-goal indicator visible — proof the app turns into a habit.",
      "Native-speaker scripts (Cyrillic, Kanji, Hangul) shown as actual visual content, not a font sample.",
    ],
    whatHurts: [
      "Lesson plan trees showing weeks 1-12 — reads as homework, not learning.",
      "Stock photos of a globe or a passport — globally over-used in the category.",
      "All-Latin-alphabet screenshots for non-Latin language apps — buyer can't tell what language you teach.",
    ],
    pitchExample: "Learn 200 words of Korean by reading one comic per day.",
    faq: [
      {
        q: "Should I show the actual target language in screenshots?",
        a: "Yes — and at large size. If you teach Japanese, kanji should be the visual hero of at least one shot. App Store buyers scanning the carousel make the language → app connection visually before they read any English headline.",
      },
      {
        q: "Is the streak counter worth dedicating screen real estate to?",
        a: "On shot 2 or 3, yes. Streaks are the category's load-bearing retention mechanism, and showing it signals that the app is built for habit, not for occasional use.",
      },
      {
        q: "What if my language-learning app teaches in an unconventional way (audio-first, conversation-first)?",
        a: "Lead with the unconventional moment. Differentiation in this category needs to be visual within the first 200ms of the carousel. Don't bury it in shot 4.",
      },
    ],
  },
  {
    slug: "social-apps",
    name: "Social apps",
    noun: "social apps",
    presetId: "soft_bright",
    lead: "Social-app screenshots have to imply community without showing strangers' faces. The hero shot needs warmth and motion — a feeling that someone is online right now, that the app is alive — without either of the two failure modes: stock-photo influencers (instant generic) or empty-state UI (instant lonely). Soft palettes, rounded type, and one micro-interaction (a reaction, a typing indicator, a notification) carry the work.",
    whatConverts: [
      "One micro-interaction visible — a reaction, a typing dots, a new-message badge — that proves the app is in motion.",
      "A two-person interaction in the hero, even if just message bubbles, beats a feed of strangers.",
      "Headline copy that names the feeling, not the feature (\"Stay close to the 8 people who matter\").",
    ],
    whatHurts: [
      "Feed mockups with stock-model avatars — reads as anyone-could-build-this.",
      "Empty-state screens — communicate loneliness instead of community.",
      "Buzz language (\"Connect, share, engage\") — every social pitch deck of the last decade.",
    ],
    pitchExample: "A small-circle social app for the 12 people you actually want updates from.",
    faq: [
      {
        q: "Can social-app screenshots show real user names and avatars?",
        a: "Only with explicit permission, and even then it's risky — Apple sometimes flags these for privacy review. Safer to use plausible mock names and your own design-system avatars (initials, generated shapes).",
      },
      {
        q: "Should I show notifications in a screenshot?",
        a: "On a secondary shot, yes — push notifications are the load-bearing growth mechanism for social. But never on the hero; lead with the in-app moment, not the lock screen.",
      },
      {
        q: "Why Soft & Bright for social apps?",
        a: "Warm rounded type and pastel gradients signal welcoming-not-edgy. Social apps that feel cold lose to social apps that feel like a friend. ShotStudio's Soft & Bright preset is built for that warmth without tipping into childish.",
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
