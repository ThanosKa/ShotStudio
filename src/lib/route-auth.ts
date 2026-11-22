import { auth } from "@clerk/nextjs/server";
import type { Logger } from "pino";
import { syncSignedInUser } from "@/lib/identity/user-sync";
import { jsonError } from "@/lib/http";
import { logger } from "@/lib/logger";
import { rateLimitHeaders, type LimitResult } from "@/lib/ratelimit";

type Limiter = { limit: (key: string) => Promise<LimitResult> };

export type AuthenticatedContext = {
  userId: string;
  email: string | null;
  log: Logger;
};

/**
 * Shared prelude for authenticated user-facing routes: Clerk auth → rate-limit
 * → JIT user sync. Hands the handler a User row that's guaranteed to exist
 * (when an email is available), so downstream credit operations can't race
 * against a missing `users` row.
 */
export async function withAuthenticatedUser({
  action,
  rateLimit,
  handler,
}: {
  action: string;
  rateLimit: Limiter;
  handler: (ctx: AuthenticatedContext) => Promise<Response>;
}): Promise<Response> {
  const requestId = crypto.randomUUID();
  const log = logger.child({ action, requestId });

  const { userId } = await auth();
  if (!userId) return jsonError({ status: 401, error: "Unauthorized" });

  const scoped = log.child({ userId });

  const rl = await rateLimit.limit(userId);
  if (!rl.success) {
    scoped.warn("rate limit hit");
    return jsonError({
      status: 429,
      error: "Too many requests — please wait a moment.",
      init: {
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000))),
        },
      },
    });
  }

  const email = await syncSignedInUser(userId);

  return handler({ userId, email, log: scoped });
}
