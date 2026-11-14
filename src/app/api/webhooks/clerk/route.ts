import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { applyClerkEvent } from "@/lib/identity/user-sync";
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
  const userId = "id" in evt.data ? evt.data.id : undefined;

  try {
    const outcome = await applyClerkEvent(evt);
    switch (outcome.kind) {
      case "created":
        scoped.info({ userId }, "user inserted");
        if (outcome.welcome.sent) {
          scoped.info({ userId, emailId: outcome.welcome.emailId }, "welcome email sent");
        } else if (outcome.welcome.thrown) {
          scoped.error({ err: outcome.welcome.err }, "clerk webhook handler failed");
          return new Response("Handler error", { status: 500 });
        } else {
          scoped.error({ err: outcome.welcome.err, userId }, "welcome email failed");
        }
        break;
      case "already_exists":
        scoped.debug({ userId }, "user already exists — no welcome email");
        break;
      case "upserted":
        scoped.info({ userId }, "user upserted from update");
        break;
      case "anonymized":
        scoped.info({ userId }, "user anonymized after deletion");
        break;
      case "no_row":
        scoped.warn({ userId }, "user.deleted but no row matched");
        break;
      case "skipped":
        if (outcome.reason === "no_email" && evt.type === "user.created") {
          scoped.warn({ userId }, "user.created without email — skipping");
        } else if (outcome.reason === "no_id") {
          scoped.warn("user.deleted without id — skipping");
        } else if (outcome.reason === "not_deleted") {
          scoped.debug({ userId }, "user.deleted with deleted=false — skipping");
        }
        break;
    }
  } catch (err) {
    scoped.error({ err }, "clerk webhook handler failed");
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
