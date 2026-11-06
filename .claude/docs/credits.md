# Credit accounting

Silent bugs here cost real money. Always add tests for changes to `src/lib/credits.ts`, `src/lib/db/queries/`, `debitAndStartGeneration` or `src/lib/billing/checkout.ts`.

## Debit before AI, refund on failure

- Generations: `debitAndStartGeneration` (private to `src/lib/generation/lifecycle.ts`, reached through `runGeneration`) atomically debits one credit, writes the `usage` transaction and inserts the `pending` generation row.
- Purchases: `grant` from `src/lib/credits.ts`.
- Failures: `refund` from `src/lib/credits.ts`.

All three are wrapped in `db.transaction()`. Every balance change goes through them; do not bypass them.

## `grant()` ON CONFLICT requires the partial-index `WHERE`

The `transactions.stripePaymentId` unique index is partial (`WHERE ... is not null`). Postgres' arbiter inference can't match a partial index without an explicit `where:` on `onConflictDoNothing`. Removing the `where:` re-introduces a 100%-fail bug on every Stripe webhook.

`stripePaymentId` holds the Checkout Session id, so a replayed session grants nothing.

## Rebuilding balances

`pnpm db:reconcile` replays Stripe purchases through `grant()` into a fresh database. It restores purchased credits, not remaining ones, and is a dry run until `--apply`. Read the header of `scripts/reconcile-stripe.ts` first.
