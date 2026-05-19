# ShotStudio SEO Launch Baseline & Recovery Plan

*Generated 2026-05-19 (PH launch day). Site age: 7 days. GSC data: 0 clicks, 63 impressions, 13 of 27 known pages indexed.*

**Reframe applied.** The audit brief was built for a site hit by the March/May 2026 Core Update. ShotStudio launched 2026-05-12 — there is no traffic to recover. This document is therefore a **launch baseline + 90-day plan**, structured as the original brief requested (A–G), but with diagnoses and prescriptions rewritten for a brand-new domain shipping into a post-Core-Update SERP.

---

## A. Damage report (reframed)

**There is no damage.** The "before period" (Jan 8 – Feb 24) in every CSV is zeros because shotstudio.dev did not exist. The "after period" (Jan 4 – May 18, effectively May 12–18) is the entire dataset.

| Metric | Value |
|---|---|
| Total clicks, 7-day window | **0** |
| Total impressions, 7-day window | **63** (55 desktop / 8 mobile) |
| Top country | United States (30 impressions) |
| Top page (impressions) | `/` — 16 impressions, position 10.5 |
| Top non-home page | `/screenshots-for/fitness-apps` — 12 impressions, position 8.75 |
| Top query | "shot studio" — 7 brand-name impressions, position 6.14 |
| Indexed | 13 |
| Discovered – currently not indexed | **12** |
| Blocked by robots.txt | 1 (`/home`, intended) |
| Alternate page with proper canonical | 1 (expected) |
| **Indexed though blocked by robots** | **1** (real bug — see C.1) |

**The leaked-string question is closed.** `"""rate-limit tuesday close handoff on sample-app screenshots and readout pointer"""` appears nowhere in the codebase, the rendered HTML, robots.txt, sitemap.xml, or the OG image filename. 1 impression / 0 clicks / position 9 over 7 days reads as a single probing query (security scan or attribution anomaly), not a content leak. No action required.

---

## B. Diagnosis

There is no per-page bleed to diagnose. Instead, here is the **per-page launch readiness** verdict for every URL in the sitemap, based on the live crawl and codebase inspection.

| URL pattern | On-page basics | Schema | AIO citation readiness | Verdict |
|---|---|---|---|---|
| `/` | ✅ title, meta, canonical, OG image, H1 | ✅ Organization + WebSite + SoftwareApplication + FAQPage | Medium | **Ready** |
| `/pricing` | ⚠️ no `og:image`, **no H1** | ✅ Product + FAQPage + Breadcrumb | N/A (transactional) | **Fix H1 + OG** |
| `/screenshots-for` | ⚠️ no `og:image`, **no H1** | ✅ Breadcrumb + ItemList | Medium-strong | **Fix H1 + OG** |
| `/screenshots-for/[category]` | ⚠️ no `og:image`, **no H1**, only 3 of 9 siblings linked | ✅ Org + SoftwareApp + Breadcrumb + FAQPage | Medium-strong | **Fix H1 + OG + sibling cap** |
| `/alternatives` | ⚠️ no `og:image`, **no H1** | ✅ Breadcrumb + ItemList | Medium | **Fix H1 + OG** |
| `/alternatives/[competitor]` | ⚠️ no `og:image`, **no H1**, sparse siblings, no FAQ in body or schema | ⚠️ Org + SoftwareApp + Breadcrumb, **no FAQPage** | **Weak** | **Major fix: FAQ + H1 + OG** |
| `/blog` | ⚠️ no `og:image`, **no H1**, og:title mismatches `<title>` | ⚠️ Breadcrumb only — no Blog or ItemList | N/A | **Fix H1 + OG + add Blog schema** |
| `/blog/[slug]` | ✅ title, meta, canonical, per-post OG, **no H1** | ✅ Org + Breadcrumb + BlogPosting + HowTo (one post only) | Strong (sizes post) / Medium (best-generators post) | **Fix H1 + extend HowTo opt-in** |
| `/sign-in/*`, `/sign-up/*` | n/a | n/a | n/a | **Bug — letting Google crawl + see noindex (see C.1)** |

### Diagnosis themes (vs the algorithm reality the user supplied)

