import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const getUserCredits = cache(async (userId: string): Promise<number> => {
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { credits: true },
  });
  return row?.credits ?? 0;
});
