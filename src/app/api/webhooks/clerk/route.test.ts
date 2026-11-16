import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { transactions, users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/welcome";

// Verification and the welcome email are mocked at their modules; the database
// is the per-test PGlite from vitest.setup.ts. These tests record today's
// behaviour, so every event carries one address (or its primary one first).
vi.mock("@clerk/nextjs/webhooks", () => ({ verifyWebhook: vi.fn() }));
vi.mock("@/lib/emails/welcome", () => ({ sendWelcomeEmail: vi.fn() }));

const verify = vi.mocked(verifyWebhook);
const welcome = vi.mocked(sendWelcomeEmail);

type Event = Awaited<ReturnType<typeof verifyWebhook>>;

const addresses = (email?: string) => (email ? [{ email_address: email }] : []);

function created(data: { id: string; email?: string; first_name?: string }): Event {
  return {
    type: "user.created",
    data: {
      id: data.id,
      first_name: data.first_name ?? null,
      email_addresses: addresses(data.email),
    },
  } as unknown as Event;
}

function updated(data: { id: string; email?: string }): Event {
  return {
    type: "user.updated",
    data: { id: data.id, email_addresses: addresses(data.email) },
  } as unknown as Event;
}

function deleted(data: { id?: string; deleted?: boolean }): Event {
  return { type: "user.deleted", data } as unknown as Event;
}

async function deliver(evt: Event) {
  verify.mockResolvedValueOnce(evt);
  const { POST } = await import("./route");
  return POST(
    new NextRequest("https://example.test/api/webhooks/clerk", { method: "POST", body: "{}" }),
  );
}

const allUsers = () => db.select().from(users);
const rowFor = async (id: string) => (await allUsers()).find((u) => u.id === id);

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    verify.mockReset();
    welcome.mockReset();
    welcome.mockResolvedValue({ data: { id: "email_1" }, error: null } as never);
  });

  it("answers 400 when verification fails, and writes nothing", async () => {
    verify.mockRejectedValueOnce(new Error("bad signature"));
    const { POST } = await import("./route");
    const res = await POST(
      new NextRequest("https://example.test/api/webhooks/clerk", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(400);
    expect(await allUsers()).toEqual([]);
    expect(welcome).not.toHaveBeenCalled();
  });

  describe("user.created", () => {
    it("inserts the row with 0 Credits and sends one welcome email", async () => {
      const res = await deliver(created({ id: "u_new", email: "new@example.com", first_name: "Ada" }));
      expect(res.status).toBe(200);
      const row = await rowFor("u_new");
      expect(row).toMatchObject({ email: "new@example.com", credits: 0, stripeCustomerId: null });
      expect(welcome).toHaveBeenCalledTimes(1);
      expect(welcome).toHaveBeenCalledWith({
        to: "new@example.com",
        userId: "u_new",
        firstName: "Ada",
      });
    });

    it("sends no second welcome email for the same User, and answers 200", async () => {
      await deliver(created({ id: "u_new", email: "new@example.com" }));
      welcome.mockClear();
      const res = await deliver(created({ id: "u_new", email: "new@example.com" }));
      expect(res.status).toBe(200);
      expect(welcome).not.toHaveBeenCalled();
      expect(await allUsers()).toHaveLength(1);
    });

    it("keeps the existing row untouched when the User already exists", async () => {
      await db.insert(users).values({ id: "u_old", email: "old@example.com", credits: 7 });
      const res = await deliver(created({ id: "u_old", email: "other@example.com" }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_old")).toMatchObject({ email: "old@example.com", credits: 7 });
      expect(welcome).not.toHaveBeenCalled();
    });

    it("answers 200 with the row inserted when the welcome email comes back with an error", async () => {
      welcome.mockResolvedValueOnce({ data: null, error: { message: "nope" } } as never);
      const res = await deliver(created({ id: "u_new", email: "new@example.com" }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_new")).toBeDefined();
    });

    it("answers 500 with the row inserted when the welcome email throws", async () => {
      welcome.mockRejectedValueOnce(new Error("resend down"));
      const res = await deliver(created({ id: "u_new", email: "new@example.com" }));
      expect(res.status).toBe(500);
      expect(await rowFor("u_new")).toBeDefined();
    });

    it("writes nothing and answers 200 without an email", async () => {
      const res = await deliver(created({ id: "u_noemail" }));
      expect(res.status).toBe(200);
      expect(await allUsers()).toEqual([]);
      expect(welcome).not.toHaveBeenCalled();
    });
  });

  describe("user.updated", () => {
    it("inserts the row when there is none", async () => {
      const res = await deliver(updated({ id: "u_up", email: "up@example.com" }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_up")).toMatchObject({ email: "up@example.com", credits: 0 });
      expect(welcome).not.toHaveBeenCalled();
    });

    it("changes the email of an existing row and keeps its Credits", async () => {
      await db.insert(users).values({ id: "u_up", email: "before@example.com", credits: 4 });
      const res = await deliver(updated({ id: "u_up", email: "after@example.com" }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_up")).toMatchObject({ email: "after@example.com", credits: 4 });
    });

    it("writes nothing and answers 200 without an email", async () => {
      await db.insert(users).values({ id: "u_up", email: "before@example.com", credits: 4 });
      const res = await deliver(updated({ id: "u_up" }));
      expect(res.status).toBe(200);
      expect(await allUsers()).toHaveLength(1);
      expect(await rowFor("u_up")).toMatchObject({ email: "before@example.com" });
    });
  });

  describe("user.deleted", () => {
    const seedBuyer = async () => {
      await db.insert(users).values({
        id: "u_gone",
        email: "gone@example.com",
        credits: 3,
        stripeCustomerId: "cus_gone",
      });
      await db.insert(transactions).values({
        userId: "u_gone",
        type: "purchase",
        amount: 5,
        stripePaymentId: "cs_gone",
      });
    };

    it("anonymizes the row, clears the Stripe customer id and keeps its Transactions", async () => {
      await seedBuyer();
      const res = await deliver(deleted({ id: "u_gone", deleted: true }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_gone")).toMatchObject({
        email: "deleted+u_gone@anonymized.local",
        stripeCustomerId: null,
        credits: 3,
      });
      const kept = await db.select().from(transactions).where(eq(transactions.userId, "u_gone"));
      expect(kept).toHaveLength(1);
    });

    it("changes nothing with deleted: false", async () => {
      await seedBuyer();
      const res = await deliver(deleted({ id: "u_gone", deleted: false }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_gone")).toMatchObject({
        email: "gone@example.com",
        stripeCustomerId: "cus_gone",
      });
    });

    it("changes nothing without an id", async () => {
      await seedBuyer();
      const res = await deliver(deleted({ deleted: true }));
      expect(res.status).toBe(200);
      expect(await rowFor("u_gone")).toMatchObject({ email: "gone@example.com" });
    });

    it("changes nothing for a User with no row, and answers 200", async () => {
      await seedBuyer();
      const res = await deliver(deleted({ id: "u_unknown", deleted: true }));
      expect(res.status).toBe(200);
      expect(await allUsers()).toHaveLength(1);
      expect(await rowFor("u_gone")).toMatchObject({ email: "gone@example.com" });
    });
  });

  it("answers 200 for an unhandled event type, and writes nothing", async () => {
    const res = await deliver({ type: "session.created", data: { id: "sess_1" } } as unknown as Event);
    expect(res.status).toBe(200);
    expect(await allUsers()).toEqual([]);
    expect(welcome).not.toHaveBeenCalled();
  });

  describe("a database error answers 500, so Clerk retries", () => {
    beforeEach(async () => {
      // The email column is unique, so a second User with the same address fails.
      await db.insert(users).values({ id: "u_first", email: "taken@example.com", credits: 0 });
    });

    it("on user.created", async () => {
      const res = await deliver(created({ id: "u_second", email: "taken@example.com" }));
      expect(res.status).toBe(500);
      expect(welcome).not.toHaveBeenCalled();
    });

    it("on user.updated", async () => {
      const res = await deliver(updated({ id: "u_second", email: "taken@example.com" }));
      expect(res.status).toBe(500);
    });
  });
});
