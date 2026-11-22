# Coding Standards

Rules for all code that lint does not enforce. Lint enforces `any`, type assertions (`as const` aside), non-null `!`, `console`, exhaustive `switch`, positional parameters and comments: resolve each lint error in the code itself. Writing code: every rule touching the files you change holds before you finish. Reviewing: check the diff against each rule in turn.

## Logging

- Log on the server through `@/lib/logger` (pino), never `console.*`. Client error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`) and CLIs in `scripts/` keep `console`. So does the logger's own Workers destination (`src/lib/logger/console-line.ts`), which writes each pino line with the console method matching its level, because that is how logs reach Workers Logs.
- First argument is a structured context object, second is a fixed message string: `log.warn({ userId }, "user not ready")`. Values go in the context, never interpolated into the message.
- Put errors under the `err` key: `log.error({ err }, "checkout failed")`.
- At the top of any handler or action, create a child logger (`logger.child({ action, ...ids })`) and reuse it.

## TypeScript

- External data (requests, storage, third-party responses) enters as `unknown`, is parsed once with Zod into a named domain type, and is trusted from there on. Hand-write a type guard only where no schema fits.
- A type guard, named `isX` or `hasX`, checks every property its return type claims.
- Narrow in this order: discriminant `switch`, then `in`, then `typeof` or `instanceof`, then a type guard.
- Model variants as a union on one literal discriminant field, so each state carries only its own fields: `{ kind: "loading" } | { kind: "success"; data: User } | { kind: "error"; error: string }`.
- Shape the type so the illegal value cannot be built: `[T, ...T[]]` for a non-empty list, `start` plus `duration` for a range. Keep `T[]` while every operation on it stays total; strengthen it only where the loose type would force `!`, a cast, or a "should never happen" throw.
- Brand primitives that must stay apart, such as IDs: `string & { readonly __brand: "UserId" }`. A brand comes from a verifying type guard (`input is UserId`).
- Build a new type from existing ones (`Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof`, `z.infer`) before declaring a new one.
- Check a literal against a type with `satisfies`, which keeps its literal types.

## Functions

- A function you write with more than one parameter takes one object argument, so each call site names its values. Inline callbacks, framework signatures (route handlers, page and layout props) and hot paths (per-frame render, parsers) keep positional parameters.

## Tests

- Run the real thing: the framework's test primitives, a real or in-memory implementation, a running build for UI. Mock only what cannot run locally.

## API routes

- Wrap authenticated routes in `withAuthenticatedUser` (`src/lib/route-auth.ts`), which runs Clerk auth, the rate limit and the JIT user sync (`syncSignedInUser`, `src/lib/identity/user-sync.ts`), and add the path to `isProtectedRoute` in `src/proxy.ts`.
- Return errors with `jsonError({ status, error })` (`src/lib/http.ts`). The client shows that message to the user as is, so write it as user-facing copy.
- Domain functions return a `{ kind: ... }` outcome union (`GenerationOutcome`, `CheckoutFulfillmentOutcome`); the route switches on `kind` and maps each case to a status and a log line.
- Declare `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"` on route handlers. Next (the Vercel fallback) reads both; on the Worker vinext only checks `runtime` for `"edge"`, so `"nodejs"` changes nothing there.
