# 0001: Request lifetime and database client lifetime share one scope

Status: accepted
Date: 2026-11-15

## Context

On the Cloudflare Worker a database client cannot be reused across requests, so `src/lib/db/index.ts` opens one client per request and closes it when the request is finished. "Finished" is not only the end of the response: streamed pages can still query after the Response is returned, and work handed to `waitUntil` (the Worker's way of finishing work after the response is sent) can still query too, such as the refund of a failed Generation or the rate limiter's analytics write.

So the moment the client closes is exactly the moment the work keeping the request alive ends. `keepRequestAliveUntil` records that work in the request's scope, and the client closes only once every recorded promise has settled. The rate limiter (`src/lib/ratelimit.ts`) and `runGeneration` (`src/lib/generation/lifecycle.ts`) call it, which is why the rate limiter imports the database module.

## Decision

`keepRequestAliveUntil` stays in the database module, next to the other three functions of its interface: `db`, `runWithRequestDb` and `runWithJobDb`. The interface stays exactly as it is. Request lifetime and database client lifetime are one scope, owned by one module, with its own test file (`src/lib/db/request-db.test.ts`).

## Rejected alternatives

- **Split the request lifetime into its own module.** It would need a new interface between the two modules, in the most sensitive module of the app. A wrong order closes the client early: the Refund of a failed Generation then throws ("db used after the request's database client closed"), the Credit stays debited, and the user waits for the 10-minute abandoned-generation sweep. The only gain would be that the rate limiter no longer imports the database module.
- **A pure re-export from a new request-scope file.** It adds a file and no behaviour: a pass-through that fails the deletion test (delete it and the complexity does not move).

## Consequences

- The rate limiter keeps importing `@/lib/db`. That coupling is intended, not a leak to fix.
- Under Node there is no request scope and `keepRequestAliveUntil` does nothing, because the process keeps running.
- Any change to how the client closes is made in `src/lib/db/index.ts` and checked by `request-db.test.ts`.
