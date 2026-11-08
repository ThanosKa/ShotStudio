# Coding Standards

Rules for server code that lint does not enforce. Writing code: every rule touching the files you change holds before you finish. Reviewing: check the diff against each rule in turn.

## Logging

- Log on the server through `@/lib/logger` (pino), never `console.*`. Client error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`) and CLIs in `scripts/` keep `console`. So does the logger's own Workers destination (`src/lib/logger/console-line.ts`), which writes each pino line with the console method matching its level, because that is how logs reach Workers Logs.
- First argument is a structured context object, second is a fixed message string: `log.warn({ userId }, "user not ready")`. Values go in the context, never interpolated into the message.
- Put errors under the `err` key: `log.error({ err }, "checkout failed")`.
- At the top of any handler or action, create a child logger (`logger.child({ action, ...ids })`) and reuse it.

## API routes

- Wrap authenticated routes in `withAuthenticatedUser` (`src/lib/route-auth.ts`), which runs Clerk auth, the rate limit and `ensureUser`, and add the path to `isProtectedRoute` in `src/proxy.ts`.
- Return errors with `jsonError(status, message)` (`src/lib/http.ts`). The client shows that message to the user as is, so write it as user-facing copy.
- Domain functions return a `{ kind: ... }` outcome union (`GenerationOutcome`, `CheckoutFulfillmentOutcome`); the route switches on `kind` and maps each case to a status and a log line.
- Declare `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"` on route handlers.
