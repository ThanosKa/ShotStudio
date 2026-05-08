import { createClerkClient } from "@clerk/nextjs/server";

const EMAIL = "test@test.com";
const PASSWORD = "12345678";

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error("CLERK_SECRET_KEY not set");

  const clerk = createClerkClient({ secretKey });

  const existing = await clerk.users.getUserList({ emailAddress: [EMAIL] });
  if (existing.data.length > 0) {
    console.log("User already exists:", existing.data[0].id, EMAIL);
    process.exit(0);
  }

  const user = await clerk.users.createUser({
    emailAddress: [EMAIL],
    password: PASSWORD,
    skipPasswordChecks: true,
    skipPasswordRequirement: false,
  });

  console.log("Created user:", user.id, EMAIL, "/ password:", PASSWORD);
  process.exit(0);
}

main().catch((err) => {
  console.error("Create test user failed:", err);
  process.exit(1);
});
