<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ShotStudio

One-time-pay AI App Store screenshot generator: 3 mobile screenshots → polished 4-image set via OpenRouter. Single-tenant, credit-pack billing, privacy-first (no image persistence).

## Tooling

- Package manager: **pnpm** (workspaces enabled). Never run `npm` or `yarn`.
- DB scripts load env from `.env.local` via `dotenv-cli`: `pnpm db:generate | db:migrate | db:push | db:studio`.
- Email preview server: `pnpm email` (port 3001 — `next dev` owns 3000).
- Typecheck before declaring done: `pnpm exec tsc --noEmit`.
- Tests: `pnpm test` (run once) / `pnpm test:watch`. Uses **vitest** + **PGlite** (in-memory Postgres) — no real DB required. `vitest.setup.ts` mocks `@/lib/db` so anything importing it gets a fresh PGlite instance per test, with all `drizzle/*.sql` migrations applied. Always add tests for changes to credit accounting (`src/lib/credits.ts`, `src/lib/db/queries/`) — silent bugs there cost real money.

## Non-obvious rules

- **Credit accounting is debit-before-AI, refund-on-failure.** For generations use `debitAndStartGeneration` (atomic debit + pending row insert) from `src/lib/db/queries`. For purchases use `grant`, for failures `refund`, both from `src/lib/credits.ts`. All three are wrapped in `db.transaction()`; do not bypass.
- **`grant()` ON CONFLICT requires the partial-index `WHERE`.** The `transactions.stripePaymentId` unique index is partial (`WHERE ... is not null`). Postgres' arbiter inference can't match a partial index without an explicit `where:` on `onConflictDoNothing`. Removing the `where:` re-introduces a 100%-fail bug on every Stripe webhook.
- **Webhooks are idempotent.** Stripe events are deduped via Upstash Redis (event ID + TTL); Resend sends use idempotency keys (`welcome-email/<userId>`, `credits-purchased/<stripeEventId>`). Preserve these on any change.
- **Generation route declares `export const maxDuration = 300`** for the long-running image-generation calls. Don't remove it.
- **Logging.** Use `@/lib/logger` (pino) on the server — never `console.*`. First arg is a structured context object, second is the message string; never interpolate values into the message. Errors go under the `err` key. At the top of any handler/action create a child logger (`logger.child({ action, ...ids })`) and reuse it.
- **Error handling.** Webhook routes wrap handler bodies in try/catch and return 500 on unexpected failure so the upstream (Stripe/Clerk) retries. For Stripe, on handler error we also `redis.del(idemKey)` to release the idempotency claim — preserve this when editing.

## Out of scope (v1)

Subscriptions, refund UI, persistent generation history, team accounts, public API, i18n, dashboard dark mode, Google Play / multi-device output. Push back on requests that drift here.

## Git workflow

Conventional commits: `type(scope): description` — single line, imperative mood, no body/footer/Co-Authored-By.

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.

Branches: `feature/`, `fix/`, `refactor/`, `docs/` + short description. Create feature branches off `dev`.

PRs: title same format as commits, always via `gh pr create`. All merges to `main` go through a PR from `dev` — never push directly to `main`.

## NEVER

- Push to `main`, use `--force`, skip pre-commit hooks, or merge/push without asking.
- Use the `any` type — use `unknown` and narrow.
- Run `pnpm dev` or any `pnpm dev:*` script — the developer runs dev servers. Ask them to start/restart instead.
