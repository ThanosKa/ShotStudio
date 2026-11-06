# Webhooks and transactional email

Routes: `src/app/api/webhooks/stripe/route.ts` and `src/app/api/webhooks/clerk/route.ts`.

## Idempotency

Preserve all of these on any change:

- Stripe events are deduped through Upstash Redis: `stripe:event:<id>` is claimed with `nx` and a 24h TTL, and a duplicate returns 200.
- Resend sends use idempotency keys: `welcome-email/<userId>` and `credits-purchased/<stripeEventId>`.
- `grant()` is a second layer, keyed on the Checkout Session id (see `.claude/docs/credits.md`).
- `redis` is `null` when Upstash is unset (`src/lib/redis.ts` throws in production), so keep the `if (redis)` guards.

## Error handling

- Wrap handler bodies in try/catch and return 500 on unexpected failure so the upstream (Stripe/Clerk) retries.
- For Stripe, on handler error also `redis.del(idemKey)` to release the idempotency claim. The `user_not_ready` outcome does the same.
- Failures a retry cannot fix (`invalid_metadata`, `unknown_pack`) log an error and return 200.

## Clerk events

- `user.created` sends the welcome email only when the insert created the row.
- `user.updated` upserts through `ensureUser`, because it can arrive before `user.created`.
- `user.deleted` anonymizes the row instead of deleting it: `transactions.user_id` is `ON DELETE RESTRICT` to preserve financial records.
