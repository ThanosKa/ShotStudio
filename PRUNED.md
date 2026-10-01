# PRUNED.md - SEO sprint 2026-10-01 (branch `seo-2026-10`)

Worktree: `C:/Users/thaka/Local/Cursor/ShotStudio-seo`. Nothing is pushed or deployed.

## What changed, in one view

| Area | Old | New |
|---|---|---|
| Sitemap | 54 URLs | **22 URLs** (54 - 31 categories - 2 competitors + 1 new tool page) |
| `/screenshots-for/*` | 40 indexable | 9 indexable, 31 `noindex, follow` |
| `/alternatives/*` | 5 indexable | 3 indexable, 2 `noindex, follow` |
| Homepage title | "ShotStudio — App Store screenshots in under a minute" | "ShotStudio: AI App Store Screenshot Generator" (45 chars) |
| Organization JSON-LD email | personal Gmail | hello@shotstudio.dev |
| Social metadata | /pricing and hubs had no og:image, inherited homepage twitter text | og:image + per-page twitter on /pricing, /screenshots-for, /alternatives, /blog, /privacy, /terms, new tool page |
| Images | showcase PNGs served raw (about 8 MB on home); og-default.png 1.17 MB | showcase and hero use next/image optimisation with `sizes`; og-default.png 108 KB, same 1731x909 |
| Blog snippets | titles 60 and 75 chars, descriptions 168 and 224 | titles 46 and 43, descriptions 150 and 147 (title budget includes the " — ShotStudio" suffix) |
| New | - | IndexNow key + script; free screenshot size checker at `/tools/app-store-screenshot-sizes` |

## How pruning works (and how to revert)

One typed list drives everything: `src/lib/marketing/pruned-list.ts` (`PRUNED`: `{ path, action, target?, reason, gsc }`).
(It is dependency-free because `next.config.ts` imports it and the config loader does not resolve the `@/` alias. Helpers live in `src/lib/marketing/pruned.ts`.)

1. `next.config.ts` `headers()` sends `X-Robots-Tag: noindex, follow` for each `noindex` entry. `redirect` entries become permanent (308) redirects (none used).
2. `src/app/sitemap.ts` skips pruned category and competitor pages.
3. Hubs (`/screenshots-for`, `/alternatives`), the footer, the homepage competitor cards, the pricing and blog category links, the category "related" ring, the compared-tools lists and the competitor "other alternatives" lists all filter pruned pages (`categoriesByDemand`, `categoriesInCluster`, `relatedCategories`, `categoriesForCompetitor`, `indexableCompetitors`).

**Revert one URL:** delete its line in `pruned-list.ts`. That restores the header, the sitemap row and every internal link at once. Then bump the matching `REVISED` / `CATEGORY_REVISED` / `COMPETITOR_REVISED` date in `src/app/sitemap.ts`.
**Revert everything:** empty the `PRUNED` array.
**Turn a noindex into a 308:** set `action: "redirect"` and `target`.

Keep rule applied: never prune a URL with at least 1 click in either export, or at least 10 impressions in the 2026-10-01 export; never prune vpn-apps, pet-care-apps, music-apps, finance-apps, running-apps. `pruned.test.ts` re-checks this against the raw CSVs when they are on disk.

Kept (state unchanged: still indexed, still in the sitemap):
categories fitness-apps (1 click in July), finance-apps (31 imp), education-apps (10), music-apps (1 click), weather-apps (10), vpn-apps (1 click, 53), pet-care-apps (1 click), running-apps (26), ai-chatbot-apps (20); competitors appmockup (20), previewed (35), shotbot (1 click).

## Pruned URLs: indexable -> noindex, follow + removed from sitemap

Reason (all categories): templated page below the keep threshold; Google reports the family as crawled, not indexed (7 -> 30 pages).
Reason (competitors): below threshold, no clicks, no impressions to defend (screenshots-pro had 6 impressions in July, none now; rotato none).
GSC columns: clicks = both exports combined; impressions = 2026-10-01 export (2026-06-29 to 2026-09-28).

