import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { applyClerkEvent, pickUserEmail } from "./user-sync";

vi.mock("@/lib/emails/welcome", () => ({ sendWelcomeEmail: vi.fn() }));
const welcome = vi.mocked(sendWelcomeEmail);

const ev = (type: string, data: unknown) => ({ type, data }) as unknown as WebhookEvent;
const created = (id: string, email?: string) =>
  ev("user.created", {
    id,
    first_name: null,
    email_addresses: email ? [{ email_address: email }] : [],
  });

describe("applyClerkEvent", () => {
  beforeEach(() => {
    welcome.mockReset();
    welcome.mockResolvedValue({ data: { id: "email_1" }, error: null } as never);
  });

  it("reports created with the welcome result, then already_exists on replay", async () => {
    expect(await applyClerkEvent(created("u1", "a@example.com"))).toEqual({
      kind: "created",
      welcome: { sent: true, emailId: "email_1" },
    });
    expect(await applyClerkEvent(created("u1", "a@example.com"))).toEqual({ kind: "already_exists" });
    expect(welcome).toHaveBeenCalledTimes(1);
  });

  it("reports a failed welcome email without throwing", async () => {
    const err = new Error("resend down");
    welcome.mockResolvedValueOnce({ data: null, error: err } as never);
    expect(await applyClerkEvent(created("u2", "b@example.com"))).toEqual({
      kind: "created",
      welcome: { sent: false, err },
    });
  });

  it("reports a rejected welcome email as thrown, after the row is inserted", async () => {
    const err = new Error("network");
    welcome.mockRejectedValueOnce(err);
    expect(await applyClerkEvent(created("u5", "e@example.com"))).toEqual({
      kind: "created",
      welcome: { sent: false, err, thrown: true },
    });
  });

  it("skips events it cannot act on", async () => {
    expect(await applyClerkEvent(created("u3"))).toEqual({ kind: "skipped", reason: "no_email" });
    expect(await applyClerkEvent(ev("user.updated", { id: "u3", email_addresses: [] }))).toEqual({
      kind: "skipped",
      reason: "no_email",
    });
    expect(await applyClerkEvent(ev("user.deleted", {}))).toEqual({ kind: "skipped", reason: "no_id" });
    expect(await applyClerkEvent(ev("user.deleted", { id: "u3", deleted: false }))).toEqual({
      kind: "skipped",
      reason: "not_deleted",
    });
    expect(await applyClerkEvent(ev("session.created", { id: "s" }))).toEqual({
      kind: "skipped",
      reason: "unhandled_type",
    });
  });

  it("upserts on update and anonymizes on delete", async () => {
    expect(
      await applyClerkEvent(ev("user.updated", { id: "u4", email_addresses: [{ email_address: "c@example.com" }] })),
    ).toEqual({ kind: "upserted" });
    expect(await applyClerkEvent(ev("user.deleted", { id: "u4", deleted: true }))).toEqual({ kind: "anonymized" });
    expect(await applyClerkEvent(ev("user.deleted", { id: "nobody", deleted: true }))).toEqual({ kind: "no_row" });
  });
});

describe("pickUserEmail", () => {
  const list = [
    { id: "idn_1", email: "A@Example.com" },
    { id: "idn_2", email: "b@example.com" },
  ];

  it("returns the primary address when it is not the first", () => {
    expect(pickUserEmail({ addresses: list, primaryId: "idn_2" })).toBe("b@example.com");
  });

  it("returns the first address as it is when no primary is set", () => {
    expect(pickUserEmail({ addresses: list, primaryId: null })).toBe("A@Example.com");
  });

  it("returns the first address when the primary id matches no address", () => {
    expect(pickUserEmail({ addresses: list, primaryId: "idn_gone" })).toBe("A@Example.com");
  });

  it("returns null for an empty list", () => {
    expect(pickUserEmail({ addresses: [], primaryId: "idn_1" })).toBeNull();
  });
});

describe("applyClerkEvent with a primary address that is not the first", () => {
  beforeEach(() => {
    welcome.mockReset();
    welcome.mockResolvedValue({ data: { id: "email_1" }, error: null } as never);
  });
  const addrs = [
    { id: "idn_1", email_address: "first@example.com" },
    { id: "idn_2", email_address: "primary@example.com" },
  ];

  it("user.created stores the primary and sends the one welcome email to it", async () => {
    await applyClerkEvent(
      ev("user.created", { id: "p1", first_name: null, email_addresses: addrs, primary_email_address_id: "idn_2" }),
    );
    const [row] = await db.select().from(users).where(eq(users.id, "p1"));
    expect(row.email).toBe("primary@example.com");
    expect(welcome).toHaveBeenCalledTimes(1);
    expect(welcome).toHaveBeenCalledWith(expect.objectContaining({ to: "primary@example.com" }));
  });

  it("user.updated changes the row when the primary changes", async () => {
    const data = { id: "p2", first_name: null, email_addresses: addrs };
    await applyClerkEvent(ev("user.created", { ...data, primary_email_address_id: "idn_1" }));
    await applyClerkEvent(ev("user.updated", { ...data, primary_email_address_id: "idn_2" }));
    const [row] = await db.select().from(users).where(eq(users.id, "p2"));
    expect(row.email).toBe("primary@example.com");
  });
});
