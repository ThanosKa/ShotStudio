# Database

## Migrations

- Schema lives in `src/lib/db/schema.ts`. After changing it, run `pnpm db:generate` and commit the SQL in `drizzle/`: tests build their database from those files, so they will not see a schema change without a migration.
- DB scripts load env from `.env.local` through `dotenv-cli`. `db:generate` only writes files; `CLAUDE.md` lists the ones to ask about first.
- `DATABASE_URL` is the transaction pooler used at runtime under Node (hence `prepare: false` in `src/lib/db/index.ts`). `DATABASE_URL_MIGRATIONS` is the session pooler used by drizzle-kit.

## Connections

- A Worker cannot reuse a socket across requests. `worker/index.ts` wraps each request in `runWithRequestDb`, so `db` resolves to that request's own client, opened on first use and closed when the response body ends. Under Node (`next dev`, `next start`) `db` uses one shared client.
- `db` used outside a request throws on a Worker, and so does `db` used in a request after its client closed. Work that must outlive the response (the generation run) goes through `keepRequestAliveUntil(promise)`, which hands it to `waitUntil` and keeps the client open until it settles. The Cron Trigger gets its own client through `runWithJobDb`.
- A Worker reaches the database only through the `HYPERDRIVE` binding in `cloudflare.config.ts`. Hyperdrive opens TLS to Supabase's direct database address (Cloudflare's advice, and it skips the pooler's unencrypted hop to Postgres), verified (`verify-full`) against Supabase's root CA, with caching off so Credits are never read stale. `resolveConnectionString` has no fallback to `DATABASE_URL`, because postgres.js sends those URLs in the clear.
- `origin_connection_limit` is 20 (raised from 5 at cutover, 2026-11-07). The database allows 60 connections, 3 kept for the admin, so 57: about 15 for Supabase's own services, up to about 15 for the pooler Vercel still uses, and 20 for Hyperdrive, 50 in the worst case. That sum holds only while Vercel shares the database. Way back: `cf hyperdrive update d903c21644534b03b8e0c8d5010545ba --origin-connection-limit 5`. If the database password changes, update it in Hyperdrive too.

## Tests

`vitest.setup.ts` mocks `@/lib/db`, so anything importing it gets a fresh PGlite instance per test with all `drizzle/*.sql` migrations applied. It also mocks `@/lib/openrouter` to return a 1×1 PNG; override it with `vi.mocked(generateImage)` to simulate failures.
