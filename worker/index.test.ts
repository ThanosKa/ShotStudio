import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { refundAbandonedGenerations } from "@/lib/generation";
import { logger } from "@/lib/logger";

// `vitest.setup.ts` replaces `@/lib/db` with PGlite. The entry needs the real one.
vi.unmock("@/lib/db");

const vinextFetch = vi.hoisted(() => vi.fn());
vi.mock("vinext/server/fetch-handler", () => ({
  default: { fetch: vinextFetch },
}));

vi.mock("@/lib/generation", () => ({ refundAbandonedGenerations: vi.fn() }));

import worker from "./index";

const ctx = { waitUntil: () => {} };
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

    // The last ones are real scanner URLs that returned 500 on the deployed Worker.
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

    await worker.scheduled({}, env, ctx);

    expect(refundAbandonedGenerations).toHaveBeenCalledTimes(1);
    expect(database).toBe("via_hyperdrive");
  });
});
