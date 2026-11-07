# Database

## Migrations

- Schema lives in `src/lib/db/schema.ts`. After changing it, run `pnpm db:generate` and commit the SQL in `drizzle/`: tests build their database from those files, so they will not see a schema change without a migration.
- DB scripts load env from `.env.local` through `dotenv-cli`. `db:generate` only writes files; `CLAUDE.md` lists the ones to ask about first.
- `DATABASE_URL` is the transaction pooler used at runtime under Node (hence `prepare: false` in `src/lib/db/index.ts`). `DATABASE_URL_MIGRATIONS` is the session pooler used by drizzle-kit.

## Connections

- A Worker cannot reuse a socket across requests. `worker/index.ts` wraps each request in `runWithRequestDb`, so `db` resolves to that request's own client, opened on first use and closed when the response body ends. Under Node (`next dev`, `next start`) `db` uses one shared client.
- `db` used outside a request throws on a Worker. Do database work before the response ends; there is no client for it afterwards.
- A Worker reaches the database only through the `HYPERDRIVE` binding in `cloudflare.config.ts`. Hyperdrive opens TLS to Supabase's direct database address (Cloudflare's advice, and it skips the pooler's unencrypted hop to Postgres), verified (`verify-full`) against Supabase's root CA, with caching off so Credits are never read stale. `resolveConnectionString` has no fallback to `DATABASE_URL`, because postgres.js sends those URLs in the clear.
- `origin_connection_limit` is 5 while the live site shares the database. Raise it at cutover. If the database password changes, update it in Hyperdrive too.

## Tests

`vitest.setup.ts` mocks `@/lib/db`, so anything importing it gets a fresh PGlite instance per test with all `drizzle/*.sql` migrations applied. It also mocks `@/lib/openrouter` to return a 1×1 PNG; override it with `vi.mocked(generateImage)` to simulate failures.
