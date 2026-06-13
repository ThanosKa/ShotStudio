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
    presetId: "friendly",
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
        a: "Friendly by default — rounded sans-serif type and a warm headline voice. The actual color palette comes from your uploaded screenshots, so a pastel app stays pastel and a bold-color app stays bold. Override to Bold if you want oversized display type and punchier copy.",
      },
    ],
  },
  {
    slug: "finance-apps",
    name: "Finance apps",
    noun: "finance apps",
    presetId: "professional",
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
        q: "Why does ShotStudio default finance apps to Professional?",
        a: "Because finance buyers expect Inter-style typography and confident-not-cute copy. Professional gives you that — restrained type, declarative headline voice. The light-vs-dark theme is sampled from your uploaded screenshots, so the output matches your actual app. Light brand stays light, dark brand stays dark.",
      },
    ],
  },
  {
    slug: "productivity-apps",
    name: "Productivity apps",
    noun: "productivity apps",
    presetId: "minimal",
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
        q: "Why is Minimal the default ShotStudio preset for productivity?",
        a: "Because the productivity buyer's pain is overload — the screenshot has to demonstrate, visually, that the app is the opposite of overload. White space is the proof; ornament is the enemy.",
      },
    ],
  },
  {
    slug: "indie-games",
    name: "Indie games",
    noun: "indie games",
    presetId: "bold",
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
        q: "Why Bold for games?",
        a: "Because games need oversized headlines and punchy verbs to cut through the carousel — Bold gives you that with display type and direct copy voice. Color saturation comes from your actual game screenshots; if your art is muted, the marketing inherits it. Bold brings the typography heat on top.",
      },
    ],
  },
  {
    slug: "dev-tools",
    name: "Developer tools",
    noun: "developer tools",
    presetId: "professional",
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
        q: "Why does ShotStudio pick Professional for dev tools?",
        a: "Because developers expect Inter-style type and confident, no-fluff copy. Professional gives you that. The dark backdrop most dev-tool marketing ends up with comes from uploads — most dev tools ship dark UI, so the marketing background follows the app naturally.",
      },
    ],
  },
  {
    slug: "meditation-apps",
    name: "Meditation apps",
    noun: "meditation apps",
    presetId: "friendly",
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
        q: "Why is Friendly the default ShotStudio preset for meditation?",
        a: "Because the meditation buyer expects rounded type and a calm, plainspoken headline voice — that's what Friendly gives you. The soft-pastel palette you associate with the category comes from your actual app's screenshots. Most meditation apps already ship those tones, so the marketing inherits them.",
      },
    ],
  },
  {
    slug: "budgeting-apps",
    name: "Budgeting apps",
    noun: "budgeting apps",
    presetId: "professional",
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
    presetId: "minimal",
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
        q: "Why Minimal for note-taking?",
        a: "Because note-taking buyers are running from cluttered apps. Whitespace is the visual promise. The ShotStudio Minimal preset uses restraint as the differentiator — typography over ornament.",
      },
    ],
  },
  {
    slug: "language-learning-apps",
    name: "Language-learning apps",
    noun: "language-learning apps",
    presetId: "minimal",
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
    presetId: "friendly",
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
        q: "Why Friendly for social apps?",
        a: "Warm rounded type and a plainspoken voice signal welcoming-not-edgy. Friendly gives you both. The actual color palette comes from your uploaded screenshots, so the marketing inherits your app's actual mood — a pastel app stays pastel, a saturated app stays saturated.",
      },
    ],
  },
  {
    slug: "dating-apps",
    name: "Dating apps",
    noun: "dating apps",
    presetId: "friendly",
    lead: "Dating-app screenshots sell a feeling that's almost impossible to fake: that real people are on the other side. The hero shot has to imply a match, a conversation, a spark — without leaning on stock-model faces that every buyer recognizes as fake in half a second. The category leaders trained users to expect a profile card and a chat bubble; the indie win is making those two moments feel warm and specific instead of staged.",
    whatConverts: [
      "One profile card and one message bubble — the two moments every dating buyer is imagining.",
      "Warm, low-contrast palettes that read as evening and intimate, not clinical app-grid.",
      "Headline copy that names the outcome (\"Meet people who actually reply\"), not the mechanic (\"Swipe to match\").",
    ],
    whatHurts: [
      "Stock-model headshots in the profile mockups — the most-spotted fake in the entire category.",
      "A grid of dozens of faces — reads as a meat-market, not a meaningful connection.",
      "Generic romance clichés (\"Find your soulmate\") that any of 400 dating apps could run.",
    ],
    pitchExample: "A slower dating app where you match on one shared interest, not on a face.",
    faq: [
      {
        q: "Can dating-app screenshots use real user profiles?",
        a: "Almost never — Apple flags real faces and personal data for privacy review, and you'd need explicit consent from each person shown. Use plausible mock profiles with your own illustrated or generated avatars instead.",
      },
      {
        q: "Should the hero shot show profiles or the conversation?",
        a: "Lead with whichever is your differentiator. If you compete on better matches, hero the profile card. If you compete on the conversation quality, hero the chat. Don't show both fighting for attention on shot one.",
      },
      {
        q: "Why Friendly for dating apps?",
        a: "Because warmth and approachability convert better than edge in this category — Friendly gives you rounded type and a plainspoken headline voice. The palette is sampled from your uploads, so a soft-pink app stays soft and a dark, moody app keeps its mood.",
      },
    ],
  },
  {
    slug: "ecommerce-apps",
    name: "Ecommerce apps",
    noun: "ecommerce apps",
    presetId: "minimal",
    lead: "Ecommerce-app screenshots are really product-merchandising screenshots: the buyer wants to see what shopping feels like, not a list of features. The hero shot should show one beautiful product in a clean layout, the way a good storefront does — generous whitespace, one price, one tappable buy moment. The instinct to cram a category grid into the hero is the fastest way to look like a marketplace nobody curated.",
    whatConverts: [
      "One hero product shot in a clean layout — the storefront, not the settings screen.",
      "A visible, frictionless buy moment — one button, one price, one tap away from checkout.",
      "Whitespace that signals curation — the app feels chosen, not scraped.",
    ],
    whatHurts: [
      "Dense category grids in the hero — read as cluttered marketplace, not a brand.",
      "Lorem-ipsum product names and $0.00 prices — every buyer spots the placeholder.",
      "Five payment-method badges crammed in — trust signals belong at checkout, not the listing.",
    ],
    pitchExample: "A one-tap shopping app for independent makers — checkout before you change your mind.",
    faq: [
      {
        q: "Should ecommerce screenshots show real products or mockups?",
        a: "Real-looking products with plausible names and prices. If you have permission to show actual catalog items, even better — Apple wants screenshots to represent the real shopping experience, and real products read as trustworthy.",
      },
      {
        q: "Is the checkout flow worth a screenshot?",
        a: "On a secondary shot, yes. A clean one-tap checkout is a strong trust signal for a buyer worried about a clunky purchase — but lead with the product browsing experience on the hero.",
      },
      {
        q: "Why Minimal for ecommerce apps?",
        a: "Because the product should be the hero, not your UI chrome. Minimal uses whitespace and restrained type so the merchandise carries the shot. Theme and palette are sampled from your uploads, so a bright brand stays bright.",
      },
    ],
  },
  {
    slug: "ai-apps",
    name: "AI apps",
    noun: "AI apps",
    presetId: "bold",
    lead: "AI-app screenshots have a unique problem: the magic happens in a model the user can't see, so the screenshot has to show the before and the after. The winning shots prove a transformation — a prompt and its result, a messy input and a clean output — instead of bragging \"AI-powered\" in the headline. Buyers have been burned by AI vaporware; the screenshot has to demonstrate, not promise.",
    whatConverts: [
      "A visible input-to-output transformation — show the prompt and the result in one frame.",
      "A specific, believable result, not a hand-wavy \"AI does everything\" collage.",
      "Headline copy that says what the AI does (\"Turn voice notes into clean docs\"), never just \"AI-powered\".",
    ],
    whatHurts: [
      "\"AI-powered\" or \"GPT-4\" in the headline with no demonstration of the actual output.",
      "Glowing-orb / neural-network stock graphics — the universal signal of an AI app with nothing to show.",
      "An empty chat box as the hero — proves nothing about what the model can do.",
    ],
    pitchExample: "An AI app that turns a 30-minute voice memo into a clean, structured doc.",
    faq: [
      {
        q: "Should AI-app screenshots show the actual model output?",
        a: "Yes — a real, plausible output is your single strongest asset. Show a believable transformation. Apple has rejected AI listings whose screenshots imply capabilities the app doesn't actually deliver, so keep the output honest.",
      },
      {
        q: "How do I avoid looking like generic AI vaporware?",
        a: "Show one specific transformation instead of claiming broad intelligence. \"Voice memo in, structured doc out\" beats \"powered by advanced AI\" every time. Concrete beats impressive.",
      },
      {
        q: "Why Bold for AI apps?",
        a: "Because AI is a crowded, noisy category and you need oversized headlines and a confident verb to cut through. Bold gives you display type and punchy copy. The palette comes from your uploads, so the marketing matches your actual app, not a stock neural-net aesthetic.",
      },
    ],
  },
  {
    slug: "kids-apps",
    name: "Kids apps",
    noun: "kids apps",
    presetId: "friendly",
    lead: "Kids-app screenshots have two audiences at once: the child who'll use it and the parent who'll buy it. The art has to be bright, rounded, and obviously playful for the kid, while the headline reassures the parent it's safe, ad-free, and educational. Apple's Kids Category has its own review rules, and the screenshots are scrutinized harder than almost any other category — playful but trustworthy is the whole brief.",
    whatConverts: [
      "Bright, rounded, character-forward art that a four-year-old recognizes as \"for me\".",
      "One parent-reassuring signal — \"No ads. No in-app purchases.\" — somewhere in the set.",
      "A single clear activity per shot (one game, one story, one drawing) instead of a busy menu.",
    ],
    whatHurts: [
      "Tiny dense UI a child can't parse — kids apps must look tappable from across the room.",
      "Any hint of ads, leaderboards, or social features — instant parent distrust in the Kids Category.",
      "Muted, sophisticated palettes — they read as an adult app, not a children's one.",
    ],
    pitchExample: "An ad-free phonics game where kids read their first 50 words by drawing them.",
    faq: [
      {
        q: "Are there special screenshot rules for the App Store Kids Category?",
        a: "Yes. Kids Category apps face stricter review, and screenshots must not depict ads, in-app purchase prompts, or external links. Showing an ad-free, purchase-free experience in the screenshots themselves helps reviewers and reassures parents.",
      },
      {
        q: "Should kids-app screenshots show children using the app?",
        a: "Generally avoid real children's faces — they trigger privacy review. Lead with the in-app art and characters; the child sees themselves in the character, and you sidestep the consent problem entirely.",
      },
      {
        q: "Why Friendly for kids apps?",
        a: "Because rounded, warm type and plainspoken copy match what both kids and parents trust. Friendly gives you that. Bright palettes come from your uploads, so a rainbow app stays a rainbow.",
      },
    ],
  },
  {
    slug: "travel-apps",
    name: "Travel apps",
    noun: "travel apps",
    presetId: "friendly",
    lead: "Travel-app screenshots sell a destination before they sell a feature. The buyer is daydreaming about being somewhere else, and the hero shot has to feed that daydream — a place, a map, an itinerary that looks like a trip worth taking — while one secondary shot proves the app actually handles the logistics. Lead with wanderlust, prove with utility.",
    whatConverts: [
      "One aspirational place or map on the hero — sell the trip, not the booking form.",
      "A real-feeling itinerary or day plan that shows the app does the boring logistics for you.",
      "Headline copy naming the dream (\"Plan a week in Lisbon in ten minutes\"), not the feature (\"Itinerary builder\").",
    ],
    whatHurts: [
      "Generic globe / airplane-window stock photos — the most overused images in the category.",
      "A dense booking form as the hero — kills the daydream before it starts.",
      "Pin-covered maps with no legible plan — looks chaotic, not like a curated trip.",
    ],
    pitchExample: "A travel app that turns a city and three dates into a walkable day-by-day plan.",
    faq: [
      {
        q: "Should travel-app screenshots show real destinations?",
        a: "Yes — real, recognizable places convert far better than generic stock. If you show an itinerary, make the place names and timings plausible. The buyer is imagining their own trip into your screenshots.",
      },
      {
        q: "Lead with the map or the itinerary?",
        a: "Lead with whichever is more beautiful for your app. Map-first works for discovery apps; itinerary-first works for planning apps. The hero's job is to trigger the daydream — pick the more aspirational of the two.",
      },
      {
        q: "Why Friendly for travel apps?",
        a: "Because travel is emotional and warm, and Friendly's rounded type plus plainspoken voice match that mood. The palette is sampled from your uploads, so a sun-soaked brand keeps its warmth.",
      },
    ],
  },
  {
    slug: "food-delivery-apps",
    name: "Food delivery apps",
    noun: "food delivery apps",
    presetId: "bold",
    lead: "Food-delivery screenshots have to make someone hungry in the carousel. The hero shot is a craving trigger — one great-looking dish, big — followed by proof the app gets it to your door fast. Speed and appetite are the two levers; everything else (filters, payment, ratings) is secondary. The fastest way to fail is a screenshot full of restaurant-list rows that look like every other delivery app.",
    whatConverts: [
      "One mouth-watering hero dish, oversized — appetite is the first conversion lever.",
      "A clear speed signal — an ETA, a live-tracking map, a \"30 min\" badge — as the second shot.",
      "Headline copy that names the craving moment (\"Dinner, decided, in two taps\"), not the catalog.",
    ],
    whatHurts: [
      "Endless restaurant-list rows as the hero — indistinguishable from every competitor.",
      "Low-quality or generic food photos — appetite collapses instantly on a bad dish shot.",
      "Burying the delivery speed — for this category, speed is half the value proposition.",
    ],
    pitchExample: "A food app that learns your taste and orders dinner before you finish deciding.",
    faq: [
      {
        q: "Should food-delivery screenshots show real restaurant menus?",
        a: "Real-looking ones with plausible dishes and prices. If you have partner restaurants who've consented, real menus are gold. Apple wants screenshots to match the actual ordering experience, so keep the catalog believable.",
      },
      {
        q: "How important is the food photography?",
        a: "It's everything. The hero dish is your single biggest conversion lever in this category — a great dish shot triggers the craving that drives the download. Invest in one excellent food image over five mediocre ones.",
      },
      {
        q: "Why Bold for food delivery apps?",
        a: "Because appetite and speed both reward punch — oversized headlines and saturated color. Bold gives you the display type; the actual color comes from your uploads, so your brand reds and oranges stay yours.",
      },
    ],
  },
  {
    slug: "education-apps",
    name: "Education apps",
    noun: "education apps",
    presetId: "minimal",
    lead: "Education-app screenshots have to make learning look achievable, not overwhelming. The buyer (often a learner mid-doubt, or a parent) needs to see one clear lesson and a sense of progress, rendered calmly enough that the app reads as the opposite of a textbook. The instinct to show a full curriculum tree is the killer — it reads as homework, and homework is exactly what the buyer is trying to escape.",
    whatConverts: [
      "One clear lesson or concept in detail — the smallest satisfying unit of learning.",
      "A visible progress signal — a completed module, a skill bar, a streak — that proves momentum.",
      "Headline copy promising the outcome (\"Understand statistics in a week\"), not the syllabus.",
    ],
    whatHurts: [
      "Full curriculum trees showing 40 lessons — read as a workload, not a win.",
      "Stock photos of graduation caps, chalkboards, or apples — category-wide clichés.",
      "Dense text-heavy lesson screens — the buyer fears exactly this kind of overload.",
    ],
    pitchExample: "A learning app that teaches one hard idea per day in a five-minute lesson.",
    faq: [
      {
        q: "Should education-app screenshots show the lesson content or the dashboard?",
        a: "Lead with one lesson, shown in satisfying detail. The dashboard is a secondary shot. Buyers want to feel what learning in your app is like, not see how progress is tracked first.",
      },
      {
        q: "How do I make learning look easy, not overwhelming?",
        a: "Show one concept, lots of whitespace, and a clear sense of completion. Avoid showing the full course outline — it triggers the exact overwhelm the buyer is trying to avoid.",
      },
      {
        q: "Why Minimal for education apps?",
        a: "Because the learning buyer's fear is overload, and whitespace is the visual antidote. Minimal uses restraint and typography to make the app feel calm and doable. Palette comes from your uploads.",
      },
    ],
  },
  {
    slug: "habit-tracker-apps",
    name: "Habit tracker apps",
    noun: "habit tracker apps",
    presetId: "minimal",
    lead: "Habit-tracker screenshots sell one feeling: the satisfaction of a streak. The hero shot should show a chain of completed days, a calendar of green, or one habit checked off — the visual dopamine that makes the category work. Over-explaining the tracking system, the reminders, the analytics, buries the one thing that converts: the small, repeatable win the buyer is craving.",
    whatConverts: [
      "A visible streak — a chain of days, a calendar of completions — as the hero's emotional payload.",
      "One habit shown being completed, with the satisfying check or fill animation implied.",
      "Headline copy naming the identity shift (\"Become the person who runs every morning\"), not the feature.",
    ],
    whatHurts: [
      "Analytics dashboards with charts — they're a secondary feature, not the emotional hook.",
      "A long list of trackable habits in the hero — reads as more obligations, not progress.",
      "Guilt-based copy (\"Don't break the chain\") — the category has moved toward encouragement, not shame.",
    ],
    pitchExample: "A habit app that celebrates the streak instead of guilting you when you miss.",
    faq: [
      {
        q: "Should habit-tracker screenshots show many habits or one?",
        a: "Lead with one habit and its streak. A wall of trackable habits reads as a to-do list of obligations. The emotional win is the single chain of completed days — make that the hero.",
      },
      {
        q: "Is the calendar or the streak counter the better hero?",
        a: "Whichever is more visually satisfying in your app. A month of green calendar squares is hard to beat for instant comprehension, but a big streak number works if your design leans typographic.",
      },
      {
        q: "Why Minimal for habit trackers?",
        a: "Because the satisfaction in this category is clean and quiet — a streak doesn't need ornament. Minimal lets the chain of completions be the hero. Palette comes from your uploaded screenshots.",
      },
    ],
  },
  {
    slug: "photo-editing-apps",
    name: "Photo editing apps",
    noun: "photo editing apps",
    presetId: "bold",
    lead: "Photo-editing screenshots are the easiest category to prove and the easiest to fake badly. The whole pitch is before and after — show a flat phone snap transformed into something striking, and the buyer instantly gets the value. The failure mode is showing the toolbar instead of the result: nobody downloads an editor for its slider panel, they download it for what their photos could look like.",
    whatConverts: [
      "A clear before/after — the single most persuasive shot type this category has.",
      "One stunning finished edit on the hero, full-bleed, so the result is the first thing seen.",
      "Headline copy promising the transformation (\"Make every photo look shot on film\"), not the toolset.",
    ],
    whatHurts: [
      "Toolbar-and-slider screenshots as the hero — proves the work, not the payoff.",
      "Over-processed, obviously-fake edits — the buyer wants believable magic, not Instagram-circa-2012.",
      "A grid of filter thumbnails — reads as feature inventory, not as a result worth wanting.",
    ],
    pitchExample: "A photo editor with one slider that makes any snapshot look shot on 35mm film.",
    faq: [
      {
        q: "Should photo-editing screenshots use before/after comparisons?",
        a: "Yes — before/after is the highest-converting shot type in this category. Show a believable flat input and a striking finished output. Just keep the \"after\" achievable so buyers aren't disappointed by their own results.",
      },
      {
        q: "Should I show the editing tools at all?",
        a: "On a secondary shot, briefly. Lead with the result. The buyer downloads for the payoff, not the panel — show what their photos will look like before you show how to get there.",
      },
      {
        q: "Why Bold for photo editing apps?",
        a: "Because visual results reward visual confidence — oversized type lets the finished image breathe and feel premium. Bold gives you that. The palette is sampled from your example edits, so the marketing matches your actual aesthetic.",
      },
    ],
  },
  {
    slug: "music-apps",
    name: "Music apps",
    noun: "music apps",
    presetId: "bold",
    lead: "Music-app screenshots sell mood and motion. Whether it's streaming, a player, or a maker tool, the hero has to feel like sound looks — album art, a waveform, a now-playing screen that pulses with energy. The buyer scrolling the carousel decides on vibe in 200ms; a clean now-playing screen with strong art beats any feature list about bitrate, EQ, or library size.",
    whatConverts: [
      "A now-playing screen with strong album art or a living waveform — sound made visible.",
      "One mood established instantly through color and motion — energetic, mellow, focused.",
      "Headline copy naming the moment (\"Your morning, scored\"), not the spec (\"Lossless audio\").",
    ],
    whatHurts: [
      "Library-list screenshots as the hero — read as a database, not a feeling.",
      "Tiny EQ sliders and settings panels — audiophile features belong on a secondary shot.",
      "Generic headphone / soundwave stock graphics — the category's most tired visual.",
    ],
    pitchExample: "A music app that builds a focus mix from the BPM of your last good work session.",
    faq: [
      {
        q: "Should music-app screenshots show the now-playing screen or the library?",
        a: "Lead with now-playing — it's the most emotionally charged screen and the one with the strongest art. The library is a secondary shot. Sell the listening moment first.",
      },
      {
        q: "How do I handle album art rights in screenshots?",
        a: "Use your own original art, public-domain covers, or art you have rights to. Showing real copyrighted album covers without permission risks rejection and legal trouble — generated or original art is the safe path.",
      },
      {
        q: "Why Bold for music apps?",
        a: "Because music is energy, and Bold's oversized type matches that. The palette comes from your uploads, so a neon player stays neon and a moody dark app keeps its mood.",
      },
    ],
  },
  {
    slug: "podcast-apps",
    name: "Podcast apps",
    noun: "podcast apps",
    presetId: "minimal",
    lead: "Podcast-app screenshots have a quiet job: make discovery and listening feel effortless. The hero is usually the now-playing screen — show art, a clean transport, and one smart feature like a transcript or speed control. The category buyer already listens to podcasts; what they're shopping for is a calmer, smarter player, so the screenshot should feel uncluttered and considered, not stuffed with every playback toggle.",
    whatConverts: [
      "A clean now-playing screen — episode art, simple transport, generous whitespace.",
      "One smart differentiator shown clearly — transcript, smart speed, or chapter navigation.",
      "Headline copy that names the upgrade (\"Finally, a player that remembers where you stopped\").",
    ],
    whatHurts: [
      "Dense subscription-list grids as the hero — reads as a directory, not a player.",
      "A row of ten playback-setting toggles — power features, but they clutter the hero.",
      "Generic microphone / headphone stock imagery — the whole category overuses it.",
    ],
    pitchExample: "A podcast player that auto-skips ads and keeps a searchable transcript of every episode.",
    faq: [
      {
        q: "Should podcast-app screenshots show the player or the discovery feed?",
        a: "Lead with the now-playing player — it's the screen listeners spend the most time on. Show your discovery or library feed on a secondary shot if browsing is a differentiator.",
      },
      {
        q: "How do I show podcast cover art without rights issues?",
        a: "Use your own example shows, public podcasts you have permission to feature, or generated placeholder art. Don't show real third-party podcast brands prominently without clearance.",
      },
      {
        q: "Why Minimal for podcast apps?",
        a: "Because the category buyer wants a calmer, cleaner listening experience — whitespace signals exactly that. Minimal uses restraint and typography. Palette is sampled from your uploads.",
      },
    ],
  },
  {
    slug: "crypto-apps",
    name: "Crypto apps",
    noun: "crypto apps",
    presetId: "professional",
    lead: "Crypto-app screenshots fight a trust deficit the moment they load. The buyer has seen enough scams to be skeptical, so the screenshot's job is to look credible and clear, not hype-driven. One portfolio value, one clean chart, one obvious action — premium-dark, restrained, and specific. Moon emojis and rocket gradients signal exactly the kind of project a serious buyer avoids.",
    whatConverts: [
      "One portfolio value, large and legible, with a single clean chart — clarity reads as credibility.",
      "A restrained, premium-dark palette with one accent — signals a serious product, not a meme.",
      "Headline copy that's specific and calm (\"Track every wallet in one place\"), never hype.",
    ],
    whatHurts: [
      "Rocket / moon / lambo imagery and gradients — instant signal of a low-trust project.",
      "Walls of tiny coin tickers and percentages — noise that buries the one number that matters.",
      "\"100x\" or guaranteed-return language — a compliance risk and a credibility killer.",
    ],
    pitchExample: "A crypto tracker that shows your real cost basis across every wallet and exchange.",
    faq: [
      {
        q: "Can crypto-app screenshots show portfolio values and returns?",
        a: "Yes, with illustrative data, as long as the app actually provides those features. Avoid implying guaranteed returns or specific profits — Apple and app-store guidelines treat misleading financial claims harshly, and so do skeptical buyers.",
      },
      {
        q: "How do I make a crypto app look trustworthy, not scammy?",
        a: "Restraint. Clean charts, one clear number, a premium-dark palette, and zero hype imagery. The fastest way to look legitimate in this category is to look like a calm finance app, not a moonshot.",
      },
      {
        q: "Why Professional for crypto apps?",
        a: "Because credibility is the whole battle, and Professional's Inter-style type and confident-not-cute copy signal a serious tool. The dark backdrop most crypto apps ship comes from your uploads.",
      },
    ],
  },
  {
    slug: "sleep-apps",
    name: "Sleep apps",
    noun: "sleep apps",
    presetId: "friendly",
    lead: "Sleep-app screenshots are seen at the exact moment the buyer wants to stop looking at screens. They have to feel like the end of the day — dark, soft, low-contrast — and promise rest, not engagement. The category overlaps with meditation but has its own visual grammar: a sleep timer, a soundscape, a gentle alarm. Anything bright or busy breaks the spell instantly.",
    whatConverts: [
      "A dark, soft, low-contrast hero that literally looks like winding down for the night.",
      "One sleep feature shown calmly — a soundscape, a wind-down timer, a gentle wake-up.",
      "Headline copy that promises rest (\"Fall asleep without your phone\"), not screen time.",
    ],
    whatHurts: [
      "Bright white screens — physically wrong for the moment the buyer is in.",
      "Busy dashboards of sleep stats — analytics belong on a secondary shot, if at all.",
      "Stock photos of people sleeping in perfect beds — generic-wellness cliché.",
    ],
    pitchExample: "A sleep app that fades out a story and your screen together so you actually drift off.",
    faq: [
      {
        q: "Should sleep-app screenshots show sleep tracking data?",
        a: "Only as a secondary shot, if at all. The hero should feel like the moment of falling asleep, not a morning report. Lead with the wind-down experience; the buyer is shopping at night, not analyzing data.",
      },
      {
        q: "Why does dark mode matter so much for sleep apps?",
        a: "Because the buyer is literally in a dark room at bedtime, and a bright screenshot feels physically wrong. Dark, low-contrast screenshots match the use moment and signal the app respects your eyes at night.",
      },
      {
        q: "Why Friendly for sleep apps?",
        a: "Because rest is gentle and human, and Friendly's rounded type plus calm voice match that. The soft dark palette comes from your uploads — most sleep apps ship those tones, so the marketing inherits them.",
      },
    ],
  },
  {
    slug: "recipe-apps",
    name: "Recipe apps",
    noun: "recipe apps",
    presetId: "friendly",
    lead: "Recipe-app screenshots win on appetite and approachability. The hero is a beautiful finished dish; the second shot proves the app makes cooking it feel doable — clear steps, a sane ingredient list, no nine-paragraph life story before the recipe. The category buyer is hungry and slightly intimidated, so the screenshots have to say \"you can make this\" as loudly as \"this looks delicious.\"",
    whatConverts: [
      "One gorgeous finished dish on the hero — appetite gets the tap.",
      "A clean step-by-step or ingredient view that makes the cooking feel achievable.",
      "Headline copy that lowers the bar (\"Dinner in 6 ingredients\"), not a feature list.",
    ],
    whatHurts: [
      "Cluttered recipe-feed grids as the hero — reads as a search engine, not a cookbook.",
      "Wall-of-text recipe screens with a life-story intro — the exact thing the buyer hates online.",
      "Dim, unappetizing food photos — appetite is the whole conversion lever here.",
    ],
    pitchExample: "A recipe app that turns whatever's in your fridge into a dinner in five steps.",
    faq: [
      {
        q: "Should recipe-app screenshots show the dish or the instructions?",
        a: "Lead with the finished dish — appetite drives the tap. Show the clean step-by-step on a secondary shot to prove the recipe is achievable. Both matter, but the dish goes first.",
      },
      {
        q: "How do I make cooking look easy in a screenshot?",
        a: "Show a short ingredient list and clear, numbered steps with generous spacing. The buyer's fear is a complicated, rambling recipe — a clean, scannable layout is the antidote.",
      },
      {
        q: "Why Friendly for recipe apps?",
        a: "Because cooking is warm and homey, and Friendly's rounded type plus plainspoken voice fit that. The palette comes from your food photography, so a rustic warm app keeps its warmth.",
      },
    ],
  },
  {
    slug: "weather-apps",
    name: "Weather apps",
    noun: "weather apps",
    presetId: "minimal",
    lead: "Weather-app screenshots compete in a category where the default iOS app is free and good, so the indie has to show why theirs is worth a download. The win is one beautiful, glanceable hero — today's conditions rendered as a designed object, not a data dump — plus one clear differentiator like hyperlocal precip or a stunning radar. Personality and clarity, not more numbers, are the levers.",
    whatConverts: [
      "A single glanceable hero — today's weather as a designed, beautiful object.",
      "One clear differentiator shown — minute-by-minute rain, a gorgeous radar, an air-quality read.",
      "Headline copy that names the upgrade (\"Know exactly when the rain starts\"), not \"forecast\".",
    ],
    whatHurts: [
      "Data-dense panels with twelve metrics — indistinguishable from the free default app.",
      "Generic sun/cloud clip-art icons — the category drowns in them.",
      "Ten-day forecast rows as the hero — every weather app has these; they don't differentiate.",
    ],
    pitchExample: "A weather app that tells you the exact minute rain will start at your address.",
    faq: [
      {
        q: "How do I differentiate a weather app in screenshots when iOS Weather is free?",
        a: "Lead with what the default app can't do — hyperlocal precipitation timing, a beautiful radar, air quality, or a design personality that's genuinely better. The hero has to answer \"why not just use the free one?\" in one glance.",
      },
      {
        q: "Should I show the forecast list or the current conditions?",
        a: "Lead with current conditions rendered beautifully — it's the most-used screen and your best chance to show design personality. The forecast list is a commodity; keep it secondary.",
      },
      {
        q: "Why Minimal for weather apps?",
        a: "Because a glanceable, beautiful weather hero is about restraint and typography, not data density. Minimal lets one clear reading carry the shot. Palette is sampled from your uploads.",
      },
    ],
  },
  {
    slug: "journaling-apps",
    name: "Journaling apps",
    noun: "journaling apps",
    presetId: "minimal",
    lead: "Journaling-app screenshots are intimate, like note-taking but more emotional. The hero should feel like a real person's private entry — a few honest lines, a date, maybe a mood — rendered with enough whitespace that the app feels safe and unhurried. The buyer is looking for a quiet place to think; a busy, gamified, streak-heavy screenshot signals the opposite of the calm they want.",
    whatConverts: [
      "One real-feeling entry — a few honest, imperfect lines, not a polished paragraph.",
      "A calm, spacious layout that signals the app is a private, unhurried space.",
      "Headline copy that names the feeling (\"A quiet place to think out loud\"), not the feature.",
    ],
    whatHurts: [
      "Streak counters and badges in the hero — gamification undercuts the reflective mood.",
      "Lorem-ipsum or obviously fake entries — readers feel the inauthenticity instantly.",
      "Cluttered prompts and templates everywhere — reads as work, not reflection.",
    ],
    pitchExample: "A journaling app that asks one good question a day and remembers your answers.",
    faq: [
      {
        q: "Should journaling-app screenshots show real entries?",
        a: "Show real-feeling entries — a few honest, slightly imperfect lines. Avoid lorem ipsum; the whole category runs on emotional authenticity, and a fake entry breaks the trust instantly.",
      },
      {
        q: "Is it worth showing streaks or prompts?",
        a: "Sparingly, and not on the hero. A daily prompt can be a secondary shot, but heavy gamification works against the reflective, private mood that makes someone choose a journaling app.",
      },
      {
        q: "Why Minimal for journaling apps?",
        a: "Because reflection needs quiet, and whitespace is the visual form of quiet. Minimal uses restraint and typography to make the app feel like a safe, unhurried space. Palette comes from your uploads.",
      },
    ],
  },
  {
    slug: "task-management-apps",
    name: "Task management apps",
    noun: "task management apps",
    presetId: "minimal",
    lead: "Task-management screenshots sit in the most ruthlessly competitive corner of productivity. To stand out you show one workflow done beautifully — a single project, a clean today-view, a satisfying completed task — and resist the urge to prove depth by cramming in boards, calendars, and dependencies. Buyers fleeing a bloated tool want to see calm and focus, not a feature arms race.",
    whatConverts: [
      "One clean today-view or project — a single workflow shown end to end.",
      "A satisfying moment of completion — a checked task, an emptied inbox, a cleared day.",
      "Headline copy that names the relief (\"Know what to do next, always\"), not the feature matrix.",
    ],
    whatHurts: [
      "Kanban + calendar + list + timeline crammed into one shot to prove power — reads as overwhelm.",
      "Dense feature-comparison-style screens — the buyer left a complicated tool to escape exactly this.",
      "Stock illustrations of busy office teams — signals enterprise SaaS, not a focused personal tool.",
    ],
    pitchExample: "A task app that shows you only today, so you stop drowning in your own backlog.",
    faq: [
      {
        q: "How do I differentiate a task app in a crowded category?",
        a: "Show one opinionated workflow beautifully instead of proving breadth. Buyers are fleeing bloated tools — the differentiator that converts is a clear, calm view that makes \"what do I do next\" obvious.",
      },
      {
        q: "Should I show multiple views (board, calendar, list) in screenshots?",
        a: "Pick the one your app does best and lead with it. Showing every view at once signals the same overload the buyer is trying to escape. Depth can live on secondary shots, one view per shot.",
      },
      {
        q: "Why Minimal for task management apps?",
        a: "Because the buyer's pain is overload, and whitespace is the visual promise of calm. Minimal uses restraint over ornament. Palette is sampled from your uploaded screenshots.",
      },
    ],
  },
  {
    slug: "health-tracking-apps",
    name: "Health tracking apps",
    noun: "health tracking apps",
    presetId: "professional",
    lead: "Health-tracking screenshots have to make personal data feel clear and trustworthy without tipping into clinical or alarming. The hero shows one meaningful metric and what it means — a resting heart rate with context, a trend that's improving — rendered calmly. The category buyer wants to feel informed and in control, not diagnosed, so restraint and a single clear reading beat a dashboard of every available number.",
    whatConverts: [
      "One meaningful metric with plain-language context (\"Resting HR: 58 · better than last month\").",
      "A clean trend line that shows direction, not a wall of overlapping medical charts.",
      "Headline copy framing empowerment (\"Understand your body's patterns\"), not diagnosis.",
    ],
    whatHurts: [
      "Dashboards crammed with every available metric — reads as overwhelming and clinical.",
      "Alarming red warnings or fake medical alerts — frightens buyers and risks App Review scrutiny.",
      "Stock photos of stethoscopes or lab coats — signals clinical software, not a personal tool.",
    ],
    pitchExample: "A health app that turns your wearable data into one plain-English insight a day.",
    faq: [
      {
        q: "Can health-tracking screenshots show medical-looking data?",
        a: "Show illustrative health metrics, but avoid implying diagnosis or medical advice unless your app is actually a regulated medical device. Apple scrutinizes health claims closely — keep screenshots about insight and tracking, not treatment.",
      },
      {
        q: "How do I avoid making a health app look clinical or scary?",
        a: "Lead with one positive, contextualized metric and plain language. Avoid red alerts, dense medical charts, and clinical stock imagery. The buyer wants to feel in control and informed, not diagnosed.",
      },
      {
        q: "Why Professional for health tracking apps?",
        a: "Because trust and clarity carry this category, and Professional's restrained type plus confident copy signal a credible tool. Theme and palette are sampled from your uploads — light app stays light.",
      },
    ],
  },
  {
    slug: "real-estate-apps",
    name: "Real estate apps",
    noun: "real estate apps",
    presetId: "minimal",
    lead: "Real-estate-app screenshots sell the dream of a place. The hero is a beautiful property photo in a clean listing layout — big image, clear price, one tappable detail — the way a great listing should look. The second shot proves the app's edge: a map, a saved-search alert, a mortgage estimate. The failure mode is a cramped results list of thumbnails that looks like every portal already on the buyer's phone.",
    whatConverts: [
      "One stunning property photo in a clean listing layout — big image, clear price.",
      "One differentiator shown — instant alerts, a map view, a clear affordability estimate.",
      "Headline copy naming the win (\"Be first to see new listings in your block\"), not \"property search\".",
    ],
    whatHurts: [
      "Cramped thumbnail result-lists as the hero — indistinguishable from every property portal.",
      "Low-quality or generic house stock photos — the listing photo IS the conversion lever.",
      "Dense filter panels in the hero — search controls belong behind the beautiful listing, not in front.",
    ],
    pitchExample: "A real estate app that texts you the second a place in your budget hits your street.",
    faq: [
      {
        q: "Should real-estate screenshots show real listings?",
        a: "Use real-looking listings with plausible photos, prices, and locations. If you have permission to show actual inventory, even better — Apple wants screenshots to match the real experience, and real listings read as trustworthy.",
      },
      {
        q: "Lead with the listing or the map?",
        a: "Lead with a single beautiful listing — the property photo is the strongest emotional pull. Put the map or search alerts on a secondary shot unless mapping is your core differentiator.",
      },
      {
        q: "Why Minimal for real estate apps?",
        a: "Because the property photo should be the hero, not your UI. Minimal uses whitespace and restrained type so the listing carries the shot. Palette is sampled from your uploads.",
      },
    ],
  },
  {
    slug: "shopping-list-apps",
    name: "Shopping list apps",
    noun: "shopping list apps",
    presetId: "minimal",
    lead: "Shopping-list screenshots win on speed and clarity. The buyer wants to see one clean list, fast adding, and ideally a shared-with-partner moment — the everyday utility that makes the app stick. Over-designing the category (recipes, budgets, pantry inventory) buries the core promise: a list that's quicker and tidier than the notes app they're using now.",
    whatConverts: [
      "One clean, scannable list with items grouped sensibly (by aisle or category).",
      "A fast-add or shared-list moment shown — the everyday stickiness of the app.",
      "Headline copy naming the upgrade (\"A grocery list you actually share\"), not a feature dump.",
    ],
    whatHurts: [
      "Cluttered screens mixing recipes, budgets, and pantry tracking — buries the core list.",
      "A blank empty-state list as the hero — shows nothing about why the app is better.",
      "Generic shopping-cart / basket stock icons — adds nothing the buyer needs to see.",
    ],
    pitchExample: "A shared grocery list that auto-sorts by aisle so two people shop in half the time.",
    faq: [
      {
        q: "Should shopping-list screenshots show a full or empty list?",
        a: "Show a populated, real-feeling list — a dozen plausible grocery items grouped by aisle. An empty list proves nothing; a well-organized full one demonstrates exactly why your app beats a plain notes app.",
      },
      {
        q: "Is the sharing feature worth a screenshot?",
        a: "Yes, if you support it — shared lists are a top reason couples and families pick one of these apps. Show two people on the same list as a secondary shot; it's a strong differentiator.",
      },
      {
        q: "Why Minimal for shopping list apps?",
        a: "Because the whole value is a cleaner, faster list, and whitespace plus clear type deliver that. Minimal keeps the focus on the list itself. Palette comes from your uploads.",
      },
    ],
  },
  {
    slug: "vpn-apps",
    name: "VPN apps",
    noun: "VPN apps",
    presetId: "professional",
    lead: "VPN-app screenshots sell trust and simplicity at once. The buyer wants one big reassuring \"Connected\" state and a sense that privacy is one tap away — not a control panel of protocols and ports. The category is crowded and full of sketchy free apps, so a clean, confident, premium-feeling screenshot is itself a credibility signal. Lead with the calm of being protected, prove with one concrete capability.",
    whatConverts: [
      "One big, reassuring connection state — a clear \"Protected\" moment, one tap from off.",
      "A simple server/location picker that looks effortless, not like network administration.",
      "Headline copy naming the outcome (\"Private browsing, one tap away\"), not protocol specs.",
    ],
    whatHurts: [
      "Technical panels full of protocols, ports, and toggles — intimidates the mainstream buyer.",
      "Hype security imagery (hooded hackers, padlock-on-binary) — signals a low-trust app.",
      "\"100% anonymous\" or absolute privacy guarantees — credibility and compliance risk.",
    ],
    pitchExample: "A VPN that turns on the moment you join any Wi-Fi you've never used before.",
    faq: [
      {
        q: "What privacy claims can VPN screenshots safely make?",
        a: "Stick to accurate, specific claims about what the app does (encrypts traffic, hides IP). Avoid absolute guarantees like \"100% anonymous\" — they're a compliance risk and undermine credibility with informed buyers.",
      },
      {
        q: "Should I show the technical settings in screenshots?",
        a: "No — lead with simplicity. A big reassuring \"Connected\" state converts the mainstream buyer far better than a panel of protocols. Power settings can be a minor secondary shot at most.",
      },
      {
        q: "Why Professional for VPN apps?",
        a: "Because trust is the whole game in a category full of sketchy free apps, and Professional's restrained type plus confident copy signal a credible product. Theme is sampled from your uploads.",
      },
    ],
  },
  {
    slug: "pet-care-apps",
    name: "Pet care apps",
    noun: "pet care apps",
    presetId: "friendly",
    lead: "Pet-care screenshots have a secret weapon: the pet. A great photo or illustration of a dog or cat earns the tap on emotion alone, and then one clear care feature — a feeding schedule, a vet reminder, a walk tracker — proves the utility. The category buyer loves their animal and wants to feel like a better owner, so warmth beats clinical, and the pet always belongs on the hero.",
    whatConverts: [
      "A charming pet photo or illustration on the hero — emotion earns the tap.",
      "One clear care feature shown — feeding schedule, med reminder, walk log — proving daily usefulness.",
      "Headline copy naming the care moment (\"Never miss a dose again\"), not a feature list.",
    ],
    whatHurts: [
      "Dense health-record dashboards as the hero — clinical, not loving.",
      "Generic clip-art paw prints instead of an actual appealing animal.",
      "Cramming feeding, walking, vet, grooming, and training into one busy shot.",
    ],
    pitchExample: "A pet app that reminds the whole household whose turn it is to walk the dog.",
    faq: [
      {
        q: "Should pet-care screenshots show real pets?",
        a: "Yes — an appealing real or illustrated pet on the hero is your strongest emotional asset. Real animal photos (yours or licensed) convert far better than generic paw-print icons.",
      },
      {
        q: "How many care features should I show?",
        a: "Lead with one clear feature per shot. Pet apps often do feeding, walking, vet records, and reminders, but cramming them into one screen reads as cluttered. One job per shot keeps it warm and clear.",
      },
      {
        q: "Why Friendly for pet care apps?",
        a: "Because pet ownership is warm and loving, and Friendly's rounded type plus plainspoken voice match that. The palette comes from your uploads, so a playful bright app stays playful.",
      },
    ],
  },
  {
    slug: "parenting-apps",
    name: "Parenting apps",
    noun: "parenting apps",
    presetId: "friendly",
    lead: "Parenting-app screenshots speak to exhausted, anxious, deeply caring people. The hero needs warmth and reassurance — one clear feature that makes a hard job slightly easier, shown calmly, with copy that doesn't add to the guilt parents already carry. Whether it's feed tracking, milestone logging, or sleep schedules, the message is the same: this app is on your side, and it's simple enough to use one-handed at 3am.",
    whatConverts: [
      "One reassuring feature shown simply — a feed log, a milestone, a sleep schedule.",
      "Warm, calm visuals and copy that reduce guilt rather than add to it.",
      "Headline copy naming the relief (\"One less thing to remember\"), not a feature inventory.",
    ],
    whatHurts: [
      "Dense data-tracking grids as the hero — overwhelming to a sleep-deprived parent.",
      "Judgmental or anxiety-inducing copy (\"Are you doing enough?\") — the worst possible tone.",
      "Stock photos of impossibly perfect smiling families — alienating to real, tired parents.",
    ],
    pitchExample: "A baby app you can log a 3am feed in with one thumb, half-asleep.",
    faq: [
      {
        q: "What tone should parenting-app screenshots use?",
        a: "Warm, reassuring, and guilt-free. Parents are already anxious — copy that implies they're falling short backfires badly. Lead with \"this makes it easier\" not \"you should be tracking more.\"",
      },
      {
        q: "Should I show real families in screenshots?",
        a: "Avoid stock photos of picture-perfect families — they alienate real, exhausted parents. Lead with the in-app experience and warm illustration instead; it sidesteps both the cliché and any consent issues.",
      },
      {
        q: "Why Friendly for parenting apps?",
        a: "Because parenting is emotional and these buyers need reassurance, which Friendly's rounded type and gentle voice provide. The palette is sampled from your uploads, so a soft pastel app stays soft.",
      },
    ],
  },
  {
    slug: "scanner-apps",
    name: "Scanner apps",
    noun: "scanner apps",
    presetId: "professional",
    lead: "Scanner-app screenshots prove a transformation: a messy phone photo of a document becomes a crisp, cropped, professional PDF. Like photo editors, the highest-converting shot is the before/after — show the imperfect input and the clean output. The buyer wants to replace a real scanner, so the screenshot has to make the output look genuinely professional, not just \"a photo with a filter.\"",
    whatConverts: [
      "A before/after — a skewed phone photo of a page becoming a crisp, cropped PDF.",
      "One clean finished document on the hero — the output looking genuinely professional.",
      "Headline copy naming the replacement (\"A scanner in your pocket\"), not the feature list.",
    ],
    whatHurts: [
      "Toolbar-and-settings screenshots as the hero — proves the work, not the result.",
      "Obviously low-quality output that looks like a photo, not a scan — undercuts the whole pitch.",
      "Generic document / paperwork stock imagery instead of your app's actual output.",
    ],
    pitchExample: "A scanner app that turns a crumpled receipt into a clean, searchable PDF in one tap.",
    faq: [
      {
        q: "Should scanner-app screenshots use before/after?",
        a: "Yes — before/after is the strongest shot type here. Show a skewed, shadowed phone photo of a document transforming into a crisp, cropped, professional scan. The transformation is the entire value proposition.",
      },
      {
        q: "How do I make the output look professional?",
        a: "Show a clean, high-contrast, properly cropped document — ideally with edge detection and shadow removal visible in the result. The buyer is replacing a real scanner, so the output must look like a real scan.",
      },
      {
        q: "Why Professional for scanner apps?",
        a: "Because the output needs to read as business-grade, and Professional's restrained type plus confident copy reinforce that. Theme and palette are sampled from your uploads.",
      },
    ],
  },
  {
    slug: "language-translation-apps",
    name: "Translation apps",
    noun: "translation apps",
    presetId: "minimal",
    lead: "Translation-app screenshots have to show the moment of understanding — a phrase in one language becoming clear in another, instantly. The hero is the translation itself: two languages, side by side or transforming, big enough to read. Camera translation and live conversation modes are strong differentiators worth a secondary shot. The failure is a settings-heavy screen that hides the one magical thing the app does.",
    whatConverts: [
      "The translation moment itself — two languages shown clearly transforming or side by side.",
      "A real differentiator shown — camera translation, live conversation, or offline mode.",
      "Headline copy naming the situation (\"Order dinner in any country\"), not \"translate text\".",
    ],
    whatHurts: [
      "Settings and language-list screens as the hero — buries the magic.",
      "Latin-only example phrases for an app that translates non-Latin scripts — show the actual scripts.",
      "Generic globe / speech-bubble stock imagery the whole category leans on.",
    ],
    pitchExample: "A translation app that reads a foreign menu through your camera in real time.",
    faq: [
      {
        q: "Should translation-app screenshots show the actual target languages?",
        a: "Yes, prominently — show real scripts (Japanese, Arabic, Cyrillic) at large size. Buyers scanning the carousel make the language → app connection visually. Latin-only examples waste your strongest visual signal.",
      },
      {
        q: "Is camera or conversation translation worth featuring?",
        a: "Absolutely — these are the differentiators that beat the free defaults. Show camera translation of a real-looking sign or menu, or a live conversation, on a secondary shot. They're the reasons someone pays.",
      },
      {
        q: "Why Minimal for translation apps?",
        a: "Because the translation should be the hero, clean and legible, not buried in UI. Minimal uses whitespace and clear type so the languages carry the shot. Palette comes from your uploads.",
      },
    ],
  },
  {
    slug: "invoicing-apps",
    name: "Invoicing apps",
    noun: "invoicing apps",
    presetId: "professional",
    lead: "Invoicing-app screenshots sell freelancers and small businesses one thing: getting paid faster with less hassle. The hero shows a clean, professional-looking invoice — the kind the buyer would be proud to send a client — and the second shot proves the speed (create in seconds, get paid online). Accounting jargon and dense settings kill it; the buyer wants to look professional and stop chasing payments.",
    whatConverts: [
      "One polished, professional-looking invoice on the hero — the artifact the buyer sends clients.",
      "A speed or payment moment — \"invoice created in 30 seconds\" or \"paid online\" — as proof.",
      "Headline copy naming the outcome (\"Get paid twice as fast\"), not accounting features.",
    ],
    whatHurts: [
      "Dense accounting dashboards with ledgers and reports — intimidating to a solo freelancer.",
      "Accounting jargon (\"accruals\", \"reconciliation\") that scares off the non-accountant buyer.",
      "An ugly, template-y invoice in the hero — the invoice IS the product they're judging.",
    ],
    pitchExample: "An invoicing app that turns a tracked hour into a paid invoice before the client forgets.",
    faq: [
      {
        q: "What should the hero invoicing screenshot show?",
        a: "A clean, professional-looking invoice — because that's the artifact your buyer will send clients, and it's what they're judging. Make it the kind of invoice a freelancer would be proud to put their name on.",
      },
      {
        q: "How do I avoid scaring off non-accountant buyers?",
        a: "Skip the accounting jargon and dense ledger views. Lead with creating an invoice and getting paid. Most solo buyers want to look professional and get paid fast, not learn double-entry bookkeeping.",
      },
      {
        q: "Why Professional for invoicing apps?",
        a: "Because the buyer is selling professionalism to their own clients, and Professional's clean type plus confident copy reinforce that. Theme and palette are sampled from your uploads.",
      },
    ],
  },
  {
    slug: "running-apps",
    name: "Running apps",
    noun: "running apps",
    presetId: "bold",
    lead: "Running-app screenshots sell momentum and the open road. The hero is motion — a route on a map, a pace climbing, a runner mid-stride — that makes someone want to lace up right now. Runners are data-curious but emotion-driven; the screenshot should lead with the feeling of a good run and prove it with one clean metric, not bury the joy under splits, cadence, and heart-rate zones.",
    whatConverts: [
      "One motion-forward hero — a route map, a pace, a runner in stride — that sparks the urge to go run.",
      "A single clean metric (a 5K time, a weekly distance) instead of a wall of running data.",
      "Headline copy naming the win (\"Run your first 10K\"), not the feature (\"GPS tracking\").",
    ],
    whatHurts: [
      "Dense stat screens with splits, cadence, and zones — data overload buries the emotion.",
      "Stock photos of marathon crowds — generic, and not about the buyer's own run.",
      "Empty-state route maps with no run on them — proves nothing about the experience.",
    ],
    pitchExample: "A running app that builds tomorrow's run from how today's felt.",
    faq: [
      {
        q: "Should running-app screenshots lead with the map or the stats?",
        a: "Lead with a route map or a moment of motion — the emotional pull of a run beats a stat screen. Show one clean metric on a secondary shot. Runners are data-curious but they download on the feeling.",
      },
      {
        q: "How much running data should I show?",
        a: "One clean metric per shot. A 5K time, a weekly total, a single pace line. A screen crammed with splits, cadence, and heart-rate zones reads as homework and buries the joy that drives the download.",
      },
      {
        q: "Why Bold for running apps?",
        a: "Because running is energy and momentum, and Bold's oversized type matches that intensity. The palette comes from your uploads, so a high-energy neon app keeps its punch.",
      },
    ],
  },
  {
    slug: "ar-apps",
    name: "AR apps",
    noun: "AR apps",
    presetId: "bold",
    lead: "AR-app screenshots have to prove the illusion: a digital object convincingly placed in a real environment. The hero is the magic moment — furniture in a real room, a creature on a real table, a measurement overlaid on a real wall — captured so cleanly that the buyer believes it works. Flat UI mockups waste the category's entire advantage; AR screenshots should look like a frame from the actual AR experience.",
    whatConverts: [
      "The AR illusion captured cleanly — a digital object convincingly placed in a real scene.",
      "A relatable real-world environment (a living room, a desk) so the placement reads as believable.",
      "Headline copy naming the use (\"See the couch in your room before you buy\"), not \"augmented reality\".",
    ],
    whatHurts: [
      "Flat 2D UI mockups that show none of the AR magic — wastes the whole category advantage.",
      "Obviously fake composites where the object floats or casts no shadow — breaks the illusion.",
      "\"Powered by ARKit\" tech-spec headlines instead of showing what the buyer can actually do.",
    ],
    pitchExample: "An AR app that drops any furniture into your real room at true scale before you buy.",
    faq: [
      {
        q: "Should AR-app screenshots show the AR view or the UI?",
        a: "Lead with the AR view — a digital object convincingly placed in a real environment is the entire reason the app exists. UI panels can be a minor secondary shot; the magic moment has to be the hero.",
      },
      {
        q: "How do I make AR screenshots look believable?",
        a: "Show correct scale, shadows, and a relatable real-world setting. A composite where the object floats or doesn't match the lighting breaks the illusion and makes buyers doubt the app actually works.",
      },
      {
        q: "Why Bold for AR apps?",
        a: "Because AR is a wow-factor category and oversized, confident type matches that energy. The palette comes from your captured AR scenes, so the marketing reflects your actual experience.",
      },
    ],
  },
  {
    slug: "ai-chatbot-apps",
    name: "AI chatbot apps",
    noun: "AI chatbot apps",
    presetId: "minimal",
    lead: "AI-chatbot screenshots are deceptively hard: an empty chat box proves nothing, and a generic conversation looks like every other wrapper. The win is showing one specific, impressive exchange — a real question and a genuinely useful answer — so the buyer sees the value, not just the interface. Clean conversation layout with a great example exchange beats any \"powered by GPT\" badge.",
    whatConverts: [
      "One specific, impressive exchange — a real question with a genuinely useful, well-formatted answer.",
      "A clean conversation layout that makes the response easy to read and clearly valuable.",
      "Headline copy naming the use case (\"Your study buddy for any subject\"), not the underlying model.",
    ],
    whatHurts: [
      "An empty chat box as the hero — proves nothing about what the bot actually does.",
      "Generic small-talk exchanges (\"Hi!\" / \"Hello! How can I help?\") that show zero value.",
      "\"Powered by GPT-4\" badges instead of demonstrating the quality of the output.",
    ],
    pitchExample: "An AI chatbot that explains any concept at the exact level you ask for.",
    faq: [
      {
        q: "What should an AI-chatbot screenshot actually show?",
        a: "One specific, valuable exchange — a real question and a genuinely useful, well-formatted answer. The example exchange is your whole pitch; an empty chat box or a generic \"how can I help?\" proves nothing.",
      },
      {
        q: "How do I stand out from other AI chatbot wrappers?",
        a: "Show what your bot does better, concretely. A great example answer tailored to a real use case beats any model-name badge. Specificity — \"explains code at your level\" — is the differentiator buyers can see.",
      },
      {
        q: "Why Minimal for AI chatbot apps?",
        a: "Because the conversation should be the hero, clean and readable, not buried in chrome. Minimal uses whitespace and clear type so the example exchange carries the shot. Palette comes from your uploads.",
      },
    ],
  },
  {
    slug: "ebook-reader-apps",
    name: "Ebook reader apps",
    noun: "ebook reader apps",
    presetId: "minimal",
    lead: "Ebook-reader screenshots sell the pleasure of reading. The hero is a beautiful reading page — typography, comfortable margins, a warm or paper-like background — that makes the buyer want to curl up with it. The differentiators (library, sync, highlights, fonts) matter but go on secondary shots. The failure mode is a cluttered library grid that looks like a store, when the buyer is shopping for a better place to read.",
    whatConverts: [
      "A beautiful reading page — gorgeous typography, comfortable margins, a paper-like background.",
      "One reading-experience differentiator — adjustable fonts, a warm night theme, distraction-free mode.",
      "Headline copy naming the pleasure (\"Reading that feels like paper\"), not feature counts.",
    ],
    whatHurts: [
      "Cluttered library grids as the hero — reads as a bookstore, not a reading sanctuary.",
      "Cramped, badly-spaced text that looks uncomfortable to actually read.",
      "Generic stacked-books or open-book stock imagery instead of your actual reading view.",
    ],
    pitchExample: "An ebook reader with typography so good you forget you're reading on a phone.",
    faq: [
      {
        q: "Should ebook-reader screenshots show the library or the reading page?",
        a: "Lead with the reading page — beautiful typography and comfortable layout are the experience the buyer is shopping for. The library is a secondary shot. Sell the pleasure of reading before the size of the catalog.",
      },
      {
        q: "How do I handle book covers and rights in screenshots?",
        a: "Use public-domain titles, your own example content, or covers you have permission to show. Featuring real copyrighted book covers prominently without clearance risks rejection — public-domain classics are a safe, credible choice.",
      },
      {
        q: "Why Minimal for ebook reader apps?",
        a: "Because reading is about calm and typography, and Minimal makes the page itself the hero with restraint and whitespace. Theme is sampled from your uploads, so a warm sepia reader keeps its warmth.",
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
