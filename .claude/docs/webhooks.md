# Webhooks and transactional email

Routes: `src/app/api/webhooks/stripe/route.ts` and `src/app/api/webhooks/clerk/route.ts`.

## Idempotency

Preserve all of these on any change:

- Stripe events are deduped through Upstash Redis in two steps. `stripe:event:<id>` is claimed with `nx` as `processing` for 120 s, and set to `done` for 24 h only after the handler answers 2xx. A delivery that finds `done` returns 200; one that finds `processing` returns 409 so Stripe retries later. A Worker stopped mid-fulfilment runs no catch block, so the short claim is what frees the event for Stripe's retry: never write the 24 h mark before the work is done.
- Resend sends use idempotency keys: `welcome-email/<userId>` and `credits-purchased/<stripeEventId>`.
- `grant()` is a second layer, keyed on the Checkout Session id (see `.claude/docs/credits.md`).
- `redis` is `null` when Upstash is unset (`src/lib/redis.ts` throws in production), so keep the `if (redis)` guards.

## Error handling

- Wrap handler bodies in try/catch and return 500 on unexpected failure so the upstream (Stripe/Clerk) retries.
- For Stripe, on handler error or any non-2xx answer (such as `user_not_ready`) the route deletes the claim so Stripe's retry is processed. If writing `done` fails after success, the route still answers 200; the claim expires and `grant()` makes a retry harmless.
- Failures a retry cannot fix (`invalid_metadata`, `unknown_pack`) log an error and return 200.

## Clerk events

- `user.created` sends the welcome email only when the insert created the row.
- `user.updated` upserts through `ensureUser`, because it can arrive before `user.created`.
- `user.deleted` anonymizes the row instead of deleting it: `transactions.user_id` is `ON DELETE RESTRICT` to preserve financial records.
