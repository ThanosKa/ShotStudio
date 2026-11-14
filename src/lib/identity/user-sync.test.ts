import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { sendWelcomeEmail } from "@/lib/emails/welcome";
import { applyClerkEvent } from "./user-sync";

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