| Algorithm-context signal | How it applies to ShotStudio | Action |
|---|---|---|
| Core Update penalizing AI-summary content | ShotStudio's blog posts are original, opinionated, indie-voice — explicitly distancing themselves from "SEO bait written by content farms" (best-generators post line 8). **Already on the right side of this signal.** | None — keep the voice. |
| AI Overview on 48% of queries; -58% CTR when present | The competitor-research SERP snapshot shows: **3 of 8 target queries are high-AIO** ("how to make app store screenshots", "screenshot size 2026", "screenshots without figma"). The other 5 are commercial/comparative — lower AIO risk. | Focus AIO-citation effort on the **informational blog posts** (where AIO triggers) and accept that `/alternatives/*` and `/pricing` are in lower-AIO terrain. |
| ~60% of AI citations come from URLs NOT ranking top-20 | This is **the opening** for a 7-day-old site. ShotStudio doesn't need to rank top-3 to be cited — needs to be the most-citation-friendly format on the topic. | Q&A structure (FAQPage), definitional leads, tables, HowTo schema, specificity (1290×2796 not "the right size"). All emphasized below. |
| LCP threshold tightened to 2.0s | Site is Next.js static-prerendered with Sharp + edge fonts + minimal JS. Almost certainly under 2.0s. | Verify with PageSpeed Insights post-launch; not a current concern. |
| Worst-hit cohorts: affiliate, aggregator, AI-mass-content, broad-topic | ShotStudio is none of these — single-product, niche, opinionated, original. | None. |
| Winners: original data/research, niche depth, regularly-updated | ShotStudio has zero original data right now. Biggest single 3–6 month bet is publishing a real proprietary dataset (see E.1). | See E.1. |

---

## C. This week — quick wins (≤12h total, mostly ≤1h each)

These are the items that move the needle in the next 7–14 days. Owner column assumes solo founder.

### C.1 Stop letting auth pages live in Google's index half-broken

**File:** `src/app/robots.ts:4`

The current `PRIVATE_PATHS = ["/api/", "/home", "/sign-in", "/sign-up"]` blocks all four in robots.txt. The "Indexed though blocked by robots.txt" GSC issue is one of `/sign-in` or `/sign-up` — Google indexed the URL before the robots block went up, and now it can't crawl to see a `noindex`, so the URL sits indexed indefinitely with empty metadata.

```ts
// src/app/robots.ts — keep /home blocked (authenticated app), unblock auth routes
const PRIVATE_PATHS = ["/api/", "/home"];
```

Then add explicit noindex on the auth pages:

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx (and sign-up equivalent)
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```

After deploy: GSC → URL Inspection → "Validate Fix" on the offending URL.

**Owner:** founder. **Effort:** 20 min. **Expected outcome:** clean de-index within 2–4 weeks.

### C.2 Fix the missing H1s on 8 of 9 pages

**File:** `src/components/marketing/section.tsx:38`

The `Section` component hard-codes `<h2>` for every title. Every page that uses `<Section>` for its lead heading (pricing, alternatives hub, alternatives spokes, screenshots-for hub, all category spokes, /blog index) renders an H2 as the visible page headline — and has no H1 in the DOM at all.

```tsx
// src/components/marketing/section.tsx
interface SectionProps {
  // ...existing props
  as?: "h1" | "h2";
}

