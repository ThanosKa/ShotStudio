# Credit accounting

Silent bugs here cost real money. Always add tests for changes to `src/lib/credits.ts`, `src/lib/db/queries/`, `src/lib/identity/user-sync.ts`, `debitAndStartGeneration` or `src/lib/billing/checkout.ts`.

## Debit before AI, refund on failure

The Credit Ledger (`src/lib/credits.ts`) is the only writer of `users.credits` and `transactions`, through its three movements:

- Generations: `debit`. It takes one Credit and writes the `usage` Transaction directly inside the caller's transaction (`within` is required, no savepoint). `runGeneration` (`src/lib/generation/lifecycle.ts`) opens that transaction, calls `debit({ ..., within: tx })` and inserts the `pending` generation row in it, so the Debit never happens without the Generation it pays for.
- Purchases: `grant`.
- Failures: `refund`. A failed or abandoned Generation is refunded inside the transaction that moves its row from `pending` to `failed` (`refund({ ..., within: tx })`), so the Refund happens exactly once whichever path gets there first.

Each runs in a database transaction: `grant` opens its own, `refund` opens its own or a savepoint in the caller's, and `debit` uses the caller's. Every balance change goes through them; do not bypass them.

## `grant()` ON CONFLICT requires the partial-index `WHERE`

The `transactions.stripePaymentId` unique index is partial (`WHERE ... is not null`). Postgres' arbiter inference can't match a partial index without an explicit `where:` on `onConflictDoNothing`. Removing the `where:` re-introduces a 100%-fail bug on every Stripe webhook.

`stripePaymentId` holds the Checkout Session id, so a replayed session grants nothing.

## Rebuilding balances

`pnpm db:reconcile` replays Stripe purchases through `grant()` into a fresh database. It restores purchased credits, not remaining ones, and is a dry run until `--apply`.

- Phase 1 reads Clerk and creates `users` rows (id and email) with 0 credits. Phase 2 reads Stripe and replays each Checkout Session through the same `grant()` the webhook uses, keyed on the Session id. The Stripe email only creates a missing User row; it never changes an existing User's email.
- It goes through `grant()` and not raw inserts because `grant()` is idempotent on `transactions.stripe_payment_id` (the partial unique index): the script is safe to repeat, and a later duplicate webhook for the same Session does nothing. It sends no email, so customers are not re-mailed about old purchases.
- Warning: it restores PURCHASED credits, not REMAINING credits. Credits users had already spent lived only in the lost database, so with no adjustment every customer gets their full lifetime purchase back. That is deliberate: over-crediting a few paying customers costs less than under-crediting them. Use `--since` to limit the window.
- It needs `.env.local` with the NEW `DATABASE_URL` plus the existing Stripe and Clerk keys.
- Usage: `pnpm db:reconcile` (dry run, writes nothing), `pnpm db:reconcile -- --since=2026-01-01` (only purchases since that date), `pnpm db:reconcile -- --apply` (writes).
