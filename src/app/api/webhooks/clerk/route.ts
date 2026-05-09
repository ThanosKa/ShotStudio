import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ensureUser } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.child({ action: "clerk_webhook", requestId });

  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    log.error({ err }, "Clerk webhook verification failed");
    return new Response("Verification failed", { status: 400 });
  }

  const scoped = log.child({ eventType: evt.type });

  try {
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      if (!email) {
        scoped.warn({ userId: id }, "user.created without email — skipping");
        return new Response("OK", { status: 200 });
      }

      const inserted = await db
        .insert(users)
        .values({ id, email, credits: 0 })
        .onConflictDoNothing({ target: users.id })
        .returning({ id: users.id });

      if (inserted.length > 0) {
        scoped.info({ userId: id }, "user inserted");
        const { data, error } = await sendWelcomeEmail({
          to: email,
          userId: id,
          firstName: first_name,
        });
        if (error) {
          scoped.error({ err: error, userId: id }, "welcome email failed");
        } else {
          scoped.info({ userId: id, emailId: data?.id }, "welcome email sent");
        }
      } else {
        scoped.debug({ userId: id }, "user already exists — no welcome email");
      }
    } else if (evt.type === "user.updated") {
      const { id, email_addresses } = evt.data;
      const email = email_addresses[0]?.email_address;
      if (email) {
        // Upsert: an "updated" event can arrive before "created" if the
        // Stripe webhook (which calls ensureUser) hasn't yet run either.
        await ensureUser(id, email);
        scoped.info({ userId: id }, "user upserted from update");
      }
    } else if (evt.type === "user.deleted") {
      // Anonymize rather than DELETE: transactions.user_id has ON DELETE
      // RESTRICT to preserve financial records. Cascading generations are
      // removed automatically by the FK on generations.user_id. This pattern
      // is GDPR-compliant — PII is removed but the audit trail survives.
      const { id, deleted } = evt.data;
      if (!id) {
        scoped.warn("user.deleted without id — skipping");
        return new Response("OK", { status: 200 });
      }
      if (deleted === false) {
        scoped.debug({ userId: id }, "user.deleted with deleted=false — skipping");
        return new Response("OK", { status: 200 });
      }
      const anonymized = `deleted+${id}@anonymized.local`;
      const result = await db
        .update(users)
        .set({
          email: anonymized,
          stripeCustomerId: sql`null`,
        })
        .where(eq(users.id, id))
        .returning({ id: users.id });
      scoped.info(
        { userId: id, anonymized: result.length > 0 },
        "user anonymized after deletion",
      );
    }
  } catch (err) {
    scoped.error({ err }, "clerk webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
