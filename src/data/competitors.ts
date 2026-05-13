export type Competitor = {
  slug: string;
  name: string;
  /** What category they sit in (matches how customers describe them). Phrased to read naturally after "[Name] is ". */
  positioning: string;
  pricingModel: string;
  pricingNote: string;
  /** One-sentence honest weakness — the reason indies look for alternatives. */
  primaryWeakness: string;
  /** 2-3 honest strengths — credibility builder. Don't lie. */
  honestStrengths: string[];
  /** 3-5 specific gaps vs ShotStudio's positioning. */
  featureGaps: string[];
  /** Who actually still picks them today (the anti-anti-persona). */
  whenTheyAreRight: string;
};

export const COMPETITORS: Competitor[] = [
  {
    slug: "screenshots-pro",
    name: "Screenshots.pro",
    positioning: "A subscription screenshot generator with a $19–$49/mo paywall and a logo wall (Google, Reddit, Revolut).",
    pricingModel: "Subscription",
    pricingNote: "Free tier + $19/mo Standard + $49/mo Extended (35% off annual).",
    primaryWeakness: "A monthly bill for what most indies do once or twice a year — and the locale, 3D angles, and custom fonts you actually want sit behind the paid tier.",
    honestStrengths: [
      "API access on the Extended tier — genuinely useful for agencies wiring screenshots into a pipeline.",
      "Localization built in, which most indie tools punt on.",
      "Strong brand wall (Google, Reddit, Revolut, Upwork) and a refund-on-conversion-lift guarantee.",
    ],
    featureGaps: [
      "Subscription pricing for a job most indies do once a year — easy to forget to cancel.",
      "Template editor, not a generator — you still drag, align, and write the headline.",
      "Cloud-stored projects — your unreleased screenshots sit on someone else's disk.",
      "No AI-written headline from your pitch.",
      "Theme and palette don't auto-derive from your app — pick from a gallery instead.",
    ],
    whenTheyAreRight: "If you ship many apps a year, localize across multiple stores, or want API access to generate screenshots from CI, the Extended tier earns its $49/mo.",
  },
  {
    slug: "appmockup",
    name: "AppMockUp",
    positioning: "A donation-funded, free-forever browser tool with 400+ templates and 7M+ screenshots generated.",
    pricingModel: "Free forever",
    pricingNote: "$0 — no paid tier. Donations via Buy Me a Coffee.",
    primaryWeakness: "Free is unbeatable on price, but the workflow is still manual template editing — you pick the template, drag the elements, write the copy, and the output looks like everyone else who used AppMockUp.",
    honestStrengths: [
      "Genuinely free, forever — no tier, no watermark, no signup required to start.",
      "400+ templates and 7M+ screenshots generated — the biggest community footprint in the category.",
      "Mesh-gradient and pattern generators give designer-grade flourishes most free tools skip.",
    ],
    featureGaps: [
      "Manual template editing — you do all the design, ShotStudio does it for you.",
      "No AI-generated layout, no AI-written headline.",
      "Theme doesn't match your app — you pick from a gallery, not from your uploads.",
      "No support guarantee — it's a donation project, not a service with an SLA.",
      "No auto-refund or retry on a bad output — you regenerate manually.",
    ],
    whenTheyAreRight: "If your budget is exactly $0 and you don't mind spending an evening in a template editor, AppMockUp is the most respected free option in the category.",
  },
  {
    slug: "previewed",
    name: "Previewed",
    positioning: "A browser-based 3D mockup tool that covers App Store shots, social media mockups, and promo videos in one app.",
    pricingModel: "Free + $9.99 one-time + $19/mo",
    pricingNote: "Lite free (720p, CC attribution) · Plus $9.99 one-time (3D + video) · Pro $228/yr.",
    primaryWeakness: "The closest competitor on pricing — but their $9.99 Plus tier still hands you a mockup editor, not a generator. You're choosing templates, posing devices, and writing the copy yourself.",
    honestStrengths: [
      "$9.99 one-time Plus is the closest one-time-pay option in the category — already validated the no-subscription model.",
      "3D snapshots and promo-video output cover use cases ShotStudio doesn't touch.",
      "Exports stay in your account forever — even after a subscription lapses.",
    ],
    featureGaps: [
      "Free tier requires CC attribution — your published screenshots credit them, not you.",
      "Template editor, not a screenshot generator — manual layout per shot.",
      "No AI-written headline from your one-line pitch.",
      "Theme and palette don't sample from your uploaded screens.",
      "Cloud-stored templates and exports — privacy posture is the opposite of ours.",
    ],
    whenTheyAreRight: "If you want 3D animation or a promo video alongside your static screenshots, Previewed covers more surface area than ShotStudio in one tool.",
  },
  {
    slug: "rotato",
    name: "Rotato",
    positioning: "A premium one-time-pay 3D mockup desktop app used by Adobe, Google, Amazon, and 200,000+ designers.",
    pricingModel: "One-time pay",
    pricingNote: "Basic, Standard, Premium one-time tiers (no subscription) with 6–12 months of updates.",
    primaryWeakness: "The strongest brand in the category, but it's built for designers and agencies making 3D animation reels — not for an indie who needs three static shots before tomorrow's App Store submission.",
    honestStrengths: [
      "Real 3D engine with 8K export and a Figma plugin — actually different from 2D-template competitors.",
      "True one-time payment model already proven at scale across 200,000+ users.",
      "Brand wall (Adobe, Airbnb, Amazon, Frog Design, Google, Starbucks, Uber, Warner Bros) is unmatched in this category.",
    ],
    featureGaps: [
      "Desktop app required — friction vs. a browser tool the night before submission.",
      "Designed for 3D animation and trailer reels — overkill for three static App Store shots.",
      "Steeper learning curve than indies want for a one-night job.",
      "No AI-generated layout, no AI-written headline.",
      "Entry tier starts well above ShotStudio's $7 floor.",
    ],
    whenTheyAreRight: "If you want an App Preview video with a rotating 3D device, or you're a designer who wants pixel-precise virtual camera control, Rotato is genuinely best in class.",
  },
  {
    slug: "shotbot",
    name: "Shotbot",
    positioning: "A native iOS, macOS, and visionOS app that frames screenshots with Share Sheet, Shortcuts, and iCloud sync.",
    pricingModel: "Free tier + subscription",
    pricingNote: "Free with daily-frame limit + Unlimited subscription via Apple in-app purchase.",
    primaryWeakness: "Lives inside the Apple ecosystem — beautiful Share Sheet integration, but the free tier hits a daily-frame cap at exactly the moment you're trying to ship, and the paid tier is another subscription.",
    honestStrengths: [
      "Native Share Sheet, Shortcuts, and widget integration on iOS, macOS, and visionOS — friction-free if you live in Apple's stack.",
      "Caption guidance derived from analysis of top App Store apps — closest thing to copy assistance in the category.",
      "iCloud sync keeps frames and preferences consistent across all your devices.",
    ],
    featureGaps: [
      "Free tier caps daily frames — exactly the wrong limit on submission night.",
      "Native app required — no browser fallback when you're on a borrowed machine.",
      "Frames and captions, not full AI-generated layouts — same template-editor pattern.",
      "Subscription on a once-a-year job.",
      "iCloud sync — screenshots leave your machine; ShotStudio's never touch our disk.",
    ],
    whenTheyAreRight: "If you live in iOS and want Share Sheet + Shortcuts framing wired into your daily workflow (not just an App Store launch), Shotbot's native integration is unmatched.",
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