### /screenshots-for (31)
| URL | Clicks | Impressions |
|---|---|---|
| `/screenshots-for/productivity-apps` | 0 | 0 |
| `/screenshots-for/indie-games` | 0 | 7 |
| `/screenshots-for/dev-tools` | 0 | 0 |
| `/screenshots-for/meditation-apps` | 0 | 4 |
| `/screenshots-for/budgeting-apps` | 0 | 2 |
| `/screenshots-for/note-taking-apps` | 0 | 0 |
| `/screenshots-for/language-learning-apps` | 0 | 0 |
| `/screenshots-for/social-apps` | 0 | 0 |
| `/screenshots-for/dating-apps` | 0 | 2 |
| `/screenshots-for/ecommerce-apps` | 0 | 1 |
| `/screenshots-for/ai-apps` | 0 | 5 |
| `/screenshots-for/kids-apps` | 0 | 0 |
| `/screenshots-for/travel-apps` | 0 | 0 |
| `/screenshots-for/food-delivery-apps` | 0 | 1 |
| `/screenshots-for/habit-tracker-apps` | 0 | 4 |
| `/screenshots-for/photo-editing-apps` | 0 | 1 |
| `/screenshots-for/podcast-apps` | 0 | 0 |
| `/screenshots-for/crypto-apps` | 0 | 0 |
| `/screenshots-for/sleep-apps` | 0 | 0 |
| `/screenshots-for/recipe-apps` | 0 | 9 |
| `/screenshots-for/journaling-apps` | 0 | 4 |
| `/screenshots-for/task-management-apps` | 0 | 6 |
| `/screenshots-for/health-tracking-apps` | 0 | 4 |
| `/screenshots-for/real-estate-apps` | 0 | 3 |
| `/screenshots-for/shopping-list-apps` | 0 | 3 |
| `/screenshots-for/parenting-apps` | 0 | 0 |
| `/screenshots-for/scanner-apps` | 0 | 2 |
| `/screenshots-for/language-translation-apps` | 0 | 7 |
| `/screenshots-for/invoicing-apps` | 0 | 0 |
| `/screenshots-for/ar-apps` | 0 | 0 |
| `/screenshots-for/ebook-reader-apps` | 0 | 3 |

### /alternatives (2)
| URL | Clicks | Impressions |
|---|---|---|
| `/alternatives/screenshots-pro` | 0 | 0 |
| `/alternatives/rotato` | 0 | 0 |

Note: /screenshots-for/indie-games (37 impressions in July, 7 now, 0 clicks) and /alternatives/screenshots-pro fall under the rule and are pruned. If you want either back, delete the line.

## Sitemap REVISED dates bumped to 2026-10-01 (only pages whose content really changed)

- `home`, `pricing`, `screenshotsForHub`, `alternativesHub` (links, counts, social metadata).
- `CATEGORY_REVISED` for the 9 kept categories and `COMPETITOR_REVISED` for the 3 kept competitors (sibling and "other alternatives" blocks changed).
- New `sizeChecker` entry for the tool page.
- Blog: both posts now carry `updatedAt: "2026-10-01"` because their bodies changed (cross-links). A5 title/description edits alone did not move any date.
- Not bumped: `privacy`, `terms`, `blogHub` (only og/twitter tags changed).

## A2 images

- `showcase-card.tsx`: removed `unoptimized`, added `sizes="840px"` (the card is a fixed 840px).
- `hero.tsx`: removed `unoptimized` from the App Store badge SVG (Next skips optimisation for .svg automatically), added `sizes="40px"`.
- `public/og-default.png`: 1,172,610 -> 107,798 bytes, palette PNG (128 colours), 1731x909 unchanged. Same path, so `layout.tsx` and the blog fallback need no edits. Nothing else references raw showcase paths except `src/lib/marketing/showcase.ts` (fed to next/image). The original is in git history (`git show HEAD~:public/og-default.png` on the commit after this branch).
- Not done (outside the brief): the blog hero image in `blog/[slug]/page.tsx` still uses `unoptimized` (0.9 and 1.7 MB PNGs); `ClerkProvider` still loads on marketing pages (about 1.1 MB JS).

