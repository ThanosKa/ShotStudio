import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

export type ClerkEventOutcome =
  | { kind: "created"; welcome: { sent: true; emailId?: string } | { sent: false; err: unknown; thrown?: true } }
  | { kind: "already_exists" }
  | { kind: "upserted" }
  | { kind: "anonymized" }
  | { kind: "no_row" }
  | { kind: "skipped"; reason: "no_email" | "no_id" | "not_deleted" | "unhandled_type" };

/**
 * The User Email rule: the address whose id is the primary address id; else
 * the first address; null when there is none. Addresses are kept as they are.
 */
export function pickUserEmail(input: {
  addresses: readonly { id: string; email: string }[];
  primaryId?: string | null;
}): string | null {
  const { addresses, primaryId } = input;
  const primary = primaryId ? addresses.find((a) => a.id === primaryId) : undefined;
  return (primary ?? addresses[0])?.email ?? null;
}

/**
 * Just-in-time user sync — Clerk's recommended pattern over webhooks.
 * Idempotent: safe to call on every authenticated page load and from server
 * routes before any credit operation, to close the Clerk-vs-Stripe webhook race.
 * https://clerk.com/blog/just-in-time-api-requests-are-replacing-webhooks
 */
export async function ensureUser({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  await withEmailReleased({ userId, email, write: () =>
    db
      .insert(users)
      .values({ id: userId, email, credits: 0 })
      .onConflictDoUpdate({
        target: users.id,
        set: { email: sql`excluded.email` },
      }) });
}

/**
 * Runs a write of `email` onto `userId`'s row. If another User row holds that
 * email, asks Clerk about that row's account: a deleted (not found) account is
 * anonymized, and a live one that no longer lists the address gets its current
 * User Email; then the write runs again. Otherwise the write's error stands.
 */
async function withEmailReleased<T>({
  userId,
  email,
  write,
}: {
  userId: string;
  email: string;
  write: () => Promise<T>;
}): Promise<T> {
  try {
    return await write();
  } catch (err) {
    if (!isUniqueViolation(err) || !(await releaseEmail({ userId, email }))) throw err;
    return write();
  }
}

/** Postgres unique_violation, raised by the driver or wrapped by Drizzle. */
function isUniqueViolation(err: unknown): boolean {
  let e: unknown = err;
  for (let depth = 0; depth < 5 && typeof e === "object" && e !== null; depth++) {
    if ("code" in e && e.code === "23505") return true;
    e = "cause" in e ? e.cause : undefined;
  }
  return false;
}

/** Clerk's 404, which is how its Backend API answers for a deleted user. */
function isClerkNotFound(err: unknown): boolean {
  // The check Clerk's own `isClerkAPIResponseError` makes, without importing
  // `@clerk/nextjs/errors`, which pulls in client hooks.
  if (typeof err !== "object" || err === null) return false;
  const ctor: unknown = err.constructor;
  const kind = typeof ctor === "function" && "kind" in ctor ? ctor.kind : undefined;
  return kind === "ClerkAPIResponseError" && "status" in err && err.status === 404;
}

/** True when another User row held `email` and no longer does. */
async function releaseEmail({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<boolean> {
  const [holder] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, userId)));
  if (!holder) return false;
  const log = logger.child({ action: "release_email", userId, releasedFromUserId: holder.id });

  let account;
  try {
    account = await (await clerkClient()).users.getUser(holder.id);
  } catch (err) {
    if (!isClerkNotFound(err)) {
      // Nothing is released on a failed lookup; the caller fails and retries.
      log.warn({ err }, "email holder lookup failed");
      return false;
    }
    await anonymizeUser(holder.id);
    log.info({ reason: "clerk_user_not_found" }, "email released from another user");
    return true;
  }

  const addresses = account.emailAddresses.map((a) => ({ id: a.id, email: a.emailAddress }));
  if (addresses.some((a) => a.email.toLowerCase() === email.toLowerCase())) return false;
  const current = pickUserEmail({ addresses, primaryId: account.primaryEmailAddressId });
  // A live account with no email at all keeps the row: there is nothing to refresh it to.
  if (!current) return false;
  await db.update(users).set({ email: current }).where(eq(users.id, holder.id));
  log.info({ reason: "email_no_longer_on_clerk_user" }, "email released from another user");
  return true;
}

