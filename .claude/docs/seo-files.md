# Sitemap and robots

## `src/app/sitemap.ts`: dates

- Every `lastModified` comes from a hand-kept date in `REVISED`, `CATEGORY_REVISED` or `COMPETITOR_REVISED`. Never use `new Date()` here.
- Next caches `sitemap.ts` at build time, so `new Date()` stamps every URL with the build time. That happened once: the 2026-06-13 build gave all 52 non-blog URLs the same timestamp, and Google did not come back for 45 days. Google ignores a `<lastmod>` that changes on every URL at once.
- When the content behind a page changes, change only that page's date. To re-date one category or competitor page, add an override to `CATEGORY_REVISED` or `COMPETITOR_REVISED` instead of changing the shared fallback.
- `src/app/sitemap.test.ts` fails if the output depends on the clock or if every URL has the same date.

## `src/app/robots.ts`: what to block

- Block only `/api/`. `/home`, `/sign-in` and `/sign-up` stay out of `robots.txt` and carry `robots: { index: false }` metadata instead. If `robots.txt` blocks a page, Google cannot read that page's noindex, so an indexed URL stays indexed. That is how `/home` got the "Indexed, though blocked by robots.txt" warning.
- Search Console keeps a "Blocked by robots.txt" row for an `/api/*` URL, because client bundles reference the checkout and generation endpoints. That is correct: they are POST-only JSON endpoints. Do not "fix" it.
- `src/app/robots.test.ts` fails if a rule blocks more than `/api/` or blocks a noindex page.

Pruning has its own rules: see "How pruning works" in `PRUNED.md`.
