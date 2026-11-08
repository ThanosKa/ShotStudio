# ShotStudio

One-time-pay AI App Store screenshot generator: 3 raw mobile screenshots → a polished 3-image set via OpenRouter. Single-tenant, credit-pack billing, privacy-first (images are never stored).

## Data flow

- **Generation**: `src/components/wizard.tsx` → `POST /api/generations` → `runGeneration` (`src/lib/generation/lifecycle.ts`): debit one credit, generate each shot through OpenRouter, upscale (sharp under Next, the Cloudflare Images binding on the Worker), return data URLs.
- **Purchase**: `POST /api/checkout` → Stripe Checkout → `/api/webhooks/stripe` → `runCheckoutFulfillment` (`src/lib/billing/checkout.ts`) → `grant()` → purchase email.
- **Users**: the Clerk webhook and `ensureUser` (on authenticated routes) both write the `users` row, because either can arrive first.

`src/app/home/` is the signed-in app; `src/app/(marketing)/` is the public SEO site, fed by `src/data/`. `src/proxy.ts` is the Next 16 middleware file, where Clerk guards routes. `emails/` holds templates; `src/lib/emails/` sends them.

## Commands

- Package manager: **pnpm**. Never run `npm` or `yarn`.
- Before declaring done, run `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm test`. CI runs lint, type-check, tests, the Next build, the Worker build (`pnpm build:vinext`) and `pnpm check:worker-bundle` on PRs into `main`, but check locally first.
- Production is the Cloudflare Worker `shot-studio`. Merging to `main` does not update it: a change reaches production only when someone runs the deploy commands in README, "Deploy on Cloudflare Workers" (Node 24.22 or newer). After a merge that should go live, say so and offer to deploy; never deploy without the developer's yes.
- `pnpm test` runs once; `pnpm test:watch` watches. Tests use in-memory PGlite, no real database.
- The developer runs dev servers: ask them to start or restart `pnpm dev`, and never run it yourself.
- Ask before any script that acts on whatever `.env.local` points at: `db:migrate`, `db:push`, `db:reset` (drops every table), `db:reconcile`, `test:user`.

## Before working on

- Any Next.js feature → read the matching guide in `node_modules/next/dist/docs/` first: this version has breaking changes from your training data. Heed deprecation notices.
- Server code (API routes, `src/lib/`) → read `CODING_STANDARDS.md`
- Credit balances, debit, `grant` or `refund` → read `.claude/docs/credits.md`
- The generation route or `src/lib/generation/` → read `.claude/docs/generation.md`
- Stripe or Clerk webhooks, or transactional email → read `.claude/docs/webhooks.md`
- Schema, migrations, DB scripts or DB-backed tests → read `.claude/docs/database.md`
- Styling → read `.doc/DESIGN.md`; tokens live in `src/app/globals.css`
- User-facing errors, toasts or empty states → read `.doc/ux-writing.md`; it came from another project, so apply its copy rules and ignore its paths and i18n
- Domain terms → read `.doc/CONTEXT.md`; its Generation section is stale (four shots, Title Shot, Tagline, old presets), so `src/lib/generation/` wins
- Marketing copy, blog posts or SEO pages → read `.agents/product-marketing.md`; code wins on product facts
- Pruning or restoring a `/screenshots-for` or `/alternatives` URL → read "How pruning works" in `PRUNED.md`

The `backend` skill also came from another project (`@repo/database`, `validatedActionWithUser`): this repo's code and docs win over it.

## Scope

Out of scope for v1, so push back on requests that drift here: subscriptions, refund UI, persistent generation history, team accounts, public API, i18n, dashboard theme switching (it is dark-only), Google Play or multi-device output. The free size checker at `/tools/app-store-screenshot-sizes` is marketing, not product output.

## Git

- Commits and PR titles: `type(scope): description`, one imperative line, with no body, footer or Co-Authored-By. Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.
- Branch off `main` as `feature/`, `fix/`, `chore/`, `refactor/` or `docs/` plus a short description.
- Land on `main` through a PR opened with `gh pr create`; PRs are squash-merged.
- Ask before every push and merge. Never push directly to `main`, use `--force` or skip pre-commit hooks.
- If your change makes a line in these docs false, fix that line in the same PR.
