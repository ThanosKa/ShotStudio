import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { refundAbandonedGenerations } from "@/lib/generation";

// `vitest.setup.ts` replaces `@/lib/db` with PGlite. The entry needs the real one.
vi.unmock("@/lib/db");

const vinextFetch = vi.hoisted(() => vi.fn());
vi.mock("vinext/server/fetch-handler", () => ({
  default: { fetch: vinextFetch },
}));

vi.mock("@/lib/generation", () => ({ refundAbandonedGenerations: vi.fn() }));

import worker from "./index";

const ctx = { waitUntil: () => {} };
const get = (path: string) =>
  worker.fetch(new Request(`https://example.test${path}`), {}, ctx);

describe("Worker entry", () => {
  beforeEach(() => {
    vinextFetch.mockReset();
  });

  it("answers 404 for a missing file whose not-found page throws", async () => {
    vinextFetch.mockImplementation(async () => {
      throw new Error("auth() was called without middleware");
    });

    for (const path of ["/favicon.ico", "/missing.png", "/a/b.js"]) {
      expect((await get(path)).status).toBe(404);
    }
  });

  it("does not hide a failure on a page", async () => {
    vinextFetch.mockImplementation(async () => {
      throw new Error("boom");
    });

    await expect(get("/pricing")).rejects.toThrow("boom");
    await expect(get("/data.json")).rejects.toThrow("boom");
  });

  it("passes a working file through unchanged", async () => {
    vinextFetch.mockResolvedValue(new Response("png", { status: 200 }));

    const response = await get("/logo.png");

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
