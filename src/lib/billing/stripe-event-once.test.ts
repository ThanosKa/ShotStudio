import type { Logger } from "pino";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runStripeEventOnce } from "@/lib/billing/stripe-event-once";

// The Delivery Claim rules, tested through runStripeEventOnce with Redis mocked
// at its module. The route tests stay as the end-to-end check.

const fakeRedis = vi.hoisted(() => ({
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}));
vi.mock("@/lib/redis", () => ({ redis: fakeRedis }));

const log = { warn: vi.fn() } as unknown as Logger;
const KEY = "stripe:event:evt_1";

beforeEach(() => {
  vi.resetAllMocks();
  fakeRedis.set.mockResolvedValue("OK");
  fakeRedis.del.mockResolvedValue(1);
});

describe("runStripeEventOnce", () => {
  it("claims stripe:event:<id> as processing for 120 s, then marks done for 86,400 s", async () => {
    const work = vi.fn().mockResolvedValue({ ok: true });

    const out = await runStripeEventOnce("evt_1", work, log);

    expect(out).toEqual({ kind: "ran", result: { ok: true } });
    expect(fakeRedis.set).toHaveBeenNthCalledWith(1, KEY, "processing", { nx: true, ex: 120 });
    expect(fakeRedis.set).toHaveBeenNthCalledWith(2, KEY, "done", { ex: 86_400 });
    expect(fakeRedis.del).not.toHaveBeenCalled();
  });

  it("answers duplicate for the old '1' value and for done, without running the work", async () => {
    const work = vi.fn();
    fakeRedis.set.mockResolvedValue(null);
    for (const stored of ["1", "done"]) {
      fakeRedis.get.mockResolvedValue(stored);
      expect(await runStripeEventOnce("evt_1", work, log)).toEqual({ kind: "duplicate" });
    }
    expect(work).not.toHaveBeenCalled();
  });

  it("answers in_progress while a processing claim is live", async () => {
    const work = vi.fn();
    fakeRedis.set.mockResolvedValue(null);
    fakeRedis.get.mockResolvedValue("processing");

    expect(await runStripeEventOnce("evt_1", work, log)).toEqual({ kind: "in_progress" });
    expect(work).not.toHaveBeenCalled();
  });

  it("deletes the claim and still answers ran when the result is not ok", async () => {
    const out = await runStripeEventOnce("evt_1", async () => ({ ok: false }), log);

    expect(out).toEqual({ kind: "ran", result: { ok: false } });
    expect(fakeRedis.del).toHaveBeenCalledWith(KEY);
    expect(fakeRedis.set).toHaveBeenCalledTimes(1);
  });

  it("deletes the claim and rethrows when the work throws", async () => {
    const boom = new Error("boom");

    await expect(
      runStripeEventOnce("evt_1", async () => Promise.reject(boom), log),
    ).rejects.toBe(boom);
    expect(fakeRedis.del).toHaveBeenCalledWith(KEY);
  });

  it("still answers ran when the done write fails after success", async () => {
    fakeRedis.set.mockResolvedValueOnce("OK").mockRejectedValueOnce(new Error("redis down"));

    const out = await runStripeEventOnce("evt_1", async () => ({ ok: true }), log);

    expect(out).toEqual({ kind: "ran", result: { ok: true } });
    expect(log.warn).toHaveBeenCalled();
  });
});