export function Section({ as = "h2", title, /* ... */ }: SectionProps) {
  const Heading = as;
  return (
    <section /* ... */>
      <div className="max-w-2xl">
        {eyebrow && <p /* ... */>{eyebrow}</p>}
        <Heading className="text-heading font-semibold md:text-heading-lg">{title}</Heading>
        {/* ... */}
      </div>
    </section>
  );
}
```

Then in each page template, pass `as="h1"` to the lead Section:

- `src/app/(marketing)/pricing/page.tsx` — first `<Section>` ("Three packs. Buy what you need.")
- `src/app/(marketing)/screenshots-for/page.tsx` — first `<Section>` ("App Store screenshots by app category")
- `src/app/(marketing)/screenshots-for/[category]/page.tsx` — first `<Section>` (`App Store screenshots for ${data.name.toLowerCase()}`)
- `src/app/(marketing)/alternatives/page.tsx` — first `<Section>` ("App Store screenshot tool alternatives")
- `src/app/(marketing)/alternatives/[competitor]/page.tsx` — first `<Section>` (`${data.name} alternatives — what indies actually pick`)
- `src/app/(marketing)/blog/page.tsx` — first `<Section>` ("Notes on App Store screenshots…")

The blog post template (`src/app/(marketing)/blog/[slug]/page.tsx:157`) already uses a plain `<h1>` — leave it.

**Owner:** founder. **Effort:** 30 min. **Expected outcome:** primary on-page ranking signal restored across 23 of 24 indexable URLs. Single biggest pre-traffic SEO fix in this audit.

### C.3 Per-page OG images — fix the social-share blackhole

The page-level `openGraph` blocks in each page template **redefine** OG metadata, which overrides the layout default rather than inheriting from it. Result: only `/` has an OG image. Every other URL shares with no preview.

Two options:

**Option A (no work, just stop overriding):** delete the page-level `openGraph.images` references and let `layout.tsx` provide `/og-default.png` as fallback. Quick but every share looks identical.

**Option B (better, programmatic):** add `next/og` dynamic OG image generation for category and competitor pages.

```tsx
// src/app/(marketing)/screenshots-for/[category]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getCategoryBySlug } from "@/data/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { category: string } }) {
  const data = getCategoryBySlug(params.category);
  if (!data) return new ImageResponse(<div>ShotStudio</div>, size);
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", background: "#0a0a0a", color: "#fff", height: "100%", padding: 80, fontFamily: "Inter" }}>
        <div style={{ fontSize: 24, opacity: 0.6 }}>App Store screenshots for</div>
        <div style={{ fontSize: 72, fontWeight: 600, marginTop: 16 }}>{data.name}</div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: 22, opacity: 0.7 }}>
          <span>shotstudio.dev</span>
          <span>$7 · 1290×2796 · in a minute</span>
        </div>
      </div>
    ),
    size,
  );
}
```

Same pattern for `/alternatives/[competitor]/opengraph-image.tsx` (use `data.name` + "alternatives"). For static pages, point page-level `openGraph.images` back at `/og-default.png` explicitly.

**Owner:** founder. **Effort:** 90 min for the dynamic OG (covers 15 pages programmatically). **Expected outcome:** every link shared on X / HN / Reddit / iOS Dev Weekly during PH week renders with a proper preview. Without this, launch-week shares look broken.

### C.4 Add FAQPage schema + body FAQ to `/alternatives/[competitor]`

These are the highest commercial-intent programmatic pages and they're currently missing the format Google rewards on `[X] alternatives` queries.

**Step 1** — extend the Competitor type:

```ts
// src/data/competitors.ts
export type CompetitorFaq = { q: string; a: string };

export type Competitor = {
  // ...existing fields
  faq: [CompetitorFaq, CompetitorFaq, CompetitorFaq, CompetitorFaq];
};
```

**Step 2** — write 4 FAQs per competitor. The four AlternativeTo-style questions Google clearly rewards on these SERPs:

1. "Is [Competitor] worth it for indie iOS developers?"
2. "What's the best [Competitor] alternative?"
3. "Is [Competitor] free?" (or "Does [Competitor] have a free tier?")
4. "Why are people switching from [Competitor] to ShotStudio?" (use sparingly — only if it's true)

Each answer 60–120 words, specific, including a price number or feature name.

**Step 3** — render the FAQ section in `/alternatives/[competitor]/page.tsx` + add `FAQPage` JSON-LD alongside the existing Org/SoftwareApp/Breadcrumb graph.

**Owner:** founder. **Effort:** 2h (20m schema/component change + 90m writing 20 FAQs). **Expected outcome:** these pages become AIO-eligible for `[competitor] alternatives` queries (currently low-AIO, but trending up); plus rich result eligibility in classic SERPs.

### C.5 Top nav exposes /screenshots-for, /alternatives, /blog

**File:** `src/components/marketing/marketing-nav.tsx`

Currently the nav has: Examples, How it works, Pricing. The three programmatic-SEO surfaces (`/screenshots-for`, `/alternatives`, `/blog`) are footer-only. Top-nav links carry more weight to Google than footer links, and these are the strategic SEO surfaces.

Add as either a flat "Resources" dropdown or as inline items, e.g.:

```tsx
<nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
  <Link href="/screenshots-for" className="hover:text-foreground">By app type</Link>
  <Link href="/alternatives" className="hover:text-foreground">Alternatives</Link>
  <Link href="/blog" className="hover:text-foreground">Blog</Link>
  <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
