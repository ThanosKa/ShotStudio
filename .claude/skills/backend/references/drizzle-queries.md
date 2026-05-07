# Drizzle Query Patterns

## Two Query Styles

### Relational API — simple reads with relations

```typescript
const result = await db.query.transfers.findFirst({
  where: and(eq(transfers.id, id), eq(transfers.organizationId, orgId)),
  with: {
    organization: true,
    assignedDriver: true,
    createdBy: { columns: { id: true, name: true, email: true } },
  },
});
```

### Chained Select — joins, aggregations, column projection

```typescript
const rows = await db
  .select({ transfers, organizations, drivers })
  .from(transfers)
  .innerJoin(organizations, eq(transfers.organizationId, organizations.id))
  .leftJoin(drivers, eq(transfers.assignedDriverId, drivers.id))
  .where(and(...conditions))
  .orderBy(...orderBy)
  .limit(pageSize)
  .offset((page - 1) * pageSize);
```

## Dynamic Conditions

Build conditions as an array, spread into `and()`:

```typescript
const conditions = [eq(transfers.organizationId, orgId)];
if (options.status) conditions.push(eq(transfers.status, options.status));
if (options.fromDate) conditions.push(gte(transfers.pickupDate, options.fromDate));
// ...
.where(and(...conditions))
```

For simple single-filter cases, ternary inside `and()`:

```typescript
where: and(
  eq(transfers.organizationId, orgId),
  hotelId ? eq(transfers.hotelId, hotelId) : undefined
)
```

## Column Aliasing for Self-Joins

When joining the same table multiple times, use `alias` from `@repo/database`:

```typescript
import { alias } from '@repo/database';

const createdByUser = alias(users, 'created_by_user');
const cancelledByUser = alias(users, 'cancelled_by_user');

db.select({ ..., createdBy: { id: createdByUser.id, name: createdByUser.name } })
  .from(transfers)
  .leftJoin(createdByUser, eq(transfers.createdById, createdByUser.id))
  .leftJoin(cancelledByUser, eq(transfers.cancelledById, cancelledByUser.id))
```

## Aggregations

Use `sql<number>` template with explicit `::int` cast:

```typescript
const result = await db
  .select({
    totalCount: sql<number>`count(*)::int`,
    pendingCount: sql<number>`count(*) FILTER (WHERE ${transfers.status} = 'pending')::int`,
  })
  .from(transfers)
  .where(and(...conditions));
```

## Shared Row Mappers

Never inline shape mapping. Extract into helper files:

```typescript
// transfer-helpers.ts
export const STAFF_TRANSFER_COLUMNS = { /* column refs */ };
export function mapJoinedRowToTransfer(row: RawRow): TransferWithRelations { /* ... */ }
export function getSortOrder(sort: string, dir: string) { /* returns [asc/desc(col)] */ }
```

## Transactions

Wrap related writes in `db.transaction()`. The `tx` object has the same API as `db`:

```typescript
await db.transaction(async (tx) => {
  const [record] = await tx.insert(someTable).values({ ... }).returning();
  await tx.update(otherTable).set({ ... }).where(eq(otherTable.id, record.id));
});
```

## Cursor Pagination

Fetch N+1 to detect `hasMore`:

```typescript
const results = await db.query.items.findMany({
  where: and(...conditions, cursor ? lt(items.createdAt, cursor) : undefined),
  orderBy: [desc(items.createdAt)],
  limit: pageSize + 1,
});

const hasMore = results.length > pageSize;
const items = hasMore ? results.slice(0, -1) : results;
const nextCursor = hasMore ? items[items.length - 1].createdAt : null;
```

## Conflict Handling

```typescript
// Upsert
await db.insert(users).values({ ... }).onConflictDoUpdate({
  target: users.id,
  set: { email, updatedAt: new Date() },
});

// Skip duplicates
await db.insert(users).values({ ... }).onConflictDoNothing();
```

## Soft-Delete Guard

Most queries on `users`, `hotels`, `organizations` include:

```typescript
isNull(table.deletedAt)
```

## Query Function Structure

Wrap in React `cache()`, return explicit types, fail-safe on missing auth:

```typescript
export const getItems = cache(async (orgId: string): Promise<Item[]> => {
  const user = await getUser();
  if (!user) return [];

  return db.query.items.findMany({
    where: eq(items.organizationId, orgId),
    orderBy: [items.name],
  });
});
```
