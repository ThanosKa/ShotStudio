import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const getUserCredits = cache(async (userId: string): Promise<number> => {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { credits: true },
  });
  return row?.credits ?? 0;
});

/**
 * Just-in-time user sync — Clerk's recommended pattern over webhooks.
 * Idempotent: safe to call on every authenticated page load and from server
 * routes before any credit operation, to close the Clerk-vs-Stripe webhook race.
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