</nav>
```

**Owner:** founder. **Effort:** 20 min. **Expected outcome:** stronger crawl signal for the three programmatic surfaces; also a UX win — alternatives is commercial intent, don't bury it.

### C.6 Raise sibling-link cap on category + competitor spokes

**Files:**
- `src/app/(marketing)/screenshots-for/[category]/page.tsx:56` — `.slice(0, 3)` limits sibling links to 3 of 9
- `src/app/(marketing)/alternatives/[competitor]/page.tsx:51` — `.slice(0, 3)` limits sibling competitor links to 3 of 4 (the missing one on /alternatives/screenshots-pro is shotbot, confirmed by crawl)

Change to `.slice(0, 6)` for categories (or remove the slice entirely and add a 2-column grid for visual density). Remove the slice on competitor pages (only 5 total, all should link).

**Owner:** founder. **Effort:** 15 min + design tweak if needed. **Expected outcome:** stronger internal-linking topology — the hub-and-spoke is currently leaking link equity by under-linking.

### C.7 Submit sitemap to Bing Webmaster + IndexNow

GSC is already verified. Adding Bing matters less for traffic (much smaller in this niche) but materially for AI Overview — Copilot/Perplexity weight Bing's index. IndexNow (Bing + Yandex) pings the moment new URLs deploy.

```ts
// optional helper: src/lib/seo/indexnow.ts — call after deploys
export async function pingIndexNow(urls: string[]) {
  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: "shotstudio.dev",
      key: process.env.INDEXNOW_KEY,
      urlList: urls,
    }),
  });
}
```

**Owner:** founder. **Effort:** 45 min (verify Bing, generate IndexNow key, drop a `/{key}.txt` file at site root). **Expected outcome:** faster crawl across Bing/Yandex; better AIO citation surface in non-Google AI search.

### C.8 Rich Results Test on every URL pattern

Before scaling content, confirm the schema you already emit actually validates. Test one URL per template (8 total):

- `/`
- `/pricing`
- `/screenshots-for`
- `/screenshots-for/fitness-apps`
- `/alternatives`
- `/alternatives/screenshots-pro`
- `/blog`
- `/blog/app-store-screenshot-sizes-2026`

Use [Google Rich Results Test](https://search.google.com/test/rich-results). Fix any errors; warnings are usually fine.

**Owner:** founder. **Effort:** 30 min. **Expected outcome:** none broken, but if one is, you catch it before scaling to 30 categories with the same bug.

---

## D. 2–3 months — content & comparison build-out

### D.1 Ship the remaining 20 categories

**Files:** `src/data/categories.ts` (expand from 10 to 30 — list in `.agents/programmatic-seo.md:39-49`).

Each category needs: `lead` (~120 words), `whatConverts` (3 items), `whatHurts` (3 items), `pitchExample` (1 line), `faq` (3 Q/A). The existing 10 are the template — hand-write the rest, batch over 1–2 weekends.

**Why 20 more matters now**: the SERP research confirms `theapplaunchpad.com` ranks for 5 of 8 target queries on the back of a single content-marketing blog. Niche depth (30 category pages, each with FAQPage + Breadcrumb + Do/Don't lists) is what's defensible against that. 10 pages doesn't beat their domain authority; 30 with original POV per page does.

**Owner:** founder. **Effort:** 6–10h (15–25m per category). **Expected outcome:** indexable surface area triples; long-tail capture potential grows ~3×; consolidation against AppLaunchpad becomes credible.

### D.2 Ship the `/vs/[a]-vs-[b]` route

**Files:** new `src/app/(marketing)/vs/[slug]/page.tsx` per `.agents/programmatic-seo.md:122-145`.

Dataset reuses `competitors.ts`. Each page diffs two rows. Start with 5 ShotStudio-vs-X pages (one per competitor in `competitors.ts`), then 2 competitor-vs-competitor pages (e.g., `appmockup-vs-previewed`) to capture evaluator queries that don't yet know ShotStudio.

Schema: `Article` + `Breadcrumb` + `FAQPage` (3 Qs per page: "Which is better?", "Is X cheaper than Y?", "Should I switch from X to Y?").

**Owner:** founder. **Effort:** 4–6h (template + 7 datasets). **Expected outcome:** capture mid-funnel evaluator traffic that's already aware of the category. These pages convert higher than category pages because intent is more advanced.

### D.3 Update `/alternatives/appmockup` to address the AI variant

**File:** `src/data/competitors.ts` (the `appmockup` entry).

The competitor research found that **AppMockUp now has an AI variant at appmockupgenerator.com** — credit packs from $9 for 25 screenshots, Gemini-powered title + background + frame generation. This directly contests ShotStudio's "we're the AI one" positioning. The current ShotStudio page describes AppMockUp as a free manual template editor — which is no longer the whole story.

Specific edits to `appmockup.featureGaps`:

- Acknowledge the AI variant exists
- Differentiate on: (a) ShotStudio's theme-from-uploads (AppMockUp uses Gemini for backgrounds, ours samples from your actual app), (b) per-shot regenerate, (c) zero-persistence privacy, (d) AI-written headlines from your *pitch* not just title swaps

Add to `appmockup.honestStrengths`:

- "Their AI variant (appmockupgenerator.com) has credit packs at $9/25 screenshots — directly competitive on price."

**Owner:** founder. **Effort:** 30 min. **Expected outcome:** the page reads as honest and current rather than outdated/strawmanning, which is what Google rewards on `[X] alternatives` queries.

### D.4 Add `getpicasso.com` as the 6th competitor

The SERP research surfaced `getpicasso.com` ranking for "best app store screenshot tool" — not in `competitors.ts`. Build a Competitor entry, add `/alternatives/picasso` and `/vs/shotstudio-vs-picasso`.

**Owner:** founder. **Effort:** 1h (research + entry + ship). **Expected outcome:** capture `picasso alternatives` SERP terrain that's currently uncovered.

### D.5 Publish blog priorities 3–8

From `.agents/content-strategy.md:53-67`. In order:

3. Best App Store screenshot generators 2026 — **already shipped** ✅
4. What makes an App Store screenshot convert
5. App Store Connect screenshot upload errors
6. A/B testing App Store screenshots
7. Subscription vs one-time-pay screenshot tools
8. Indie iOS app submission checklist (this one is also a lead magnet — see F.1)

Each post: 1,200–2,000 words, internal links to category + competitor pages, frontmatter-declared schema type (HowTo / ItemList / Article).

**Owner:** founder. **Effort:** 2–3h per post × 5 = 10–15h. **Expected outcome:** 5× the indexable informational surface; topical depth signal to Google + AIO models.

### D.6 Switch HowTo schema to MDX-frontmatter driven

**File:** `src/app/(marketing)/blog/[slug]/page.tsx:69`.

Currently `isHowToCandidate = post.slug === "app-store-screenshot-sizes-2026"` — hardcoded. Switch to MDX frontmatter:

```yaml
---
title: "..."
structuredData:
  type: HowTo
  totalTime: PT5M
  steps:
    - name: "Resize to 1290×2796 portrait"
      text: "..."
