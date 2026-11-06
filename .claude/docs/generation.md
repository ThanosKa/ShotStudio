# Generation pipeline

- `src/app/api/generations/route.ts` declares `export const maxDuration = 300` for the long-running image calls. Don't remove it: each shot gets two attempts of up to 120s.
- In development only the `hero_feature` shot runs (`ACTIVE_ROLES` in `src/lib/generation/lifecycle.ts`), so a dev set has 1 image; other environments, tests included, produce 3.
- Any shot failing after its retry fails the whole generation: the row is marked `failed` and the one credit is refunded (see `.claude/docs/credits.md`).
- Images travel as data URLs in the response and are never stored; `generations` rows hold metadata only. The privacy page publicly promises this.
