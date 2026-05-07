# Server Actions

Prefer server actions over API routes for all mutations.

## Wrappers

Four wrappers in `@/lib/auth/middleware`:

### `validatedActionWithUser(schema, fn)` — Standard authenticated mutation

```typescript
fn(data: z.infer<S>, formData: FormData, user: User)
```

Checks Clerk session, loads `User` from DB, validates with Zod. Returns `ActionState`.
Use for all authenticated form actions.

### `validatedAction(schema, fn)` — Unauthenticated

```typescript
fn(data: z.infer<S>, formData: FormData)
```

Zod validation only, no auth. Use for public forms.

### `withOrganization(fn)` — Org context (redirects on failure)

```typescript
fn(formData: FormData, organization: OrganizationDataWithMembers)
```

Loads org via `getOrganizationForUser()`. **Redirects** on auth failure (throws Next.js redirect).

### `withOrganizationErrors(fn)` — Org context (returns errors)

Same as `withOrganization` but returns `ActionState` errors instead of redirecting.

## ActionState Type

```typescript
type ActionState = {
  error?: string;
  code?: 'UNAUTHORIZED' | 'USER_NOT_FOUND' | 'ORGANIZATION_NOT_FOUND' | 'VALIDATION_ERROR';
  success?: string;
  [key: string]: unknown; // additional payload fields
}
```

All wrappers return `(prevState, formData) => Promise<ActionState>` — compatible with `useActionState`.

## Guard Helpers

In `@/lib/auth/action-guards`:

- `assertOrgOwner(organizationId, userId, t, errorKeys?)` — loads org, checks ownership. Returns `{ organization, error: null }` or `{ organization: null, error: string }`.
- `assertOrgOwnerLean(organizationId, t, errorKeys?)` — same but uses two lean parallel queries.
- `mapInvitationError(errorCode, t)` — maps Clerk invitation error codes to i18n strings.

## Canonical Pattern

```typescript
'use server';

import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { db, someTable, eq } from '@repo/database';
import { getTranslations } from 'next-intl/server';
import { logger } from '@/lib/logger';

const mySchema = z.object({ /* ... */ });

export const myAction = validatedActionWithUser(
  mySchema,
  async (data, _formData, user) => {
    const t = await getTranslations('serverErrors');
    const log = logger.child({
      action: 'MY_ACTION',
      requestId: crypto.randomUUID(),
      userId: user.id,
    });

    // Authorization checks
    // Mutation
    // Return { success: t('...') } or { error: t('...') }
  }
);
```
