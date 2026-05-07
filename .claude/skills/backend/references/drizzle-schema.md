# Drizzle Schema & Migrations

## Table Definition Pattern

Always use the 3-argument form with explicit snake_case column strings:

```typescript
export const transfers = pgTable('transfers', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
  status: transferStatusEnum('status').notNull().default('pending'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  notes: text('notes'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('transfers_org_id_idx').on(table.organizationId),
  index('transfers_status_idx').on(table.status),
]);
```

Key conventions:
- Primary key: `serial('id').primaryKey()` — always integer serial, never UUID
- Money/decimal: `decimal(col, { precision: 10, scale: 2 })` — never `float`/`real`
- Soft-delete: nullable `deletedAt` timestamp, no default
- Timestamps: `createdAt` and `updatedAt` with `.notNull().defaultNow()`
- Index naming: `tablename_col_idx`

## Enums

Define before tables that use them:

```typescript
export const transferStatusEnum = pgEnum('transfer_status', ['pending', 'assigned', 'cancelled']);
```

Use inline: `transferStatusEnum('status').notNull().default('pending')`

## Foreign Keys

Specify `onDelete` only when non-default behavior needed:

```typescript
.references(() => hotels.id, { onDelete: 'set null' })    // nullable FK
.references(() => drivers.id, { onDelete: 'cascade' })    // cascade delete
```

## Multi-Column Unique Index

```typescript
uniqueIndex('drivers_phone_org_idx').on(table.phone, table.organizationId)
```

## Relations

Define separately from tables. Use `relationName` when multiple relations point to the same table:

```typescript
export const transfersRelations = relations(transfers, ({ one }) => ({
  organization: one(organizations, {
    fields: [transfers.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [transfers.createdById],
    references: [users.id],
    relationName: 'createdByUser',
  }),
  cancelledBy: one(users, {
    fields: [transfers.cancelledById],
    references: [users.id],
    relationName: 'cancelledByUser',
  }),
}));
```

`many()` side has no `fields`/`references` — those only appear on the `one()` side.

## Type Exports

Every table gets two inferred types:

```typescript
export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;
```

Naming: `TableName` / `NewTableName`. All re-exported from `@repo/database`.

## Connection Config

`postgres-js` driver with Supabase pooler settings:

- `prepare: false` — required for Supabase transaction pooler
- `max: 10`, `idle_timeout: 20`
- Schema passed to `drizzle(client, { schema })` to enable `db.query.*` relational API
- Module-level instantiation (Node.js module caching = singleton)

## Migration Workflow

1. Edit `packages/database/src/schema.ts`
2. Export new types (`$inferSelect` / `$inferInsert`)
3. `pnpm db:generate` — Drizzle Kit diffs schema, writes SQL to `migrations/`
4. **Review the generated SQL** before applying
5. `pnpm db:migrate` — applies pending migrations

### Safe Changes

- Add new column with default or nullable — always safe
- Add new table — always safe
- Add index — safe (may lock briefly on large tables)

### Breaking Changes — Multi-Step Migration

Never make a breaking change in one step. Instead:

1. Add new nullable column
2. Backfill data (separate script in `db.transaction()`)
3. Make it `NOT NULL`
4. Remove old column
