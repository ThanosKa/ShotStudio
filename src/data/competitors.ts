export type CompetitorFaq = { q: string; a: string };

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
  /** 4 FAQs per competitor — fuel for FAQPage schema + body FAQ section. */
  faq: [CompetitorFaq, CompetitorFaq, CompetitorFaq, CompetitorFaq];
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
    faq: [
      {
        q: "Is Screenshots.pro worth it for indie iOS developers?",
        a: "If you ship multiple apps a year, need API access for CI, or localize across stores, the $49/mo Extended tier earns its keep. For an indie shipping one app a year, you're paying a recurring bill for a one-off job — likely the wrong fit. The locale, 3D angles, and custom fonts you actually want sit behind the paid tiers, so the free tier is really a preview.",
      },
      {
        q: "Is Screenshots.pro free?",
        a: "There is a free tier, but the meaningful features (locale exports, 3D device angles, custom fonts, the larger template library) require Standard at $19/mo or Extended at $49/mo. Annual billing knocks 35% off. There is no one-time-pay option.",
      },
      {
        q: "What's a good alternative to Screenshots.pro?",
        a: "For one-time-pay indie use, ShotStudio ($7 floor, AI-picked preset, zero image persistence) and Previewed's $9.99 one-time Plus tier are the closest matches. AppMockUp Studio is free if you don't mind manual template editing. Rotato is the strongest pick if you also need 3D animation or App Preview videos.",
      },
      {
        q: "Does Screenshots.pro export at the App Store 1290×2796 spec?",
        a: "Yes — Screenshots.pro covers 23 devices including iPhone 6.7\" portrait (1290×2796), iPad M4, and Pixel 8 Pro, with auto-export to App Store Connect's required device specs. The output spec is correct; the question is whether subscription pricing fits your launch cadence.",
      },
    ],
  },
  {
    slug: "appmockup",
    name: "AppMockUp",
    positioning: "Two products: AppMockUp Studio (a free template editor with 400+ templates and 7M+ screenshots generated) and a separate AI variant at appmockupgenerator.com (Gemini-powered, one-time credit packs from $9 for 25 screenshots).",
    pricingModel: "Free Studio + one-time AI packs",
    pricingNote: "Studio: $0 (donations via Buy Me a Coffee). AI variant: 3 free credits, then packs from $9 for 25 screenshots — credits never expire.",
    primaryWeakness: "Studio is unbeatable on price but the workflow is still manual template editing — you pick the template, drag elements, write the copy. The newer AI variant adds AI to title and background, not the full layout, and the marketing inherits Gemini's gallery look, not your app's actual theme.",
    honestStrengths: [
      "Studio is genuinely free, forever — no tier, no watermark, no signup required to start.",
      "400+ templates and 7M+ screenshots generated — the biggest community footprint in the category.",
      "The AI variant (appmockupgenerator.com) directly competes with ShotStudio on pricing — $9 for 25 screenshots, credits never expire.",
      "Mesh-gradient and pattern generators give designer-grade flourishes most free tools skip.",
    ],
    featureGaps: [
      "Studio is manual template editing — you do all the design work, ShotStudio does it for you.",
      "AI variant covers AI titles and backgrounds, not the full AI-picked layout ShotStudio outputs.",
      "Theme doesn't sample from your uploaded screens — you pick from a gallery or accept Gemini's choice.",
      "Two confusingly-overlapping products (Studio vs Generator) under one brand.",
      "No auto-refund or retry on a bad output — you regenerate manually.",
    ],
    whenTheyAreRight: "If your budget is exactly $0 and you don't mind spending an evening in a template editor, AppMockUp Studio is the most respected free option. If you want AI title generation specifically at the cheapest price, the appmockupgenerator.com AI variant is the closest one-time competitor to ShotStudio.",
    faq: [
      {
        q: "Is AppMockUp worth it for indie iOS developers?",
        a: "AppMockUp Studio is free and unbeatable on price if you don't mind manual template editing. The newer AI variant at appmockupgenerator.com offers credit packs from $9 for 25 screenshots — closer to ShotStudio's model, but still title and background-focused, not full AI-picked layout. Right fit if you want hand control over the design.",
      },
      {
        q: "Is AppMockUp free?",
        a: "AppMockUp Studio (app-mockup.com) is 100% free with optional donations via Buy Me a Coffee. The separate AI tool at appmockupgenerator.com uses one-time credit packs starting around $9 for 25 screenshots after 3 free credits. Credits on the AI variant never expire.",
      },
      {
        q: "What's a good alternative to AppMockUp?",
        a: "For AI-generated screenshots without manual template work, ShotStudio ($7 one-time) takes you from upload to polished output in about a minute, with theme and palette auto-sampled from your actual app. For pixel-precise control, Rotato or Previewed offer more layout flexibility at higher cost.",
      },
      {
        q: "Can AppMockUp output 1290×2796 screenshots for App Store Connect?",
        a: "Yes — both AppMockUp Studio and the AI variant support iPhone 6.7\" portrait (1290×2796). Studio offers 400+ templates across iPhone, iPad, Apple Watch, and Mac; the AI variant covers iPhone and iPad 13\" output and adds +1 credit per iPad screenshot.",
      },
    ],
  },
  {
    slug: "previewed",
    name: "Previewed",
    positioning: "A browser-based 3D mockup tool that covers App Store shots, social media mockups, and promo videos in one app.",
    pricingModel: "Free + $9.99 one-time + $19/mo",
    pricingNote: "Lite free (720p, CC attribution) · Plus $9.99 one-time (10 exports, 3D + video) · Pro $228/yr.",
    primaryWeakness: "The closest competitor on pricing — but their $9.99 Plus tier caps at 10 exports and still hands you a mockup editor, not a generator. You're choosing templates, posing devices, and writing the copy yourself.",
    honestStrengths: [
      "$9.99 one-time Plus is the closest one-time-pay option in the category — already validated the no-subscription model for static screenshots.",
      "3D snapshots and promo-video output cover use cases ShotStudio doesn't touch.",
      "Exports stay in your account forever — even after a subscription lapses.",
    ],
    featureGaps: [
      "Plus tier caps at 10 lifetime exports — restrictive if you A/B-test screenshot variants.",
      "Free tier requires Creative Commons attribution — your published screenshots credit them, not you.",
      "Template editor, not a screenshot generator — manual layout per shot.",
      "No AI-written headline from your one-line pitch.",
      "Theme and palette don't sample from your uploaded screens.",
      "Cloud-stored templates and exports — privacy posture is the opposite of ours.",
    ],
    whenTheyAreRight: "If you want 3D animation or a promo video alongside your static screenshots, Previewed covers more surface area than ShotStudio in one tool. Plus also wins if you specifically want a one-time tier and can live within the 10-export limit.",
    faq: [
      {
        q: "Is Previewed worth it for indie iOS developers?",
        a: "The $9.99 Plus tier is the closest one-time-pay option in the category — a fair fit if you want 3D snapshots or promo video output alongside static screenshots. The 10-export cap on Plus matters if you A/B-test multiple sets. If you only need polished static shots, a $7 ShotStudio credit gets you unlimited regenerations per set.",
      },
      {
        q: "Is Previewed free?",
        a: "The Lite tier is free but exports at 720p with a Creative Commons attribution requirement — meaning your published screenshots credit Previewed, not your app. For commercial indie use you'll need Plus at $9.99 one-time (10 exports) or Pro at $19/mo ($228/yr unlimited).",
      },
      {
        q: "What's a good alternative to Previewed?",
        a: "For a true one-time-pay indie tool with no export cap, ShotStudio is $7 with unlimited regenerations per credit and zero image persistence. For 3D animation specifically, Rotato is the strongest in the category. AppMockUp Studio is the free option if you don't need animation or AI assistance.",
      },
      {
        q: "Does Previewed export at App Store Connect's required spec?",
        a: "Yes — Previewed supports iPhone 6.7\" portrait output at 1080p+ on Plus and Pro tiers. The free Lite tier caps at 720p, which falls below Apple's required resolution for App Store carousel screenshots and won't pass review.",
      },
    ],
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
      "100% offline desktop app — strongest privacy story among competitors that store anything locally.",
    ],
    featureGaps: [
      "Desktop app required — friction vs. a browser tool the night before submission.",
      "Designed for 3D animation and trailer reels — overkill for three static App Store shots.",
      "Steeper learning curve than indies want for a one-night job.",
      "No AI-generated layout, no AI-written headline.",
      "Entry tier starts well above ShotStudio's $7 floor.",
    ],
    whenTheyAreRight: "If you want an App Preview video with a rotating 3D device, or you're a designer who wants pixel-precise virtual camera control, Rotato is genuinely best in class.",
    faq: [
      {
        q: "Is Rotato worth it for indie iOS developers?",
        a: "Rotato is best-in-class for 3D mockups and App Preview videos — 200,000+ users including Adobe, Google, Amazon. For an indie who needs three static App Store shots before tomorrow's submission, it's overkill. Right fit if your job is animation, not just screenshots.",
      },
      {
        q: "Is Rotato free?",
        a: "No. Rotato is one-time pay across Basic, Standard, and Premium tiers (no subscription) with 6–12 months of free updates depending on tier. Pricing isn't displayed publicly on the homepage; legacy testimonials cite around $99 entry. Free trial may be available via the desktop download.",
      },
      {
        q: "What's a good alternative to Rotato?",
        a: "For static App Store screenshots specifically, ShotStudio ($7 one-time) is faster, cheaper, and runs in your browser without an install. For browser-based mockup composition, Previewed's $9.99 Plus tier covers similar ground without a desktop app. AppMockUp Studio is the free option for manual editing.",
      },
      {
        q: "Does Rotato output App Store screenshots at the right spec?",
        a: "Yes — Rotato includes App Store templates and exports at up to 8K resolution across 50+ formats including PNG, MP4, and ProRes4444. The iPhone 6.7\" 1290×2796 portrait spec is built into the template library, and the Figma plugin lets you push exports straight into a design pipeline.",
      },
    ],
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
      "Caption guidance derived from analysis of top App Store apps — closest thing to copy assistance in the category before AI tools.",
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
    faq: [
      {
        q: "Is Shotbot worth it for indie iOS developers?",
        a: "If you live in the Apple ecosystem and want Share Sheet, Shortcuts, and iCloud sync for screenshot framing as part of your daily workflow, Shotbot's native integration is unmatched. For a once-a-year App Store launch, a browser tool is less friction than a native app plus subscription.",
      },
      {
        q: "Is Shotbot free?",
        a: "Yes, there's a free tier — but with a daily frame limit. The Unlimited tier is a subscription via Apple in-app purchase; exact pricing varies by region. The daily cap on the free tier tends to hit exactly when you're trying to ship a screenshot set on submission day.",
      },
      {
        q: "What's a good alternative to Shotbot?",
        a: "For one-time-pay indie use without a native app install, ShotStudio is $7 with unlimited regenerations and zero image persistence. For free manual editing on the web, AppMockUp Studio works. For 3D mockups or App Preview videos, Rotato's desktop app is the strongest pick.",
      },
      {
        q: "Does Shotbot output the correct 1290×2796 spec?",
        a: "Yes — Shotbot frames screenshots at the iPhone 5.5\" master spec and auto-scales to every iPhone size including 6.7\" portrait (1290×2796) for App Store Connect. iPad output is supported; Android is in beta. The output spec is correct; the friction is the native-app-plus-subscription combination.",
      },
    ],
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