---
```

Then the page reads the frontmatter and emits the appropriate `@type`. Lets every post opt in to HowTo, ItemList, or DefinedTerm without code changes.

**Owner:** founder. **Effort:** 1h. **Expected outcome:** every spec/listicle/glossary blog post becomes AIO-citable without per-post engineering work.

---

## E. 3–6 months — defensible moat

### E.1 Publish original data: "What converts on the App Store" (anonymized)

**The single biggest 3–6 month bet.**

The algorithm context the user provided lists "original data/research" as one of the few signal types Google explicitly *upweighted* in the March 2026 Core Update (+22%). ShotStudio has a natural source of original data: **every generation it produces is an experiment in what a polished screenshot looks like for a given pitch, category, and preset.** Opt-in usage telemetry (no images stored, just: category, preset, headline length, color palette inferred, did the user export vs regenerate) can become a quarterly **App Store Screenshot Conversion Report**.

Format: ~15-page PDF + a `/data/2026-q3-screenshot-conversion-report` web page with the same content. Cite back to the methodology. Update quarterly.

Why this works:
- AIO models love numeric, source-able claims ("The average ShotStudio user regenerates 1.4 times before exporting; 78% pick the AI-suggested preset")
- Original data is the only thing aggregator/affiliate sites can't republish without crediting back — every citation is a backlink
- Pairs naturally with the brand voice ("senior indie talking to a peer")
- Builds a recurring news hook for X/HN/Reddit/iOS Dev Weekly

**Owner:** founder. **Effort:** initial setup 8–12h (telemetry schema, opt-in toggle, aggregation cron); per-quarterly report 6–10h. **Expected outcome:** unique data moat; ~10–30 organic backlinks per quarterly report from indie-iOS publications; high-value AIO citation surface.

**Caveat:** This requires explicit user opt-in (privacy posture is the brand) and aggregation that emits no per-user data. Build the opt-in UI with the same dry confidence the rest of the site uses ("Anonymous: category + preset + 'did you export'. Off by default.").

### E.2 Build the launch-week showcase into permanent E-E-A-T

The launch plan (`.agents/launch-plan.md`) projects 20–80 paid conversions in the first 30 days. From those:

1. Ask 5 customers for permission to publicly display their app logo + a 1-line quote on the homepage.
2. Ask 1–2 for a "case study" link to a `/showcase/[app-name]` page — before/after of their screenshot set with a 2-sentence "here's what the indie said" caption.

Both build E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness — the human-signal layer Google's content quality team weighs heavily post–March 2026). They also unlock LinkedIn/X organic that wouldn't otherwise convert.

**Owner:** founder. **Effort:** 2h per customer outreach; 2h per /showcase page. **Expected outcome:** five logo proofs by Aug 2026; 1–2 case studies in indie-iOS-credible voice.

### E.3 Topic restructure: prepare for an "ASO for indies" pillar expansion

Right now ShotStudio is positioned narrowly as a screenshot tool. The content-strategy doc explicitly de-scopes "ASO copy, app icon design" as "too broad, revisit later." Once 30 categories + 12 blog posts + /vs are live, revisit this. The natural extension is:

- `/aso/` — ASO playbook hub (positioning to capture indies before they think they need screenshots)
- `/aso/app-store-keywords` — keyword spec
- `/aso/app-icon-conversion` — icon-as-conversion
- `/aso/app-name-strategy` — naming

This expands topical authority without competing with the screenshot positioning. The catch: it adds maintenance surface and dilutes the brand if not held to the same quality bar. **Decision should be deferred to August 2026** — only ship if the first 30 categories + 12 posts have moved real traffic (≥1k clicks/mo organic).

**Owner:** founder. **Effort:** decision in 90 days; if green-lit, ~25h of content build.

### E.4 AI citation strategy — explicit, not implicit

The competitor research found that **3 of 8 target queries are high-AIO terrain**: "how to make app store screenshots", "app store screenshot size 2026", "app store screenshots without figma". On these queries, organic CTR collapses to ~10% (per the brief's algorithm context). Strategy options:

**Strategy A — Cede AIO-heavy informational queries.** Accept that the blog's role is brand-building, not click-driving, on these. Focus all conversion energy on `/alternatives`, `/screenshots-for`, and `/`. Risk: long-term topical authority erosion.

**Strategy B — Optimize for citation, not click.** Build informational pages explicitly to be cited by AIO/Perplexity/ChatGPT. Tactics:
- Definitional one-line opener on every blog post ("App Store screenshot dimensions are 1290×2796 pixels in portrait orientation…")
- Tables with quantified rows (not prose paragraphs)
- HowTo + DefinedTerm + ItemList schema on every applicable post
- One memorable, citable phrase per post ("The first 200ms of the carousel decides the conversion")
- Explicit attribution-friendly format ("Source: ShotStudio analysis of [N] indie iOS apps")

**Recommendation: B.** Strategy A is a forfeit. Citation builds brand awareness even without clicks, and ChatGPT/Perplexity citations are growing into a real referral source. The work overlaps with E.1 (original data) and D.6 (frontmatter-driven schema).

**Owner:** founder. **Effort:** ongoing per-post. **Expected outcome:** ChatGPT/Perplexity citation share grows from 0 to materially measurable by Q4 2026.

---

## F. Diversification — reduce Google dependency

A 7-day-old site that relies on organic for revenue is already in trouble. Three specific bets, each with a concrete first step.

### F.1 Lead magnet: "Indie iOS App Submission Checklist" (PDF + interactive)

**Format:** A 1-page PDF + a free `/submission-checklist` interactive web tool (no signup to view, signup to download the PDF). Pulls from the same content as blog post #8 in `.agents/content-strategy.md:60`, but stripped to a checkable list with App Store Connect screenshots inline.

**Why this matches the ICP:** Indies submitting their first app are exactly the buyers ShotStudio needs. They're anxious, deadline-driven, and willing to trade an email for confidence. The checklist's last item is "Screenshots ready (1290×2796 PNG)" → CTA: "Generate yours at $7 →".

**Owner:** founder. **Effort:** 4h (write + design + Resend integration for the email capture). **Expected outcome:** 50–200 email signups in launch month; recurring trickle thereafter; lead magnet shows up in `[topic] PDF` and `[topic] checklist` long-tail queries.

### F.2 Engineering-as-marketing: free interactive App Store screenshot spec validator

**Format:** `/tools/screenshot-spec-checker` — drag-drop PNG → instant validation (resolution, color space, transparency, file size, aspect ratio). Returns pass/fail + a fix suggestion per failure. Zero auth required. Built on top of Sharp (already a dependency).

**Why this fits ShotStudio uniquely:** the codebase already has image-processing infrastructure. Cost is near-zero (CPU-bound, no AI calls). It's the type of free tool indies pin in their bookmarks and screenshot. It's also a perfect AIO citation surface for "how to check app store screenshot size" queries.

**Why it beats a PDF lead magnet:** interactive tools earn 5–10× the backlinks of downloadable PDFs (per Ahrefs studies cited in `/marketing-skills:free-tools`), and Google increasingly favors tool pages over blog posts for `[topic] checker` queries.

**Owner:** founder + 1 day dev work. **Effort:** 8–10h. **Expected outcome:** dozens of organic backlinks from indie iOS blogs over 6 months; a citable AIO surface for the spec query; brand "we're the indie iOS infra company" anchor.

### F.3 Two social channels to lean into

Per `.agents/launch-plan.md`, X is the primary indie-iOS watering hole. Adding to that:

1. **X (Twitter)** — `@KazakisThanos` already exists. The build-in-public sequence from the launch plan is the right play. **3 posts/week sustained, not bursts.** Topic mix: real generations (anonymized), a unit-economics post, a privacy architecture deep-dive, a "what I learned launching" thread, a roadmap-from-revenue thread once you have purchases. Embed the screenshots — X favors image posts.

2. **r/iOSProgramming + r/SideProject** — per the launch plan, but treat them as ongoing channels, not one-shot launch venues. Once a quarter, post a substantive original-data piece ("ShotStudio generation telemetry: what 1,000 indie devs picked"). Different framing per subreddit per the launch plan rules.

**Skip for now (despite being marketing-skills's instinct):**
- **LinkedIn** — not the ICP. ShotStudio's buyers don't live there.
- **TikTok/YouTube Shorts** — high production cost, low fit for one-shot indie tools. Maybe Q4 2026 once there's a launch-recap video to repurpose.
- **Newsletter (own)** — premature until there's a list. The lead magnet (F.1) builds it.

### F.4 Email sequence (when there's a list)

Re-engagement isn't applicable — no list exists yet. The minimum useful email program from day one:

| Trigger | Email | Goal |
|---|---|---|
| Signup (no purchase yet) | "Three things every indie ships wrong on their first App Store submission" — value-led, no pitch | Build trust |
| Purchase (any pack) | Receipt + "What to do with your three shots" — practical tips on which shot order maximizes conversion | Activate |
| Failed generation auto-refund | "We refunded your credit. Here's why this generation didn't work and how to nudge it." | Trust recovery |
| 30 days post-purchase | "What's new in ShotStudio + a free regeneration credit if you submit a new app this month" | Re-engage |
| Submission checklist (F.1) | 5-email sequence dripped over 2 weeks: each email is one indie's launch story with one tactical lesson | Nurture |

All written in the same dry-confident voice as the site. No "🚀" emojis, no Hi {{FirstName}} 👋, no marketing-template smell.

**Owner:** founder. **Effort:** 6–8h to write the initial 5 emails. **Expected outcome:** activation rate on first-time buyers improves; re-purchase rate from existing customers measurable by Q3 2026.

---

## G. STOP doing

There are no "actively hurting" practices in the data because there's no traffic to misdiagnose. But there are practices in the code and content that, if left, will hurt scaling:

| Stop | Why | What to do instead |
|---|---|---|
| **Hard-coding `<h2>` as every page's lead heading** (`Section` component) | No H1 = weakest primary on-page signal on 23 of 24 URLs. | Add `as: "h1" \| "h2"` prop to `Section`; pass `as="h1"` for the lead Section on every page. |
| **Overriding `openGraph` per-page without including `images`** | Every non-home URL ships with no `og:image`, breaking every social share. | Either rely on layout defaults (just remove the page-level `openGraph` redefinitions) or add `next/og` dynamic OG image routes. |
| **`.slice(0, 3)` on sibling/related links** | Caps internal-link equity arbitrarily at 3 even when more siblings exist. | Configurable or removed. Show all siblings, group visually if needed. |
| **Hard-coding which blog post gets HowTo schema** (`isHowToCandidate`) | Won't scale to 12+ posts; new posts can't opt in without a code change. | MDX frontmatter–driven (D.6). |
| **Blocking auth pages in `robots.txt` instead of `noindex`** | Auth URLs that got indexed before the block stay indexed indefinitely with empty metadata. | Remove `/sign-in` + `/sign-up` from `robots.ts`, add `robots: { index: false }` metadata to the page files. |
| **Footer-only links to /screenshots-for, /alternatives, /blog** | Top-nav links carry more weight; these are the strategic SEO surfaces. | Expose at least one of them in the top nav. |
| **Two confusingly-overlapping schema types: SoftwareApplication on `/alternatives/[competitor]`** — the page is *about* a competitor, but it emits ShotStudio's SoftwareApplication schema as if the page is about ShotStudio | Confuses entity context for Google + AIO. | Keep SoftwareApplication on `/` and `/pricing`; drop it from `/alternatives/[competitor]`. Replace with `Article` schema, `about: { @type: SoftwareApplication, name: data.name }` to signal the page is about the competitor. |
| **Disclosing bias in the *first sentence* of `best-app-store-screenshot-generators-2026`** | AIO models down-weight overtly promotional openers. The bias disclosure is honest and correct, but the placement reads as marketing-disclaimer to LLM rankers. | Move the bias paragraph below a definitional neutral opener: "App Store screenshot generators are tools that produce App Store-ready screenshots (1290×2796 portrait) from raw app screenshots. Below is a comparison of the main ones shipping in 2026 — disclosure: I built one of them, ShotStudio." |
| **CCBot fully blocked** (`User-Agent: CCBot \n Disallow: /`) | Common Crawl is the primary training dataset for many LLMs that drive AIO citations. Blocking CCBot opts you out of the long-tail of AI search referrals. | Decision call. If you want to be cited by Claude/Perplexity/ChatGPT (you already explicitly allow their crawlers), you should also allow CCBot so the underlying training data includes you. Recommend unblocking CCBot. |
| **`/blog`'s `og:title` differs from `<title>`** | Inconsistency makes social-preview QA harder + dilutes the "Blog — ShotStudio" brand wedge on link previews. | Align them. Pick one and use it both places. |

---

## Sequencing recap

| Window | Focus |
|---|---|
| **Today** (PH launch day) — | nothing in this doc. The launch plan is the priority. Ship C.1 (the sign-in/sign-up fix) only if you have 20 min before going live, because indexed-but-blocked sign-in is an embarrassment on a public launch day. Everything else waits until tomorrow. |
| **Week 1 post-launch** — | C.1, C.2, C.3, C.4, C.5, C.6, C.7, C.8 (this entire This-Week section, ~12h total) |
| **Weeks 2–4** — | D.5 (blog priorities #4 and #5, the highest-leverage posts), D.3 + D.4 (competitor data updates) |
| **Month 2** — | D.1 (categories 11–30), D.2 (`/vs` route), D.6 (frontmatter schema) |
| **Month 3** — | D.5 continues (posts #6–8), F.1 (lead magnet), F.2 (free spec validator) |
| **Months 4–6** — | E.1 (original data report), E.2 (logo wall + showcase), E.4 (citation strategy ongoing), F.4 (email sequence) |

## What this audit deliberately did NOT do

- Run `/marketing-skills:copywriting` rewrites on bleeding pages — there are no bleeders.
- Run `/marketing-skills:cro` on traffic-but-no-conversion pages — there's no traffic.
- Run `/marketing-skills:marketing-psychology` title rewrites — current titles are good; the constraint is H1 presence and OG images, not title psychology.
- Diagnose Core Update damage — there's no damage.
- Verify GA4 vs GSC tracking parity — 0 clicks is 0 in both systems, parity is trivially satisfied.

All five would have been busywork on this dataset. Revisit them in 90 days once there's real traffic to optimize.

---

*Source files used: GSC exports in `C:\Users\thaka\Downloads\shotsstudio\` (Coverage + Performance), full live crawl of all 9 visible page templates, codebase inspection of `src/app/(marketing)/**`, `src/lib/marketing/schema.ts`, `src/data/categories.ts`, `src/data/competitors.ts`, `src/components/marketing/section.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx`, existing strategy docs `.agents/product-marketing.md`, `.agents/content-strategy.md`, `.agents/programmatic-seo.md`, `.agents/launch-plan.md`.*
