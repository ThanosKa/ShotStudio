# SEO backlog

Ordered by expected signups per hour of work. Every item names the query, the page and the change. The top item is shipped first on the next run.

Last rebuilt: 2026-10-31 (setup). Keyword map rebuilt: 2026-10-31.

## Queue

1. **AppLaunchpad alternatives page.** Query: "applaunchpad alternative" (44 impressions in 90 days, currently landing on the `/alternatives` hub at position 94). Page: new `/alternatives/applaunchpad`. Change: add an entry to `src/data/competitors.ts` + `competitor-editorial.ts` + `competitor-profiles/applaunchpad.md`, update `public/llms-full.txt` (test-guarded) and add 3 internal links (hub, best-generators post, one category page). Blocker: AppLaunchpad's pricing page is client-rendered and its own blog gives $19/mo and $29/mo. Load https://theapplaunchpad.com/pricing in a real browser and record the plans with an "as of" date before writing a word.
2. **Fix the "6.7\" spec" label.** Query: "app store screenshot sizes", "6.9 inch screenshot size". Pages: `/blog/app-store-screenshot-sizes-2026`, FAQ (`src/lib/marketing/faq-data.ts`), `public/llms*.txt`, `public/pricing.md`, every category and competitor page that says "iPhone 6.7\" portrait". Change: Apple now lists 1290×2796 under the 6.9" display (see `src/lib/screenshot-sizes/spec.ts`). State it as "1290×2796, one of Apple's accepted 6.9\" iPhone sizes". The sizes post also has to stop calling 1290×2796 the single "master spec".
3. **Get the 2 unknown URLs indexed.** `/tools/app-store-screenshot-sizes` and `/blog/app-store-screenshot-sizes-2026` are "URL is unknown to Google" (GSC URL Inspection, 2026-10-31), even though the sitemap was read on 2026-10-29. This run added in-body links from the homepage and the indexed best-generators post. Next: owner clicks "Request indexing" for both in GSC. Re-inspect on the next weekly run. If they are still unknown, check whether the post and the tool page compete for the same query.
4. **4 category pages "Crawled, currently not indexed".** education-apps, music-apps, pet-care-apps and ai-chatbot-apps (GSC, 2026-10-31). Cause: templated body close to the indexed siblings. Change: add one section per page that only this product can write (a real generated example set for that category, with the pitch used). This needs real outputs from the owner. If none come within 2 weeks, consider noindexing them under the PRUNED rule (music-apps and pet-care-apps are on the never-prune list, so flag those first).
5. **AppScreens alternatives page.** Query: "appscreens alternative". Several competitors (AppLaunchpad, FrameStudio) publish one, so it has demand. Same steps as item 1. Needs pricing verified in a browser.
6. **Running app page: from position 6.6 to the top 3.** Query: "running app screenshot" (position 6.6, 0 clicks over 79 page impressions). Page: `/screenshots-for/running-apps`. Change: open the top 3 results, answer the query in the first paragraph, check the title CTR. The page also ranks at 27 for "crop dash run app", which is an unrelated app: ignore it.
7. **VPN page: from position 7.4 to the top 3.** Query: "vpn screenshot" / "shot vpn". Page: `/screenshots-for/vpn-apps`. Same treatment as item 6.
8. **indie-games is noindexed but got 1 click in 90 days.** GSC 2026-08-02..10-31: 1 click and 16 impressions at position 10.7. PRUNED.md's keep rule says never prune a URL with 1+ click. Flagged to the owner in the report. If approved, delete its line in `src/lib/marketing/pruned-list.ts`.
9. **Competitor profiles are stale (2026-05-13).** `competitor-profiles/_summary.md` says "no competitor uses AI generation". AppMockUp's AI generator, FrameKit, Screenies, ASO Shots and others now do. Update the summary and the `/alternatives` hub copy so the page is not making a false "only AI tool" claim. Check every place that says "only".
10. **"Under a minute" speed claim not verified.** Home H1 and many pages say it. Ask the owner for real p50/p90 generation times from the logs. If p90 is over 60 s, change the copy.
11. **ShotStudio vs AppMockUp page.** Query: "shotstudio vs appmockup" / "appmockup ai alternative". AppMockUp now sells AI credit packs from $9 for 25 screenshots, the closest like-for-like competitor. A fair vs page, with sources.
12. **Blog: App Store screenshot headline examples.** Query: "app store screenshot headline examples" / "app store screenshot captions". Gap. Needs real taglines ShotStudio generated (with permission) to beat the top 5. Ask the owner for them.
13. **Monthly: directories + outreach drafts.** `seo/directories.md` is empty. First monthly run: list relevant directories (Product Hunt, AlternativeTo, Peerlist, SaaSHub, etc.) with ready-to-paste copy.

## Done

- 2026-10-31: removed the false "click-to-edit text" and "free per-shot regenerate / unlimited regenerations" claims site-wide (see log).
- 2026-10-31: in-body links to the size checker from the home page and the best-generators post. Blog posts no longer link to noindexed category pages.
- 2026-10-31: category H1s and OG images keep proper casing ("VPN apps", "AI chatbot apps").