## A3 social metadata

New `socialMetadata()` in `src/lib/marketing/meta.ts`, used by `hubMetadata()` (/screenshots-for, /alternatives, /blog, /privacy, /terms, tool page) and by /pricing. /terms is covered without touching its merge-risk file because it already calls `hubMetadata`.

## Merge-risk files

Not touched: `scripts/generate-shot.ts`, `src/app/(marketing)/terms/page.tsx`, `src/lib/openrouter.ts`. Model names and pricing copy untouched. `src/app/(marketing)/pricing/page.tsx` got a small hunk (metadata + one count); check it if the original tree edits pricing copy. At the time of writing the original tree's only modified files are the three above.

## A6 IndexNow (post-deploy step, not run)

Key: `bedfc13f5733ed9217c99edc5423cdac` (file `public/bedfc13f5733ed9217c99edc5423cdac.txt`).
After deploying: confirm `https://shotstudio.dev/bedfc13f5733ed9217c99edc5423cdac.txt` returns the key, then run `node scripts/indexnow.mjs` (add `--dry-run` to print the payload). It reads the live sitemap and POSTs to https://api.indexnow.org/indexnow. Reaches Bing/Yandex etc., not Google.

## Scope B: free screenshot size checker (BUILT)

- Page: `/tools/app-store-screenshot-sizes` (single H1, rules, link to and from the blog post, footer link, sitemap entry, labelled inputs, results in a table). Client-side only; zip via jszip loaded on demand.
- Code: `src/lib/screenshot-sizes/spec.ts` (dataset), `check.ts` (validation, resize plan, targets), `check.test.ts` (24 tests), UI `src/components/marketing/screenshot-size-checker.tsx`.
- Sources, fetched 2026-10-01 with WebFetch: Apple https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications and Google Play https://support.google.com/googleplay/android-developer/answer/9866151. Cited in the `spec.ts` header.
- Verification caveat: the first summarised Apple fetch contradicted the page (it listed 6.9" as 1398x2034 and omitted 1290x2796). I re-fetched asking for verbatim text and used only that; a second verbatim pass confirmed the iPhone and iPad tables. Mac, TV, Vision Pro, Watch and iPhone Duo are deliberately not in the dataset. Google Play: only the rules confirmed verbatim are encoded (JPEG/24-bit PNG, 320-3840 px, 2x ratio, 2 minimum, 8 per device type, promo sizes). The "1,080-7,680 px tablet" range from the first summary was not confirmed, so it is not used.
- Finding worth knowing: the standard iPhone 1290x2796 shot fails Google Play's 2x rule (ratio 2.17), so the tool correctly tells indies to pad it.
- Manual browser test still to do: the canvas and zip path is not covered by unit tests (pure logic is). Try one PNG with and without transparency, pad and crop, PNG and JPEG output.
- AGENTS.md lists Google Play and multi-device output as out of scope for the product; this is a free marketing tool, not product output.

## Things noticed, not changed

- The artwork in `public/og-default.png` prints "shotstudio.app" but the domain is shotstudio.dev. Needs a design fix by hand (keep the file size under 300 KB).
- Privacy page, terms page and the footer still publish kazakis.th@gmail.com as the contact (terms is a merge-risk file). Switch to hello@shotstudio.dev together.
- The sizes blog post says "iPhone 6.7\" display"; Apple now calls the 1290x2796 class 6.9". Body edit needed, then bump its `updatedAt`.
- `public/llms.txt` / `llms-full.txt` still list every category and competitor, including pruned ones (the llms tests require it). llms-full blog titles were updated to the new titles.
- Blog body still links to /alternatives/rotato and /alternatives/screenshots-pro (noindex, follow pages). Harmless; remove if you want zero links to pruned pages.
- Local `next start` needed a syntactically valid dummy Clerk key at build time: `.env.local` has `pk_test_placeholder`, so the middleware 500s on every page until a real key is set. The production build is unaffected.
