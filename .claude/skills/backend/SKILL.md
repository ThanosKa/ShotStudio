---
name: backend
description: >
  Backend development patterns for server-side code: Drizzle ORM queries, schema design, migrations,
  server actions, and data access patterns. Use when writing or reviewing database queries, creating
  server actions or mutations, defining schema tables, writing migrations, or working with the
  data access layer. Triggers on: "use server", action.ts files, db.query, db.select, db.insert,
  db.update, db.delete, db.transaction, schema.ts, Drizzle ORM, pgTable, pgEnum, relations(),
  validatedActionWithUser, withOrganization, @repo/database, lib/db/queries.
---

# Backend Development Patterns

## When to Read Which Reference

| Task | Read |
|---|---|
| Creating a server action or mutation | [references/server-actions.md](references/server-actions.md) |
| Writing a database query (select, join, aggregate, paginate) | [references/drizzle-queries.md](references/drizzle-queries.md) |
| Defining a table, enum, relation, index, or migration | [references/drizzle-schema.md](references/drizzle-schema.md) |

## Import Layers

Two distinct import sources — never mix their purposes:

| What | Import from |
|---|---|
| Tables, types, `db`, drizzle operators (`eq`, `and`, `sql`, etc.) | `@repo/database` |
| Auth-aware queries (`getUser`, `getOrganizationForUser`) | `@/lib/db/queries` |
| Domain queries (transfers, hotels, drivers, notifications) | `@/lib/db/queries/{domain}` |

## Quick Rules

- Always use `lib/logger` — never `console.log`
- Always use `getTranslations()` for user-facing error/success messages
- Wrap query functions in React `cache()` for render deduplication
- Use `validatedActionWithUser` for authenticated mutations — see server-actions reference
- Prefer `db.query.table.findMany/findFirst` for simple reads with relations
- Use `db.select().from().where()` for joins, aggregations, or column projection
- Wrap related writes in `db.transaction()`
- For raw Postgres optimization (indexes, query plans, RLS): use the `supabase-postgres-best-practices` skill
