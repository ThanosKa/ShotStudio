# Database

## Migrations

- Schema lives in `src/lib/db/schema.ts`. After changing it, run `pnpm db:generate` and commit the SQL in `drizzle/`: tests build their database from those files, so they will not see a schema change without a migration.
- DB scripts load env from `.env.local` through `dotenv-cli`. `db:generate` only writes files; `CLAUDE.md` lists the ones to ask about first.
- `DATABASE_URL` is the transaction pooler used at runtime (hence `prepare: false` in `src/lib/db/index.ts`). `DATABASE_URL_MIGRATIONS` is the session pooler used by drizzle-kit.

## Tests

`vitest.setup.ts` mocks `@/lib/db`, so anything importing it gets a fresh PGlite instance per test with all `drizzle/*.sql` migrations applied. It also mocks `@/lib/openrouter` to return a 1×1 PNG; override it with `vi.mocked(generateImage)` to simulate failures.
