import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

export async function getUserCredits(userId: string): Promise<number> {
  const [row] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.credits ?? 0;
}

/**
 * Just-in-time user sync — Clerk's recommended pattern over webhooks.
 * Idempotent: safe to call on every authenticated page load.
 * https://clerk.com/blog/just-in-time-api-requests-are-replacing-webhooks
 */
export async function ensureUser(userId: string, email: string) {
  await db
    .insert(users)
    .values({ id: userId, email, credits: 0 })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: sql`excluded.email` },
    });
}
