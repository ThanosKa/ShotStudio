import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { refundAbandonedGenerations } from "@/lib/generation";
import { logger } from "@/lib/logger";

vi.unmock("@/lib/db");

const vinextFetch = vi.hoisted(() => vi.fn());
vi.mock("vinext/server/fetch-handler", () => ({
  default: { fetch: vinextFetch },
}));

vi.mock("@/lib/generation", () => ({ refundAbandonedGenerations: vi.fn() }));

const sentEvents = vi.hoisted((): Record<string, any>[] => []);
vi.mock("@/lib/error-tracking", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/error-tracking")>();
  return {
    ...actual,
    ERROR_TRACKING: {
      ...actual.errorTrackingSettings({ environment: "production", release: undefined }),
      dsn: "https://public@errors.example.test/1",
      transport: () => ({
        send: async ([, items]: [unknown, [{ type: string }, Record<string, any>][]]) => {
          for (const [header, payload] of items) if (header.type === "event") sentEvents.push(payload);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    },
  };
});

import { onRequestError } from "@/instrumentation";
import worker from "./index";

const ctx = { waitUntil: () => {} };
const cron = { cron: "*/5 * * * *", scheduledTime: Date.now() };

function collectingCtx() {
  const pending: Promise<unknown>[] = [];
  return {
    ctx: { waitUntil: (p: Promise<unknown>) => void pending.push(p) },
    settled: async () => {
      while (pending.length > 0) await Promise.allSettled(pending.splice(0));
    },
  };
}
const request = (path: string, method = "GET") =>
  worker.fetch(new Request(`https://example.test${path}`, { method }), {}, ctx);

describe("Worker entry", () => {
  beforeEach(() => {
    vinextFetch.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("answers 404, and logs a warning, for a missing file whose not-found page throws", async () => {
    const warn = vi.spyOn(logger, "warn");
    vinextFetch.mockImplementation(async () => {
      throw new Error("auth() was called without middleware");
    });

    for (const path of [
      "/favicon.ico",
      "/missing.png",
      "/a/b.js",
      "/data.json",
      "/backup.bak",
      "/index.php.old",
      "/.env",
      "/next.config.js.bak",
      "/.dockerignore",
      "/_next/data/abc/index.json",
    ]) {
      expect((await request(path)).status).toBe(404);
      expect((await request(path, "HEAD")).status).toBe(404);
    }
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/data.json" }),
      expect.any(String),
    );
  });

  it("does not hide a failure on a page", async () => {
    vinextFetch.mockImplementation(async () => {
      throw new Error("boom");
    });

    await expect(request("/pricing")).rejects.toThrow("boom");
    await expect(request("/blog/some-post")).rejects.toThrow("boom");
  });

  it("does not hide a failure on a request that changes something", async () => {
    vinextFetch.mockImplementation(async () => {
      throw new Error("boom");
    });

    await expect(request("/api/webhooks/stripe", "POST")).rejects.toThrow("boom");
    await expect(request("/upload.json", "POST")).rejects.toThrow("boom");
  });

  it("passes a working file through unchanged", async () => {
    vinextFetch.mockResolvedValue(new Response("png", { status: 200 }));

    const response = await request("/logo.png");

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("png");
  });
});

describe("Worker Cron Trigger", () => {
  it("refunds abandoned Generations with a database client of its own, on Hyperdrive", async () => {
    let database: unknown;
    vi.mocked(refundAbandonedGenerations).mockImplementation(async () => {
      database = db.$client.options.database;
      return 0;
    });
    const env = { HYPERDRIVE: { connectionString: "postgres://nobody@127.0.0.1:1/via_hyperdrive" } };

    await worker.scheduled(cron, env, ctx);

    expect(refundAbandonedGenerations).toHaveBeenCalledTimes(1);
    expect(database).toBe("via_hyperdrive");
  });
});

describe("Error tracking", () => {
  beforeEach(() => {
    sentEvents.length = 0;
    vinextFetch.mockReset();
  });

  it("reports a page failure that reaches the Worker entry, and flushes it before the Worker ends", async () => {
    vinextFetch.mockImplementation(async () => {
      throw new Error("page exploded");
    });
    const { ctx, settled } = collectingCtx();

    await expect(
      worker.fetch(new Request("https://example.test/pricing"), {}, ctx),
    ).rejects.toThrow("page exploded");
    await settled();

    expect(sentEvents.map((e) => e.exception.values[0].value)).toEqual(["page exploded"]);
  });

  it("reports a route error that vinext answers with a 500 itself", async () => {
    vinextFetch.mockImplementation(async (request: Request) => {
      await onRequestError(
        Object.assign(new Error("route exploded"), { digest: "123" }),
        { path: new URL(request.url).pathname, method: request.method, headers: {} },
        { routerKind: "App Router", routePath: "/api/checkout", routeType: "route", revalidateReason: undefined, renderSource: "react-server-components" },
      );
      return new Response(null, { status: 500 });
    });
    const { ctx, settled } = collectingCtx();

    const response = await worker.fetch(new Request("https://example.test/api/checkout", { method: "POST" }), {}, ctx);
    await settled();

    expect(response.status).toBe(500);
    expect(sentEvents).toHaveLength(1);
    expect(sentEvents[0].exception.values[0].value).toBe("route exploded");
    expect(sentEvents[0].tags).toMatchObject({ routePath: "/api/checkout", routeType: "route", digest: "123" });
  });

  it("reports an error a route catches and logs", async () => {
    vinextFetch.mockImplementation(async () => {
      logger.child({ action: "checkout" }).error({ err: new Error("stripe down for a@b.co") }, "checkout failed");
      return new Response(null, { status: 500 });
    });
    const { ctx, settled } = collectingCtx();

    await worker.fetch(new Request("https://example.test/api/checkout?session=x", { method: "POST" }), {}, ctx);
    await settled();

    expect(sentEvents).toHaveLength(1);
    expect(sentEvents[0].exception.values[0].value).toBe("stripe down for [email]");
    expect(sentEvents[0].tags).toMatchObject({ log: "checkout failed" });
    expect(sentEvents[0].request).toEqual({ method: "POST", url: "https://example.test/api/checkout" });
    expect(sentEvents[0].user).toBeUndefined();
  });

  it("reports a failing Cron Trigger run", async () => {
    vi.mocked(refundAbandonedGenerations).mockRejectedValue(new Error("database unreachable"));
    const { ctx, settled } = collectingCtx();
    const env = { HYPERDRIVE: { connectionString: "postgres://nobody@127.0.0.1:1/via_hyperdrive" } };

    await expect(worker.scheduled(cron, env, ctx)).rejects.toThrow("database unreachable");
    await settled();

    expect(sentEvents.map((e) => e.exception.values[0].value)).toEqual(["database unreachable"]);
    expect(sentEvents[0].exception.values[0].mechanism.type).toBe("auto.faas.cloudflare.scheduled");
  });

  it("does not report a missing file it answers with a 404", async () => {
    vinextFetch.mockImplementation(async () => {
      throw new Error("auth() was called without middleware");
    });
    const { ctx, settled } = collectingCtx();

    const response = await worker.fetch(new Request("https://example.test/favicon.ico"), {}, ctx);
    await settled();

    expect(response.status).toBe(404);
    expect(sentEvents).toEqual([]);
  });
});
