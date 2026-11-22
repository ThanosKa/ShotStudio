import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createUserIfAbsent, ensureUser } from "@/lib/identity/user-sync";

async function rowOf(userId: string) {
  const [u] = await db
    .select({ email: users.email, credits: users.credits })
    .from(users)
    .where(eq(users.id, userId));
  return u;
}

describe("createUserIfAbsent", () => {
  test("creates the row with the email and 0 Credits when none exists", async () => {
    await createUserIfAbsent({ userId: "u_new", email: "new@test" });

    expect(await rowOf("u_new")).toEqual({ email: "new@test", credits: 0 });
  });

  test("never changes an existing row", async () => {
    await ensureUser({ userId: "u_old", email: "old@test" });

    await createUserIfAbsent({ userId: "u_old", email: "other@test" });

    expect(await rowOf("u_old")).toEqual({ email: "old@test", credits: 0 });
  });

  test("creates nothing and does not throw when the email belongs to another User", async () => {
    await ensureUser({ userId: "u_owner", email: "taken@test" });

    await expect(createUserIfAbsent({ userId: "u_new", email: "taken@test" })).resolves.toBeUndefined();

    expect(await rowOf("u_new")).toBeUndefined();
    expect(await rowOf("u_owner")).toEqual({ email: "taken@test", credits: 0 });
  });
});
