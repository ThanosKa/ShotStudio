import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const log = logger.child({ action: "clerk_webhook" });

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
        await db.update(users).set({ email }).where(eq(users.id, id));
        scoped.info({ userId: id }, "user email updated");
      }
    }
  } catch (err) {
    scoped.error({ err }, "clerk webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
