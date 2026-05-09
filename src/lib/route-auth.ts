import { auth, currentUser } from "@clerk/nextjs/server";
import type { Logger } from "pino";
import { ensureUser } from "@/lib/db/queries";
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
export async function withAuthenticatedUser(
  opts: { action: string; rateLimit: Limiter },
  handler: (ctx: AuthenticatedContext) => Promise<Response>,
): Promise<Response> {
  const requestId = crypto.randomUUID();
  const log = logger.child({ action: opts.action, requestId });

  const { userId } = await auth();
  if (!userId) return jsonError(401, "Unauthorized");

  const scoped = log.child({ userId });

  const rl = await opts.rateLimit.limit(userId);
  if (!rl.success) {
    scoped.warn("rate limit hit");
    return jsonError(429, "Too many requests — please wait a moment.", {
      headers: {
        ...rateLimitHeaders(rl),
        "Retry-After": String(Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000))),
      },
    });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  if (email) await ensureUser(userId, email);

  return handler({ userId, email, log: scoped });
}