/**
 * User Anonymization: the row stays, because `transactions.user_id` is
 * ON DELETE RESTRICT; its email becomes a placeholder and its Stripe customer
 * id is cleared. Returns whether a row matched.
 */
async function anonymizeUser(id: string): Promise<boolean> {
  const result = await db
    .update(users)
    .set({
      email: `deleted+${id}@anonymized.local`,
      stripeCustomerId: sql`null`,
    })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return result.length > 0;
}

/**
 * Inserts the User row with 0 Credits, or does nothing: it never updates an
 * existing row, and an email that already belongs to another User creates
 * nothing instead of throwing. For an email that is not the User Email's
 * source (the Stripe payment email); `ensureUser` overwrites the email instead.
 */
export async function createUserIfAbsent({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  await db
    .insert(users)
    .values({ id: userId, email, credits: 0 })
    .onConflictDoNothing();
}

/** JIT User Sync for the signed-in user. Call AFTER the rate limit. */
export async function syncSignedInUser(userId: string): Promise<string | null> {
  const user = await currentUser();
  const email = pickUserEmail({
    addresses: user?.emailAddresses.map((a) => ({ id: a.id, email: a.emailAddress })) ?? [],
    primaryId: user?.primaryEmailAddressId,
  });
  if (email) await ensureUser({ userId, email });
  return email;
}

/**
 * Applies a verified Clerk event to the `users` table. Throws only on database
 * errors. A welcome email that rejects comes back in the outcome (`thrown`), so
 * the route can log the insert before answering 500.
 */
export async function applyClerkEvent(evt: WebhookEvent): Promise<ClerkEventOutcome> {
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, primary_email_address_id } = evt.data;
    const email = pickUserEmail({
      addresses: email_addresses.map((a) => ({ id: a.id, email: a.email_address })),
      primaryId: primary_email_address_id,
    });
    if (!email) return { kind: "skipped", reason: "no_email" };

    const inserted = await withEmailReleased({ userId: id, email, write: () =>
      db
        .insert(users)
        .values({ id, email, credits: 0 })
        .onConflictDoNothing({ target: users.id })
        .returning({ id: users.id }) });
    if (inserted.length === 0) return { kind: "already_exists" };

    try {
      // Loaded here, not at the top: the Resend client throws at import without
      // its API key, and every signed-in route imports this module.
      const { sendWelcomeEmail } = await import("@/lib/emails/welcome");
      const { data, error } = await sendWelcomeEmail({
        to: email,
        userId: id,
        firstName: first_name,
      });
      return {
        kind: "created",
        welcome: error ? { sent: false, err: error } : { sent: true, emailId: data?.id },
      };
    } catch (err) {
      // The row is already inserted; report the rejection so the route can log
      // the insert first and then answer 500, as it always has.
      return { kind: "created", welcome: { sent: false, err, thrown: true } };
    }
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id } = evt.data;
    const email = pickUserEmail({
      addresses: email_addresses.map((a) => ({ id: a.id, email: a.email_address })),
      primaryId: primary_email_address_id,
    });
    if (!email) return { kind: "skipped", reason: "no_email" };
    // Upsert: an "updated" event can arrive before "created", and the first
    // signed-in request (JIT User Sync) may not have run yet either.
    await ensureUser({ userId: id, email });
    return { kind: "upserted" };
  }

  if (evt.type === "user.deleted") {
    // Anonymize rather than DELETE: transactions.user_id has ON DELETE
    // RESTRICT to preserve financial records. Cascading generations are
    // removed automatically by the FK on generations.user_id. This pattern
    // is GDPR-compliant — PII is removed but the audit trail survives.
    const { id, deleted } = evt.data;
    if (!id) return { kind: "skipped", reason: "no_id" };
    if (deleted === false) return { kind: "skipped", reason: "not_deleted" };
    return (await anonymizeUser(id)) ? { kind: "anonymized" } : { kind: "no_row" };
  }

  return { kind: "skipped", reason: "unhandled_type" };
}
