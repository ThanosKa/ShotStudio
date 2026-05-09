import { currentUser } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/db/queries";

export async function getEmailAndEnsureUser(
  userId: string,
): Promise<string | null> {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  if (email) await ensureUser(userId, email);
  return email;
}
