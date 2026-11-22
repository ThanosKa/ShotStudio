import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { withAuthenticatedUser } from "./route-auth";

const clerk = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));
vi.mock("@clerk/nextjs/server", () => clerk);

const allowed = { success: true, limit: 10, remaining: 9, reset: Date.now() + 60_000 };

function limiter(result: typeof allowed | { success: false; limit: number; remaining: number; reset: number }) {
  return { limit: vi.fn(async () => result) };
}

function clerkUser(...emails: string[]) {
  return { emailAddresses: emails.map((emailAddress) => ({ emailAddress })) };
}

async function rowOf(userId: string) {
  const [row] = await db.select().from(users).where(eq(users.id, userId));
  return row;
}

beforeEach(() => {
  clerk.auth.mockReset();
  clerk.currentUser.mockReset();
});

describe("withAuthenticatedUser", () => {
  it("answers 401 when Clerk has no user id", async () => {
    clerk.auth.mockResolvedValue({ userId: null });
    const handler = vi.fn();

    const res = await withAuthenticatedUser({ action: "t", rateLimit: limiter(allowed), handler });

    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("answers 429 with rate-limit headers and never looks the user up in Clerk", async () => {
    clerk.auth.mockResolvedValue({ userId: "u_1" });
    const reset = Date.now() + 30_000;
    const handler = vi.fn();

    const res = await withAuthenticatedUser({
      action: "t",
      rateLimit: limiter({ success: false, limit: 5, remaining: 0, reset }),
      handler,
    });

    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("X-RateLimit-Reset")).toBe(String(Math.ceil(reset / 1000)));
    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
    expect(clerk.currentUser).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
    expect(await rowOf("u_1")).toBeUndefined();
  });

  it("writes the users row and hands the handler the email", async () => {
    clerk.auth.mockResolvedValue({ userId: "u_2" });
    clerk.currentUser.mockResolvedValue(clerkUser("a@test"));
    const handler = vi.fn(async () => new Response("ok"));

    const res = await withAuthenticatedUser({ action: "t", rateLimit: limiter(allowed), handler });

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u_2", email: "a@test" }),
    );
    expect(await rowOf("u_2")).toMatchObject({ id: "u_2", email: "a@test", credits: 0 });
  });

  it("keeps Clerk's primary address when it is not the first", async () => {
    clerk.auth.mockResolvedValue({ userId: "u_4" });
    clerk.currentUser.mockResolvedValue({
      emailAddresses: [
        { id: "idn_1", emailAddress: "first@test" },
        { id: "idn_2", emailAddress: "primary@test" },
      ],
      primaryEmailAddressId: "idn_2",
    });
    const handler = vi.fn(async () => new Response("ok"));

    await withAuthenticatedUser({ action: "t", rateLimit: limiter(allowed), handler });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ userId: "u_4", email: "primary@test" }));
    expect(await rowOf("u_4")).toMatchObject({ email: "primary@test" });
  });

  it("writes no row and hands the handler null when Clerk has no email", async () => {
    clerk.auth.mockResolvedValue({ userId: "u_3" });
    clerk.currentUser.mockResolvedValue(clerkUser());
    const handler = vi.fn(async () => new Response("ok"));

    await withAuthenticatedUser({ action: "t", rateLimit: limiter(allowed), handler });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ userId: "u_3", email: null }));
    expect(await rowOf("u_3")).toBeUndefined();
  });
});
