# Programmatic SEO Plan

*Last updated: 2026-05-10*
*Reads `.agents/product-marketing.md` and `.agents/content-strategy.md`.*

## Strategy

Three programmatic templates ship in priority order. Each ships a real dataset, a unique value-add per page (not just variable swaps), and internal links into the manual blog posts from `content-strategy.md`.

| Priority | Template | Pages | Search intent | When to ship |
|---|---|---|---|---|
| 1 | `/screenshots-for/[app-category]` | ~30 | Persona / use-case | First — biggest long-tail surface |
| 2 | `/alternatives/[competitor]` | 5–7 | "[X] alternatives" — high commercial intent | Second — ranks fast against weak SEO from competitors |
| 3 | `/vs/[competitor-a]-vs-[competitor-b]` | 6–10 | Head-to-head comparison | Third — captures evaluator queries |

Skipped playbooks (don't fit ShotStudio): Locations, Conversions, Integrations, Directory, Profiles, Translations.

---

## Template 1 — Persona pages: `/screenshots-for/[category]`

**Pattern:** "App Store screenshots for [app category]"
**Search examples:** "app store screenshots for fitness apps", "screenshots for finance apps", "screenshots for indie games"
**Volume profile:** Long-tail aggregated; head terms ("app store screenshots") already covered by `/blog`.

### Dataset (`src/data/categories.ts`)

Source: official App Store Connect categories + indie sub-niches. ~30 rows.

| field | type | notes |
|---|---|---|
| slug | string | URL slug, e.g. `fitness-apps` |
| name | string | Display, e.g. `Fitness apps` |
| presetId | enum | One of the 4 presets; auto-mapped per category |
| pitchExample | string | One-sentence example pitch for a hypothetical app in this category |
| screenshotChallenges | string[] | 2–3 concrete reasons screenshots in this category are hard (e.g. for finance: "screen filled with numbers reads as noise") |
| competitorCallout | string | What's typical/cliché in this category's screenshots, to contrast against |

Initial categories (seed):
- Productivity, Note-taking, Task managers, Calendar
- Fitness, Workout, Running, Yoga, Meditation
- Finance, Budgeting, Crypto, Investing
- Dev tools, IDEs, API clients, Terminal apps
- Education, Language learning, Flashcards, Kids
- Games (indie), Puzzle, RPG, Casual
- Health, Sleep, Mental health, Habit
- Social, Messaging, Dating, Community
- Creator tools, Photo editing, Video, Music
- Lifestyle, Travel, Food, Weather

### Page structure

```
H1: App Store screenshots for [Category]
Lead: [why screenshots matter specifically for this category — pulled from screenshotChallenges]

Section 1: What converts in [Category] (2-3 specific dos and don'ts pulled from screenshotChallenges + competitorCallout)
Section 2: Live preset preview — show the auto-picked preset for this category with 4 example shots
Section 3: 60-second walkthrough — "Upload 3 screens of your [category] app, get 3 polished shots back"
Section 4: FAQ (3 entries scoped to category — e.g. for Finance: "Should I blur fake numbers?")
CTA: Generate my [category] screenshots → /sign-up
Internal links: 2-3 to relevant blog posts (e.g. "Hero shot vs feature shot")
```

### Uniqueness budget per page
- ~120-word category-specific lead (challenge framing)
- ~200-word "what converts" section with category-specific examples
- 4 unique screenshot examples in the matched preset
- 3 unique FAQ entries
- Result: ~600 words of unique content per page, well above thin-content threshold

### Tech notes
- Static generation: `generateStaticParams` from the categories dataset
- ISR not needed — data is editorial, regenerate on commit
- Schema: `BreadcrumbList` + `WebPage` + per-FAQ-entry `FAQPage`
- Per-page metadata: `title`, `description`, `alternates.canonical`

---

## Template 2 — Alternatives: `/alternatives/[competitor]`

**Pattern:** "[Competitor] alternatives"
**Competitors (from product context):** AppMockUp, Previewed, Rotato, Shotbot, Screenshots.pro
**Search intent:** Evaluator already aware of [competitor] but wants options. High commercial intent.

### Dataset (`src/data/competitors.ts`)

| field | type | notes |
|---|---|---|
| slug | string | e.g. `appmockup` |
| name | string | `AppMockUp` |
| pricingModel | string | `Subscription, $X/mo` |
| primaryWeakness | string | One sentence — e.g. "Subscription priced for a job most indies do twice a year" |
| typicalUser | string | Who actually uses them today |
| featureGaps | string[] | 3–5 things they miss vs ShotStudio (subscription cost, persistent storage, manual layout, etc.) |
| honestStrengths | string[] | 2–3 things they do well — credibility builder |

### Page structure

```
H1: [Competitor] alternatives — what indies actually pick
Lead: ~150 words honestly framing why someone might be looking for alternatives
Section 1: Why people leave [Competitor] (from primaryWeakness + featureGaps)
Section 2: ShotStudio — same job, different model (one-time pay, never stored, AI-picked preset)
Section 3: Other alternatives worth knowing (2-3 honest mentions of OTHER competitors — credibility)
Section 4: Side-by-side table (price, model, output spec, persistence, refunds)
Section 5: Honest comparison — when [Competitor] is still the right pick
CTA: Try ShotStudio for $7 → /sign-up
```

### Uniqueness budget per page
- ~150 word lead per competitor
- ~300 words on weaknesses pulled from real differences
- Honest "when not us" section (~100 words)
- ~600 words minimum, all distinct

### Why this works for ShotStudio
Most of these competitors don't run aggressive content programs of their own — their `[brand] alternatives` SERPs are weak. Cheap to rank.

---

## Template 3 — Head-to-head: `/vs/[a]-vs-[b]`

**Pattern:** "[X] vs [Y]"
**Combos:** ShotStudio vs each of the 5 competitors + 2-3 competitor-vs-competitor pages (e.g. "AppMockUp vs Previewed") to capture evaluator traffic that doesn't yet know ShotStudio.

### Dataset
Reuses `competitors.ts` (above). `/vs/[a]-vs-[b]` page just diffs two rows.

### Page structure

```
H1: [A] vs [B] — which screenshot tool indies should pick
Lead: 1-line tldr verdict (be honest, not always ShotStudio)
Section 1: At-a-glance table (price, model, output, time)
Section 2: When [A] is right
Section 3: When [B] is right
Section 4: ShotStudio note (only on competitor-vs-competitor pages)
CTA: Try ShotStudio for $7 → /sign-up
```

### Uniqueness budget
Each page diffs two competitor rows, so the table is unique by definition. Hand-write the "When X is right" sections — this is where Google rewards real opinion.

---

## URL & file conventions

```
src/app/(marketing)/
  screenshots-for/[category]/page.tsx     ← Template 1
  alternatives/[competitor]/page.tsx       ← Template 2
  vs/[slug]/page.tsx                       ← Template 3 (slug = "a-vs-b")

src/data/
  categories.ts                            ← dataset for Template 1
  competitors.ts                           ← dataset for Templates 2 & 3
```

All under `(marketing)` route group → inherit existing nav/footer.
**Subfolders not subdomains** (consolidates domain authority).

## Internal linking architecture

```
/                                 (homepage)
├── /pricing
├── /blog/[slug]                  (12 priority posts from content-strategy.md)
├── /screenshots-for              (hub: list all categories)
│   └── /screenshots-for/[c]      (30 spokes)
├── /alternatives                 (hub: list all competitors)
│   └── /alternatives/[c]         (5–7 spokes)
└── /vs                           (hub: list all comparisons)
    └── /vs/[a]-vs-[b]            (6–10 spokes)
```

- Each spoke links back to its hub + 2-3 sibling spokes + 2 relevant blog posts.
- Each blog post links to the most-relevant `/screenshots-for/[category]` and `/alternatives/[competitor]`.
- Sitemap: split per template — `sitemap-categories.xml`, `sitemap-alternatives.xml`, etc. — easier to monitor indexation in Search Console.

## Indexation rules

- Index everything in Templates 1–3 (each has unique value).
- Add `robots.txt` rules excluding nothing — these pages are designed to rank.
- Add `BreadcrumbList` + appropriate schema (`SoftwareApplication` re-used per page; `FAQPage` for FAQ blocks).
- Submit sitemaps via `next-sitemap` or hand-rolled.

## Pre-launch checklist (per template)

- [ ] Each page has unique title + meta description
- [ ] Each page has at least 600 words of distinct content
- [ ] Schema markup validates in Rich Results Test
- [ ] Internal links from hub + siblings + blog
- [ ] Page in sitemap, no conflicting noindex
- [ ] Lighthouse score ≥ 90 (these are static — should be trivial)
- [ ] CTA matches search intent (Template 1: "Generate", Template 2: "Try for $7", Template 3: depends)

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Thin content penalty | Hand-write the lead + "what converts" + FAQ per page; budget ~600 words unique content minimum |
| Cannibalization with `/blog` | Blog targets head/awareness terms; pSEO targets long-tail. No keyword overlap. |
| Stale competitor data | Quarterly review of `competitors.ts` — pricing changes hit our pages |
| Google sees "AI-generated" → demote | These pages are programmatic but content is editorial-quality and useful. Pair with real screenshots from the showcase. |

## Sequencing

1. **Week 1**: Build Template 1 dataset (30 categories). Hand-write copy for first 5 categories. Ship.
2. **Week 2**: Fill remaining 25 categories. Backfill blog posts #1–4 from content-strategy.md.
3. **Week 3**: Ship Template 2 (`/alternatives/[competitor]`) for all 5 competitors.
4. **Week 4**: Ship Template 3 (`/vs/...`) for ShotStudio-vs-X pages.
5. **Month 2**: Layer in `/blog/` posts #5–12. Monitor indexation + first rankings.
