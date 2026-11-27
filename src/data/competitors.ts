export type CompetitorFaq = { q: string; a: string };

export type Competitor = {
  slug: string;
  name: string;
  positioning: string;
  pricingModel: string;
  pricingNote: string;
  primaryWeakness: string;
  honestStrengths: string[];
  featureGaps: string[];
  whenTheyAreRight: string;
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
        a: "There is a free Basic plan ($0): all devices, all pre-made templates, all editor features and smart-export for all sizes. Standard at $19/mo adds 3D angles, template storage, custom fonts and localization; Extended at $49/mo adds API access and a license for charging end clients (pricing page, as of 2026-11-27). Annual billing saves 35%. There is no one-time-pay option.",
      },
      {
        q: "What's a good alternative to Screenshots.pro?",
        a: "For one-time-pay indie use, ShotStudio ($7 for two sets, preset matched to your category, zero image persistence) and Previewed's $9.99 one-time Plus tier are the closest matches. AppMockUp Studio is free if you don't mind manual template editing. Rotato is the strongest pick if you also need 3D animation or App Preview videos.",
      },
      {
        q: "Does Screenshots.pro export at the App Store 1290×2796 spec?",
        a: "Yes — Screenshots.pro covers 23 devices including iPhone 6.9\" portrait (1290×2796), iPad M4, and Pixel 8 Pro, with auto-export to App Store Connect's required device specs. The output spec is correct; the question is whether subscription pricing fits your launch cadence.",
      },
    ],
  },
  {
    slug: "appmockup",
    name: "AppMockUp",
    positioning: "Two products: AppMockUp Studio (a free template editor that says 10M+ screenshots have been exported from it) and a separate AI generator at appmockupgenerator.com, sold as monthly plans from $9/mo for 25 screenshots (as of 2026-11-25).",
    pricingModel: "Free Studio + monthly AI plans",
    pricingNote: "Studio: $0, no account required. AI generator: 3 free screenshots, then $9/mo for 25, $19/mo for 70 or $39/mo for 180; cancel anytime, unused credits roll over for up to 2 months (as of 2026-11-25, appmockupgenerator.com/pricing).",
    primaryWeakness: "Studio is unbeatable on price but the workflow is manual template editing: you pick the template, place the devices, write the copy. The AI generator does the layout for you, but it is a monthly plan, so a once-a-year launch means subscribing and remembering to cancel.",
    honestStrengths: [
      "Studio is free with no account required to start.",
      "Studio's homepage says 10M+ screenshots have been exported from it since launch.",
      "The AI generator outputs many sizes in one place: 1290×2796 and 1206×2622 iPhone, 13\" iPad, both iPhone Duo displays and Google Play (9:16), with iPad and Duo on the $19/mo plan and up.",
      "Studio has a pattern generator and panoramic backgrounds that adjust when you add or remove a screenshot.",
    ],
    featureGaps: [
      "Studio is manual template editing: you do the design work that ShotStudio does for you.",
      "The AI generator is a monthly subscription; ShotStudio is a one-time $7 pack with no renewal to cancel.",
      "The AI generator stores copies of your screenshots at reduced quality (7 days on the free and $9 plans, lifetime on higher plans); ShotStudio stores none.",
      "Used AI credits are not refunded (their pricing FAQ); ShotStudio returns the credit automatically when a generation fails.",
      "Two separate products (Studio and the AI generator) under one brand.",
    ],
    whenTheyAreRight: "If your budget is exactly $0 and you don't mind spending an evening in a template editor, AppMockUp Studio is the most respected free option. If you ship often and want AI screenshots for iPhone, iPad, iPhone Duo and Google Play from one tool, the AppMockUp AI generator's monthly plans cover more devices than ShotStudio.",
    faq: [
      {
        q: "Is AppMockUp worth it for indie iOS developers?",
        a: "AppMockUp Studio is free and unbeatable on price if you don't mind manual template editing. The AI generator at appmockupgenerator.com does the layout for you, from $9/mo for 25 screenshots (as of 2026-11-25). It fits if you ship screenshots every month; for a once-or-twice-a-year launch, a one-time pack costs less.",
      },
      {
        q: "Is AppMockUp free?",
        a: "AppMockUp Studio (app-mockup.com) is free with no account required. The separate AI generator at appmockupgenerator.com gives 3 free screenshots, then monthly plans: $9/mo for 25, $19/mo for 70, $39/mo for 180. You can cancel anytime and unused credits roll over for up to 2 months (pricing page, as of 2026-11-25).",
      },
      {
        q: "What's a good alternative to AppMockUp?",
        a: "For AI-generated screenshots without manual template work or a subscription, ShotStudio ($7 one-time) takes you from upload to polished output in about a minute, with the light or dark theme sampled from your actual app. For pixel-precise control, Rotato or Previewed offer more layout flexibility at higher cost.",
      },
      {
        q: "Can AppMockUp output 1290×2796 screenshots for App Store Connect?",
        a: "The AI generator lists 1290×2796 and 1206×2622 for iPhone, 2048×2732 for 13\" iPad, 2007×2853 and 1398×2034 for iPhone Duo, and 9:16 for Google Play (appmockupgenerator.com, as of 2026-11-25). iPad and iPhone Duo need the $19/mo plan or higher.",
      },
    ],
  },
  {
    slug: "previewed",
    name: "Previewed",
    positioning: "A browser-based 3D mockup tool that covers App Store shots, social media mockups, and promo videos in one app.",
    pricingModel: "Free + $9.99 one-time + $19/mo",
    pricingNote: "Lite free (720p, CC attribution) · Plus $9.99 one-time (10 exports, 3D + video) · Pro $19/mo billed $228/yr (as of 2026-11-25, previewed.app/pricing).",
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
        a: "The $9.99 Plus tier is the closest one-time-pay option in the category — a fair fit if you want 3D snapshots or promo video output alongside static screenshots. The 10-export cap on Plus matters if you A/B-test multiple sets. If you only need polished static shots, ShotStudio's $7 Starter pack buys two full sets of three, with no export cap on what you download.",
      },
      {
        q: "Is Previewed free?",
        a: "The Lite tier is free but exports at 720p with a Creative Commons attribution requirement — meaning your published screenshots credit Previewed, not your app. For commercial indie use you'll need Plus at $9.99 one-time (10 exports) or Pro at $19/mo ($228/yr unlimited), per its pricing page as of 2026-11-25.",
      },
      {
        q: "What's a good alternative to Previewed?",
        a: "For a one-time-pay indie tool with no export cap, ShotStudio is $7 for two sets of three shots, with zero image persistence. For 3D animation specifically, Rotato is the strongest in the category. AppMockUp Studio is the free option if you don't need animation or AI assistance.",
      },
      {
        q: "Does Previewed export at App Store Connect's required spec?",
        a: "Yes — Previewed supports iPhone 6.9\" portrait output at 1080p+ on Plus and Pro tiers. The free Lite tier caps at 720p, which falls below Apple's required resolution for App Store carousel screenshots and won't pass review.",
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
        a: "No. Rotato is one-time pay, not a subscription. Its pricing page lists Basic at $79 (6 months of free updates), Standard at $89 and Premium at $199 (12 months each), as of 2026-11-27.",
      },
      {
        q: "What's a good alternative to Rotato?",
        a: "For static App Store screenshots specifically, ShotStudio ($7 one-time) is faster, cheaper, and runs in your browser without an install. For browser-based mockup composition, Previewed's $9.99 Plus tier covers similar ground without a desktop app. AppMockUp Studio is the free option for manual editing.",
      },
      {
        q: "Does Rotato output App Store screenshots at the right spec?",
        a: "Yes — Rotato includes App Store templates and exports at up to 8K resolution across 50+ formats including PNG, MP4, and ProRes4444. The iPhone 6.9\" 1290×2796 portrait spec is built into the template library, and the Figma plugin lets you push exports straight into a design pipeline.",
      },
    ],
  },
  {
    slug: "shotbot",
    name: "Shotbot",
    positioning: "A native iOS, macOS, and visionOS app that frames screenshots with Share Sheet, Shortcuts, and iCloud sync.",
    pricingModel: "Free tier + subscription",
    pricingNote: "Free with a daily frame limit · paid plans are Apple in-app subscriptions; the US App Store lists an annual subscription at $4.99 (as of 2026-11-16).",
    primaryWeakness: "Lives inside the Apple ecosystem — beautiful Share Sheet integration, but the free tier hits a daily-frame cap at exactly the moment you're trying to ship, and the paid tier is another subscription.",
    honestStrengths: [
      "Native Share Sheet, Shortcuts, and widget integration on iOS, macOS, and visionOS — friction-free if you live in Apple's stack.",
      "Device frames for iPhone, iPad, Mac and Apple Watch, including both iPhone Duo screens, with a combined mode that stitches framed shots side by side.",
      "iCloud sync keeps preferences consistent across all your devices.",
    ],
    featureGaps: [
      "Free tier caps daily frames — exactly the wrong limit on submission night.",
      "Native app required — no browser fallback when you're on a borrowed machine.",
      "Device frames only: no headlines and no AI-generated layouts.",
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
        a: "Yes, there's a free tier — but with a daily frame limit. The Unlimited plan is a subscription via Apple in-app purchase; the US App Store lists an annual subscription at $4.99 as of 2026-11-16. The daily cap on the free tier tends to hit exactly when you're trying to ship a screenshot set on submission day.",
      },
      {
        q: "What's a good alternative to Shotbot?",
        a: "For one-time-pay indie use without a native app install, ShotStudio is $7 for two sets of three shots, with zero image persistence. For free manual editing on the web, AppMockUp Studio works. For 3D mockups or App Preview videos, Rotato's desktop app is the strongest pick.",
      },
      {
        q: "Does Shotbot output App Store screenshot sizes?",
        a: "Shotbot puts screenshots into device frames for iPhone, iPad, Mac and Apple Watch; its App Store listing (as of 2026-11-16) doesn't list App Store export sizes. Before you upload, check each PNG's pixel size against Apple's list, for example with the free size checker at shotstudio.dev/tools/app-store-screenshot-sizes. ShotStudio exports 1290×2796, one of Apple's accepted iPhone sizes.",
      },
    ],
  },
  {
    slug: "applaunchpad",
    name: "AppLaunchpad",
    positioning: "A browser-based App Store and Google Play screenshot template editor with 1,000+ templates on Pro, a free tier, and a monthly or annual Pro subscription (pricing checked 2026-11-06).",
    pricingModel: "Free tier + subscription",
    pricingNote: "Free ($0, 10 templates, limited exports) · Pro $15/mo billed monthly or $10/mo billed annually (as of 2026-11-06, theapplaunchpad.com/pricing).",
    primaryWeakness: "Unlimited exports and the full template library sit behind a Pro subscription, and you still pick the template, place the device and write every headline yourself.",
    honestStrengths: [
      "Covers both stores in one project: App Store and Google Play sizes, with automatic scaling to every required iPhone, iPad and Android size on Pro.",
      "Localization with an AI translator on Pro, which ShotStudio does not offer at all.",
      "A large template library (1,000+ on Pro) and a free tier you can try without paying.",
    ],
    featureGaps: [
      "Subscription for a job most indies do once or twice a year: $15 for a single month, or $120 a year on the annual plan.",
      "Template editor, not a generator: you choose the layout, drop in your screens and type the copy.",
      "No headline written from your pitch; its AI features are translation and resizing, not copywriting.",
      "The free tier caps exports and limits you to 10 templates.",
      "Projects live in your AppLaunchpad account; ShotStudio never stores your screenshots.",
    ],
    whenTheyAreRight: "If you ship to Google Play and iPad as well as iPhone, or you need the same carousel in several languages, AppLaunchpad's Pro plan covers ground ShotStudio deliberately doesn't.",
    faq: [
      {
        q: "Is AppLaunchpad worth it for indie iOS developers?",
        a: "If you ship on both the App Store and Google Play, need iPad sizes, or localize your listing, AppLaunchpad Pro does all three in one editor. For an iPhone-only indie shipping once or twice a year, Pro is a subscription for a one-night job, and you still lay out every screenshot and write every headline yourself.",
      },
      {
        q: "How much does AppLaunchpad cost?",
        a: "As of 2026-11-06, AppLaunchpad's pricing page lists a Free plan at $0 (10 templates, limited exports) and Pro at $15/mo billed monthly or $10/mo billed annually, which is $120 a year. Pro adds unlimited exports, 1,000+ templates, the AI translator and up to 100 projects. You can cancel any time; there is no one-time option.",
      },
      {
        q: "What's a good alternative to AppLaunchpad?",
        a: "For iPhone-only App Store shots without a subscription, ShotStudio is $7 one-time for two sets of three 1290×2796 shots, with the headline written from your pitch and nothing stored. AppMockUp Studio is the free option if you are happy to edit templates by hand. For 3D mockups or promo video, look at Previewed.",
      },
      {
        q: "Does AppLaunchpad export the right App Store sizes?",
        a: "Yes. AppLaunchpad says it covers all required App Store and Google Play sizes, including the latest iPhones and iPads, and Pro scales one design to every size automatically. ShotStudio outputs 1290×2796, one of Apple's accepted 6.9\" iPhone sizes, and nothing else: no iPad, no Android.",
      },
    ],
  },
  {
    slug: "appscreens",
    name: "AppScreens",
    positioning: "An online App Store and Google Play screenshot editor with AI captions, localization into 80+ languages and direct upload to App Store Connect, sold as a monthly or annual subscription (pricing checked 2026-11-09).",
    pricingModel: "Free tier + subscription",
    pricingNote: "Free ($0, 1 saved project, up to 5 screens) · Pro $25/mo billed monthly or $99/yr billed annually · Scale $50/mo or $180/yr (as of 2026-11-09, appscreens.com/pricing).",
    primaryWeakness: "There is no one-time plan: AppScreens' own FAQ says to subscribe for a month and cancel the renewal if you only need one release, and you still build the layout yourself.",
    honestStrengths: [
      "Localization into 80+ languages and one-click upload to App Store Connect and Google Play on Pro, which ShotStudio does not offer at all.",
      "Covers both stores and many devices from one design: iPhone, iPad, Apple Watch, Mac and Android sizes on Pro.",
      "AI caption suggestions even on the free plan, plus AI restyling and 3D device frames on Pro.",
    ],
    featureGaps: [
      "Subscription for a job most indies do once or twice a year: $25 for a single month, or $99 a year on the annual plan.",
      "An editor, not a generator: you pick the template, place each screen and arrange the layers yourself.",
      "The free plan keeps 1 saved project with up to 5 screens and watermarks the Pro features you preview; its pricing page marks the large Dynamic Island iPhone size as subscription-only.",
      "Projects are saved in your AppScreens account; ShotStudio never stores your screenshots.",
    ],
    whenTheyAreRight: "If you localize your listing, ship to Google Play or iPad as well as iPhone, or update screenshots every month and want them uploaded to App Store Connect for you, AppScreens Pro covers ground ShotStudio deliberately doesn't.",
    faq: [
      {
        q: "Is AppScreens worth it for indie iOS developers?",
        a: "If you localize, ship on both stores, or update your listing often, AppScreens Pro does all of it in one editor and uploads to App Store Connect for you. For an iPhone-only indie shipping once or twice a year, Pro is a subscription for a one-night job, and you still lay out every screenshot yourself.",
      },
      {
        q: "How much does AppScreens cost?",
        a: "As of 2026-11-09, AppScreens' pricing page lists a Free plan at $0 (1 saved project, up to 5 screens), Pro at $25/mo billed monthly or $99 a year billed annually, and Scale at $50/mo or $180 a year. There is no one-time plan: its FAQ suggests subscribing for a month and cancelling the renewal.",
      },
      {
        q: "What's a good alternative to AppScreens?",
        a: "For iPhone-only App Store shots without a subscription, ShotStudio is $7 one-time for two sets of three 1290×2796 shots, with the headline written from your pitch and nothing stored. AppMockUp Studio is the free option if you are happy to edit templates by hand. AppLaunchpad is a cheaper subscription editor for both stores.",
      },
      {
        q: "Does AppScreens write the screenshot captions for you?",
        a: "Partly. AppScreens offers AI caption suggestions on the free plan and a fuller AI caption toolkit on Pro, but you place them into a layout you build. ShotStudio writes the headline from your pitch and renders it into each finished shot, so there is no layout step and no caption to edit afterwards.",
      },
    ],
  },
];

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
