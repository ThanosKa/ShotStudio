import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { pickUserEmail } from "@/lib/identity/user-sync";

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

/**
 * Inserts the User row with 0 Credits, or does nothing: it never updates an
 * existing row, and an email that already belongs to another User creates
 * nothing instead of throwing. For an email that is not the User Email's
 * source (the Stripe payment email); `ensureUser` overwrites the email instead.
 */
export async function createUserIfAbsent(userId: string, email: string) {
  await db
    .insert(users)
    .values({ id: userId, email, credits: 0 })
    .onConflictDoNothing();
}

export async function getEmailAndEnsureUser(
  userId: string,
): Promise<string | null> {
  const user = await currentUser();
  const email = pickUserEmail({
    addresses: user?.emailAddresses.map((a) => ({ id: a.id, email: a.emailAddress })) ?? [],
    primaryId: user?.primaryEmailAddressId,
  });
  if (email) await ensureUser(userId, email);
  return email;
}
