# Webhooks and transactional email

Routes: `src/app/api/webhooks/stripe/route.ts` and `src/app/api/webhooks/clerk/route.ts`.

## Transactional email on the Worker

Route handlers on the Worker run under the `react-server` condition, where `react-dom/server` is a stub that throws, so react-email's `render` fails there. `src/lib/emails/templates.ts` builds the welcome and purchase emails as plain strings instead. `templates.test.ts` renders `emails/*.tsx` with react-email under Node and requires the same HTML and text, so change both together; `react-server.test.ts` sends both emails under the `react-server` condition with Resend's HTTP call stubbed.

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

## Stripe email

- Fulfilment never changes the email of an existing User. With no User row yet, it creates one with the Stripe email through `createUserIfAbsent`, which never updates a row and creates nothing when another User already has that email.
- No row and no Stripe email, or no row and a Stripe email that belongs to another User: `user_not_ready`, so Stripe retries until the Clerk webhook or JIT User Sync has created the row. Log the case and the User id, never the email.
- The purchase email still goes to the Stripe email.

## Clerk events

The route only verifies the event and maps the outcome to a log line and a status; `applyClerkEvent` (`src/lib/identity/user-sync.ts`) does the database and email work. It throws only on database errors; a welcome email that rejects comes back in the outcome (`thrown`) and the route answers 500.

- `user.created` sends the welcome email only when the insert created the row.
- `user.updated` upserts through `ensureUser`, because it can arrive before `user.created`.
- `user.deleted` anonymizes the row instead of deleting it: `transactions.user_id` is `ON DELETE RESTRICT` to preserve financial records.

## A reused email

An email belongs to the live Clerk account that holds it now. When User Sync writes a User's email (`ensureUser`, so JIT User Sync and `user.updated`, and the `user.created` insert) and another User row holds that email, it asks Clerk for that row's account:

- Not found (Clerk answers 404 for a deleted user): the row gets User Anonymization, as on `user.deleted`; its Credits, Transactions and Generations stay on it.
- Found, but no longer listing the address: the row's email is refreshed to that account's User Email (`pickUserEmail`).
- Found and still owning the address, found with no email at all, or the lookup fails: nothing changes and the write's error stands, so the request answers 500 and Clerk retries.

Each release logs one line, "email released from another user", with both User ids and the reason, never the email. Credits never move between Users. `createUserIfAbsent` (checkout fulfilment) does not release anything: a Stripe email held by another User still answers `user_not_ready`.
