import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClerkAPIResponseError } from "@clerk/nextjs/errors";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { generations, transactions, users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { withAuthenticatedUser } from "@/lib/route-auth";

const clerk = vi.hoisted(() => {
  const getUser = vi.fn();
  return {
    getUser,
    auth: vi.fn(),
    currentUser: vi.fn(),
    clerkClient: vi.fn(async () => ({ users: { getUser } })),
  };
});
vi.mock("@clerk/nextjs/server", () => ({
  auth: clerk.auth,
  currentUser: clerk.currentUser,
  clerkClient: clerk.clerkClient,
}));
vi.mock("@clerk/nextjs/webhooks", () => ({ verifyWebhook: vi.fn() }));
vi.mock("@/lib/emails/welcome", () => ({ sendWelcomeEmail: vi.fn() }));

const lines = vi.hoisted(() => [] as { level: string; ctx: unknown; msg: unknown }[]);
vi.mock("@/lib/logger", () => {
  const make = (bindings: object): Record<string, unknown> => {
    const record = (level: string) => (ctx: unknown, msg?: unknown) => {
      const [own, text] = typeof ctx === "string" ? [{}, ctx] : [ctx, msg];
      lines.push({ level, ctx: { ...bindings, ...(own as object) }, msg: text });
    };
    return {
      info: record("info"),
      warn: record("warn"),
      error: record("error"),
      debug: record("debug"),
      child: (more: object) => make({ ...bindings, ...more }),
    };
  };
  return { logger: make({}) };
});

const verify = vi.mocked(verifyWebhook);
const welcome = vi.mocked(sendWelcomeEmail);

const REUSED = "reused@example.com";
const allowed = { limit: async () => ({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60_000 }) };

const notFound = () =>
  new ClerkAPIResponseError("Not Found", {
    data: [{ code: "resource_not_found", message: "not found", long_message: "not found" }],
    status: 404,
  });

function clerkAccount(id: string, ...emails: string[]) {
  return {
    id,
    emailAddresses: emails.map((emailAddress, i) => ({ id: `idn_${i}`, emailAddress })),
    primaryEmailAddressId: emails.length > 0 ? "idn_0" : null,
  };
}

async function seedOldUser() {
  await db.insert(users).values({ id: "u_old", email: REUSED, credits: 4, stripeCustomerId: "cus_old" });
  await db.insert(transactions).values([
    { userId: "u_old", type: "purchase", amount: 5, stripePaymentId: "cs_old" },
    { userId: "u_old", type: "usage", amount: -1 },
  ]);
  await db.insert(generations).values({
    userId: "u_old",
    appName: "Old App",
    stylePreset: "friendly",
    category: "productivity",
    status: "complete",
  });
}

const rowOf = async (id: string) => (await db.select().from(users).where(eq(users.id, id)))[0];
const transactionsOf = (id: string) => db.select().from(transactions).where(eq(transactions.userId, id));
const generationsOf = (id: string) => db.select().from(generations).where(eq(generations.userId, id));

async function expectLedgerBalanced(id: string) {
  const row = await rowOf(id);
  const sum = (await transactionsOf(id)).reduce((n, t) => n + t.amount, 0);
  expect(sum).toBe(row.credits);
}

async function expectOldUserUntouched() {
  expect(await rowOf("u_old")).toMatchObject({ email: REUSED, credits: 4, stripeCustomerId: "cus_old" });
  expect(await transactionsOf("u_old")).toHaveLength(2);
  expect(await generationsOf("u_old")).toHaveLength(1);
}

async function expectOldUserAnonymized() {
  expect(await rowOf("u_old")).toMatchObject({
    email: "deleted+u_old@anonymized.local",
    stripeCustomerId: null,
    credits: 4,
  });
  expect(await transactionsOf("u_old")).toHaveLength(2);
  expect(await generationsOf("u_old")).toHaveLength(1);
  await expectLedgerBalanced("u_old");
}

async function expectNewUserFresh() {
  expect(await rowOf("u_new")).toMatchObject({ email: REUSED, credits: 0, stripeCustomerId: null });
  expect(await transactionsOf("u_new")).toEqual([]);
  expect(await generationsOf("u_new")).toEqual([]);
  await expectLedgerBalanced("u_new");
}

const releaseLines = () => lines.filter((l) => l.msg === "email released from another user");

async function signedInRequest() {
  clerk.auth.mockResolvedValue({ userId: "u_new" });
  clerk.currentUser.mockResolvedValue(clerkAccount("u_new", REUSED));
  try {
    return await withAuthenticatedUser({ action: "t", rateLimit: allowed, handler: async () => new Response("ok") });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function deliver(type: "user.created" | "user.updated") {
  verify.mockResolvedValueOnce({
    type,
    data: {
      id: "u_new",
      first_name: "Ada",
      email_addresses: [{ id: "idn_0", email_address: REUSED }],
      primary_email_address_id: "idn_0",
    },
  } as never);
  const { POST } = await import("@/app/api/webhooks/clerk/route");
  return POST(new NextRequest("https://example.test/api/webhooks/clerk", { method: "POST", body: "{}" }));
}

beforeEach(async () => {
  lines.length = 0;
  clerk.auth.mockReset();
  clerk.currentUser.mockReset();
  clerk.getUser.mockReset();
  verify.mockReset();
  welcome.mockReset();
  welcome.mockResolvedValue({ data: { id: "email_1" }, error: null } as never);
  await seedOldUser();
});

describe("a reused email held by a User whose Clerk account is deleted", () => {
  beforeEach(() => {
    clerk.getUser.mockRejectedValue(notFound());
  });

  it("is released on a signed-in request, so the new User is synced", async () => {
    const res = await signedInRequest();

    expect(res.status).toBe(200);
    await expectNewUserFresh();
    await expectOldUserAnonymized();
    expect(clerk.getUser).toHaveBeenCalledWith("u_old");
  });

  it("is released on a Clerk user.created event, with one welcome email", async () => {
    const res = await deliver("user.created");

    expect(res.status).toBe(200);
    await expectNewUserFresh();
    await expectOldUserAnonymized();
    expect(welcome).toHaveBeenCalledTimes(1);
    expect(welcome).toHaveBeenCalledWith({ to: REUSED, userId: "u_new", firstName: "Ada" });
  });

  it("is released on a Clerk user.updated event", async () => {
    const res = await deliver("user.updated");

    expect(res.status).toBe(200);
    await expectNewUserFresh();
    await expectOldUserAnonymized();
  });

  it("logs one line with both User ids and the reason, and no email address", async () => {
    await signedInRequest();

    expect(releaseLines()).toHaveLength(1);
    expect(releaseLines()[0]).toMatchObject({
      level: "info",
      ctx: { userId: "u_new", releasedFromUserId: "u_old", reason: "clerk_user_not_found" },
    });
    expect(JSON.stringify(lines)).not.toContain("@example.com");
  });
});

describe("a reused email held by a live Clerk account that no longer lists it", () => {
  beforeEach(() => {
    clerk.getUser.mockResolvedValue(clerkAccount("u_old", "moved@example.com"));
  });

  it("refreshes the older row to that account's User Email, and syncs the new User", async () => {
    const res = await signedInRequest();

    expect(res.status).toBe(200);
    await expectNewUserFresh();
    expect(await rowOf("u_old")).toMatchObject({
      email: "moved@example.com",
      credits: 4,
      stripeCustomerId: "cus_old",
    });
    expect(await transactionsOf("u_old")).toHaveLength(2);
    expect(releaseLines()).toHaveLength(1);
    expect(releaseLines()[0].ctx).toMatchObject({
      userId: "u_new",
      releasedFromUserId: "u_old",
      reason: "email_no_longer_on_clerk_user",
    });
    expect(JSON.stringify(lines)).not.toContain("@example.com");
  });
});

describe("nothing is released", () => {
  it("when the older row's Clerk account still owns the address", async () => {
    clerk.getUser.mockResolvedValue(clerkAccount("u_old", "other@example.com", REUSED));

    expect((await signedInRequest()).status).toBe(500);
    expect((await deliver("user.created")).status).toBe(500);

    await expectOldUserUntouched();
    expect(await rowOf("u_new")).toBeUndefined();
    expect(welcome).not.toHaveBeenCalled();
    expect(releaseLines()).toEqual([]);
  });

  it("when Clerk cannot be reached, so a retry can succeed later", async () => {
    clerk.getUser.mockRejectedValue(new Error("fetch failed"));

    expect((await signedInRequest()).status).toBe(500);
    expect((await deliver("user.created")).status).toBe(500);

    await expectOldUserUntouched();
    expect(await rowOf("u_new")).toBeUndefined();
    expect(releaseLines()).toEqual([]);

    clerk.getUser.mockReset();
    clerk.getUser.mockRejectedValue(notFound());
    expect((await deliver("user.created")).status).toBe(200);
    await expectNewUserFresh();
    await expectOldUserAnonymized();
  });

  it("when Clerk answers another error status", async () => {
    clerk.getUser.mockRejectedValue(
      new ClerkAPIResponseError("Too Many Requests", { data: [], status: 429 }),
    );

    expect((await signedInRequest()).status).toBe(500);
    await expectOldUserUntouched();
    expect(await rowOf("u_new")).toBeUndefined();
  });
});
