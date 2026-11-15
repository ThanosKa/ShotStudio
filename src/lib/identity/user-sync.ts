import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/db/queries";
import { users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/welcome";

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

    const inserted = await db
      .insert(users)
      .values({ id, email, credits: 0 })
      .onConflictDoNothing({ target: users.id })
      .returning({ id: users.id });
    if (inserted.length === 0) return { kind: "already_exists" };

    try {
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
    await ensureUser(id, email);
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
    const result = await db
      .update(users)
      .set({
        email: `deleted+${id}@anonymized.local`,
        stripeCustomerId: sql`null`,
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result.length > 0 ? { kind: "anonymized" } : { kind: "no_row" };
  }

  return { kind: "skipped", reason: "unhandled_type" };
}
