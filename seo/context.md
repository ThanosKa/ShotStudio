# ShotStudio: product context for SEO

Built 2026-10-31 from the code and the live site. Every fact names its source. If a page disagrees with this file, check the source, fix whichever is stale, and remember that the product (the code) is always right.

## What it is

ShotStudio (https://shotstudio.dev) is a web app that turns 3 raw mobile app screenshots into 3 finished App Store marketing screenshots. You upload three screens, type the app name, a one-line pitch, an optional audience and a category, and pick one of four style presets. An image model renders each screen inside an iPhone 16 Pro mockup, writes a 2 to 7 word tagline above it, and returns three 1290×2796 PNGs, which download as one ZIP.

- Input: exactly 3 screenshots, PNG or JPEG. The UI says "max 10 MB each" (`src/components/wizard.tsx:481`). They are compressed in the browser to a longest edge of 1536 px (`src/lib/image/compress.ts`), and the server rejects anything over 5 MB after that (`src/lib/generation/lifecycle.ts`, `MAX_SCREENSHOT_BYTES`).
- Required fields: app name, pitch (with min and max length), category, preset. Audience is optional (`src/components/wizard.tsx`, `src/lib/validation/pitch.ts`).
- Output: 3 PNGs, one per uploaded screen, each in a fixed role: hero_feature (the hook), differentiator (the journey), another_feature (the closer) (`src/lib/generation/lifecycle.ts` `ROLES`, `src/lib/generation/prompts.ts` `ROLE_INTENT`).
- Size: 1290×2796 portrait. The model renders at "1K" and sharp resizes with `fit: cover` (`src/lib/generation/upscale.ts`). Apple's current spec lists 1290×2796 as one of three accepted sizes for the **6.9"** iPhone display, together with 1260×2736 and 1320×2868 (`src/lib/screenshot-sizes/spec.ts`, transcribed from developer.apple.com on 2026-10-01). Many site pages still call it the "6.7\" spec": see backlog.
- Model: `openai/gpt-image-2.5-sunburst` via the OpenRouter images endpoint (`src/lib/openrouter.ts:7`).
- Device frame: iPhone 16 Pro mockup, portrait, no watermark, no fake App Store badges (`src/lib/generation/prompts.ts`).
- Headline: written **and rendered into the image** by the image model from the pitch, the shot role and the preset's voice. There is no separate text step (`src/lib/generation/prompts.ts`; commit 0cea550 removed the headline pre-pass).
- **No in-product editing.** The result screen shows the 3 images, a "Download all (.zip)" button and "Create another set" (`src/components/result-panel.tsx`). There is no click-to-edit text and no per-shot re-roll. A new set costs a new credit. (Several pages claimed both until 2026-10-31; fixed in this run.)
- Style presets: Friendly, Professional, Minimal, Bold. They control typography and headline voice only (`src/lib/generation/presets.ts`). A default preset is pre-selected from the category by a lookup table, `CATEGORY_DEFAULT_PRESET`, and the user can change it. It is a lookup, not an AI choice.
- Theme and palette come from the uploaded screenshot attached as a reference image: a light app stays light, a dark app stays dark (`src/lib/generation/prompts.ts`).
- Retries: each shot is tried twice. If any of the 3 shots still fails, the whole set is marked failed and the 1 credit is refunded automatically (`src/lib/generation/lifecycle.ts` `runShot` and `runGeneration`).
- Speed: the site claims "under a minute" / "about a minute". **Not verified** from the code: the route allows up to 300 s (`maxDuration`). Ask the owner for real timings.
- Privacy: there is no images table and no S3. Images are returned to the browser only, as data URLs (`src/lib/db/schema.ts`, `src/lib/generation/lifecycle.ts`). The generations table stores app name, preset, category and status only.
- Auth: Clerk sign-up is required to generate (`src/app/sign-up`). No free trial and no free generation.

## Prices (`src/lib/packages.ts`, live at https://shotstudio.dev/pricing, checked 2026-10-31)

| Pack | Price (USD, one-time) | Credits = sets | Images |
|---|---|---|---|
| Starter | $7 | 2 | 6 |
| Growth (featured) | $17 | 5 | 15 |
| Studio | $37 | 12 | 36 |

1 credit = 1 set = 3 images. Credits never expire. There is no subscription. Tax is handled by Stripe Tax. Coupons can be applied at Stripe Checkout. There are no cash refunds, and the credit is refunded automatically on a failed generation (`public/pricing.md`, `src/app/(marketing)/terms`).

## Buyer

An indie iOS developer, a solo founder or a small studio who ships an app or an update once or twice a year, has no designer, and needs App Store screenshots tonight. They are price-sensitive and subscription-averse. Source: the positioning across `src/app/(marketing)/page.tsx`, `public/llms.txt` and `competitor-profiles/_summary.md`.

Conversion = a paid credit pack (Stripe checkout from `/pricing` or `/home`). A sign-up is the step before that.

## Limits and out of scope (AGENTS.md, v1)

iPhone portrait only: no iPad, Google Play or Android output, no landscape. No localization or i18n. No subscriptions, no team accounts, no API, no saved history. Pages must not claim any of these.

## Site and SEO plumbing

- Next.js 16 App Router. Marketing routes live in `src/app/(marketing)/`.
- Blog: MDX in `src/content/blog/*.mdx` with `title`, `description`, `publishedAt`, `updatedAt` and `heroImage` frontmatter, read by `src/lib/blog.ts`. The route is `src/app/(marketing)/blog/[slug]/page.tsx`.
- Programmatic pages: `/screenshots-for/[category]` built from `src/data/categories.ts` + `src/data/category-editorial.ts`, and `/alternatives/[competitor]` built from `src/data/competitors.ts` + `src/data/competitor-editorial.ts`.
- Titles and descriptions: `src/lib/marketing/meta.ts`. The root template appends " — ShotStudio" (title budget 60 chars including the suffix, description budget 155).
- Structured data: `src/lib/marketing/schema.ts` (Organization, WebSite, SoftwareApplication, FAQPage, Breadcrumbs), rendered via `src/components/marketing/json-ld.tsx`.
- Sitemap: `src/app/sitemap.ts` uses hand-maintained revision dates. **Never use `new Date()`.** Bump only the surface you changed.
- Robots: `src/app/robots.ts`. Only `/api/` is blocked. `/home`, `/sign-in` and `/sign-up` use meta noindex instead.
- Pruning: `src/lib/marketing/pruned-list.ts` drives noindex headers, sitemap exclusion and internal-link filtering. See `PRUNED.md`.
- Agent-facing fact files: `public/llms.txt`, `public/llms-full.txt` and `public/pricing.md`, guarded by `src/lib/marketing/llms.test.ts`.
- Free tool: `/tools/app-store-screenshot-sizes` (`src/lib/screenshot-sizes/`).
- IndexNow: `scripts/indexnow.mjs` (Bing, Yandex and others. Not Google).

## Competitors (confirmed 2026-10-31)

Existing pages: AppMockUp, Previewed and Shotbot are indexable. Rotato and Screenshots.pro are noindexed (`PRUNED.md`). Profiles are in `competitor-profiles/` (from 2026-05-13 and now dated: the summary says no competitor uses AI generation, which is no longer true).

Who shows up now for the queries we want (WebSearch, 2026-10-31):
- **AppLaunchpad** (theapplaunchpad.com): template editor with a free tier. Paid pricing is unclear (its own blog says $19/mo and also $29/mo; aggregators say $15/mo yearly). GSC: "applaunchpad alternative" got 44 impressions in 90 days and we have no page for it.
- **AppScreens** (appscreens.com): subscription, plus a one-time "Launch Pack" (30 days).
- **LaunchMatic**: "launchmatic alternative" got 2 impressions.
- AI-first newcomers: FrameKit, Screenies, Store AI, ASO Shots, LaunchShots, MakeShot (one-time credit packs from $5.99), and AppMockUp's AI generator (appmockupgenerator.com, packs from $9 for 25).
- Open source: AppScreen, ShotLuma, ParthJadhav/app-store-screenshots (an agent skill).

Sources: https://www.rapidnative.com/blogs/best-app-store-screenshot-generators, https://theapplaunchpad.com/blog/top-7-app-store-screenshot-generators, https://peerpush.com/p/makeshot, https://www.producthunt.com/products/launch-shots
