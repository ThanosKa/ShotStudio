export type Competitor = {
  slug: string;
  name: string;
  /** What category they sit in (matches how customers describe them). */
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
    slug: "appmockup",
    name: "AppMockUp",
    positioning: "Browser-based mockup generator with a long template library.",
    pricingModel: "Subscription",
    pricingNote: "Free tier with watermark; paid plans charged monthly.",
    primaryWeakness: "Subscription priced for a job most indies do twice a year — and most plans still require manually arranging shots in a template editor.",
    honestStrengths: [
      "Genuinely large template library — useful if you want a specific vintage device or platform.",
      "Direct browser tool with no signup needed for the free tier.",
      "Solid for one-off mockups when you already know exactly what you want.",
    ],
    featureGaps: [
      "Recurring monthly fee for what is usually a one-shot job at app launch.",
      "No AI-written headline — you bring the copy yourself.",
      "Generic template aesthetic — your screenshots end up looking like every other AppMockUp listing.",
      "Manual layout work per shot adds up across a 3-screenshot set.",
    ],
    whenTheyAreRight: "If you genuinely use mockups across many devices and platforms throughout the year — not just one App Store launch — the subscription pays for itself.",
  },
  {
    slug: "previewed",
    name: "Previewed",
    positioning: "Designer-aimed mockup tool with strong template aesthetics.",
    pricingModel: "Subscription + one-time",
    pricingNote: "Mixed model — some templates one-time, premium features behind monthly subscription.",
    primaryWeakness: "Looks great in the hands of a designer, but the indie developer without a design background still ends up arranging layers manually.",
    honestStrengths: [
      "Genuinely well-designed templates — visually the strongest of the legacy mockup tools.",
      "Multiple device frames and orientations.",
      "Decent free tier for trying before you buy.",
    ],
    featureGaps: [
      "Assumes you know what makes a screenshot convert — gives you tools, not opinions.",
      "No category-aware preset selection — you pick from dozens without guidance.",
      "Pricing model is confusing (mix of one-time and subscription) — you can't predict total cost.",
      "Manual layout per shot.",
    ],
    whenTheyAreRight: "If you are or work with a designer and want pixel-precise control over a custom set of templates, Previewed gives you the cleanest canvas in the category.",
  },
  {
    slug: "rotato",
    name: "Rotato",
    positioning: "3D animation tool for App Store screenshots and trailers.",
    pricingModel: "Subscription",
    pricingNote: "Monthly or annual subscription with limited free tier.",
    primaryWeakness: "Built for animated trailers and 3D mockups — overkill for the indie shipping a static screenshot set the night before submission.",
    honestStrengths: [
      "Actually unique in the category — 3D animations and rotating device mockups few others can match.",
      "Strong for App Preview videos, not just static screenshots.",
      "Polished, opinionated tool from a small team.",
    ],
    featureGaps: [
      "Designed around video and 3D — most of its features are overkill for a static screenshot set.",
      "Steeper learning curve than indies want for a one-night job.",
      "Subscription model for what most indies do twice a year.",
      "No AI-written headlines or copy assistance.",
    ],
    whenTheyAreRight: "If you want App Preview videos with 3D rotating device mockups, Rotato is genuinely the best in class. For static screenshots only, it's more tool than the job needs.",
  },
  {
    slug: "shotbot",
    name: "Shotbot",
    positioning: "Mac app for batch-generating App Store screenshots from raw screens.",
    pricingModel: "One-time + paid templates",
    pricingNote: "One-time app purchase with additional paid template packs.",
    primaryWeakness: "Native Mac app means setup friction and a Mac requirement; no AI styling means the output is only as good as the templates you bought.",
    honestStrengths: [
      "True one-time pricing — no subscription on the core app.",
      "Batch processing for multiple device sizes is genuinely useful.",
      "Native Mac performance, no browser quirks.",
    ],
    featureGaps: [
      "Requires installing a Mac app — friction vs. a browser tool the night before submission.",
      "Mac-only — locks out indies on Windows or Linux.",
      "Template-driven, no AI styling or category-aware preset.",
      "No AI-written headline copy — bring your own.",
    ],
    whenTheyAreRight: "If you ship a lot of apps and need multi-device batch processing on a Mac, Shotbot's local-app model is faster than any browser tool.",
  },
  {
    slug: "screenshots-pro",
    name: "Screenshots.pro",
    positioning: "Subscription web tool with a large template gallery.",
    pricingModel: "Subscription",
    pricingNote: "Monthly subscription required for export without watermark.",
    primaryWeakness: "Subscription-priced for a job most indies do once a year — and the templates feel template-y, even after customization.",
    honestStrengths: [
      "Large gallery of templates covering many app categories.",
      "Browser-based — no install required.",
      "Decent free tier for previewing before you commit.",
    ],
    featureGaps: [
      "Subscription model with watermark on the free tier — exports require a paid month minimum.",
      "Templates look like templates — outputs are pattern-matchable as Screenshots.pro by other indies.",
      "No category-aware AI preset — you scroll a gallery instead of getting an opinion.",
      "No AI-written headline.",
    ],
    whenTheyAreRight: "If you ship many apps a year and want a single recurring tool to handle them all, Screenshots.pro's gallery is broad enough to cover most categories.",
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
