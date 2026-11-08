import { afterEach, describe, expect, it, vi } from "vitest";
import {
  db,
  keepRequestAliveUntil,
  resolveConnectionString,
  runWithJobDb,
  runWithRequestDb,
} from "@/lib/db";

// `vitest.setup.ts` replaces `@/lib/db` with PGlite. These tests need the real
// module. Clients are never asked to query, so postgres.js opens no socket, and
// the address below refuses connections anyway.
vi.unmock("@/lib/db");

const LOCAL_A = "postgres://nobody@127.0.0.1:1/request_a";
const LOCAL_B = "postgres://nobody@127.0.0.1:1/request_b";

function fakeCtx() {
  const pending: Promise<unknown>[] = [];
  return {
    ctx: { waitUntil: (p: Promise<unknown>) => void pending.push(p) },
    settled: () => Promise.all(pending),
  };
}

// postgres.js rejects with CONNECTION_ENDED, without touching the network,
// once its client has been ended. That is how these tests observe a close.
async function isEnded(client: { unsafe(query: string): PromiseLike<unknown> }) {
  const outcome = await Promise.race([
    Promise.resolve(client.unsafe("select 1")).catch((err: { code?: string }) => err.code),
    new Promise((resolve) => setTimeout(() => resolve("still open"), 50)),
  ]);
  return outcome === "CONNECTION_ENDED";
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("runWithRequestDb", () => {
  it("gives concurrent requests different clients, each on its own connection string", async () => {
    const { ctx } = fakeCtx();
    const seen: Record<string, unknown> = {};
    let release!: () => void;
    const bothInside = new Promise<void>((r) => (release = r));

    const a = runWithRequestDb(LOCAL_A, ctx, async () => {
      seen.a = db.$client;
      seen.aDatabase = db.$client.options.database;
      await bothInside;
      seen.aAgain = db.$client;
      return new Response("a");
    });
    const b = runWithRequestDb(LOCAL_B, ctx, async () => {
      seen.b = db.$client;
      seen.bDatabase = db.$client.options.database;
      release();
      return new Response("b");
    });
    await Promise.all([a, b]);

    expect(seen.a).toBe(seen.aAgain);
    expect(seen.a).not.toBe(seen.b);
    expect(seen.aDatabase).toBe("request_a");
    expect(seen.bDatabase).toBe("request_b");
  });

  it("keeps the client open until the response body has been read, then closes it", async () => {
    const { ctx, settled } = fakeCtx();
    let client!: typeof db.$client;
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      client = db.$client;
      return new Response("streamed body", { status: 201, headers: { "x-kept": "yes" } });
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("x-kept")).toBe("yes");
    expect(await response.text()).toBe("streamed body");
    await settled();
    expect(await isEnded(client)).toBe(true);
  });

  it("lets a query that starts after the response is returned use the same client", async () => {
    const { ctx } = fakeCtx();
    const clients: unknown[] = [];
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      clients.push(db.$client);
      const stream = new ReadableStream({
        async pull(controller) {
          await new Promise((r) => setTimeout(r, 5));
          clients.push(db.$client);
          controller.enqueue(new TextEncoder().encode("late"));
          controller.close();
        },
      });
      return new Response(stream);
    });

    expect(await response.text()).toBe("late");
    expect(clients[1]).toBe(clients[0]);
  });

  it("closes the client when the reader cancels the body", async () => {
    const { ctx, settled } = fakeCtx();
    let client!: typeof db.$client;
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      client = db.$client;
      return new Response(new ReadableStream({ pull: () => new Promise(() => {}) }));
    });

    await response.body!.cancel();
    await settled();
    expect(await isEnded(client)).toBe(true);
  });

  it("closes the client when the response has no body", async () => {
    const { ctx, settled } = fakeCtx();
    let client!: typeof db.$client;
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      client = db.$client;
      return new Response(null, { status: 304 });
    });

    expect(response.status).toBe(304);
    await settled();
    expect(await isEnded(client)).toBe(true);
  });

  it("leaves a response untouched when no client was opened and it is not a page", async () => {
    const { ctx } = fakeCtx();
    const original = new Response("User-agent: *", { headers: { "content-type": "text/plain" } });
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => original);
    expect(response).toBe(original);
  });

  it("still closes a client that a streamed page opens after it is returned", async () => {
    const { ctx, settled } = fakeCtx();
    let client!: typeof db.$client;
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      const stream = new ReadableStream({
        async pull(controller) {
          await new Promise((r) => setTimeout(r, 5));
          client = db.$client;
          controller.enqueue(new TextEncoder().encode("late"));
          controller.close();
        },
      });
      return new Response(stream, { headers: { "content-type": "text/html; charset=utf-8" } });
    });

    expect(await response.text()).toBe("late");
    await settled();
    expect(await isEnded(client)).toBe(true);
  });

  it("keeps Content-Length on a body of known length, and closes the client", async () => {
    const { ctx, settled } = fakeCtx();
    let client!: typeof db.$client;
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      client = db.$client;
      return new Response("hello", { headers: { "content-length": "5" } });
    });

    expect(response.headers.get("content-length")).toBe("5");
    await settled();
    expect(await isEnded(client)).toBe(true);
    expect(await response.text()).toBe("hello");
  });

  it("closes the client and rethrows when the handler throws", async () => {
    const { ctx, settled } = fakeCtx();
    let client!: typeof db.$client;
    await expect(
      runWithRequestDb(LOCAL_A, ctx, async () => {
        client = db.$client;
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    await settled();
    expect(await isEnded(client)).toBe(true);
  });

  // A Worker cancels a request's unfinished work when the visitor hangs up, unless
  // it was handed to waitUntil. A Generation's Refund must survive that.
  it("keeps work handed to keepRequestAliveUntil running, with an open client, after the reader hangs up", async () => {
    const { ctx, settled } = fakeCtx();
    const waitedOn: Promise<unknown>[] = [];
    const recordingCtx = {
      waitUntil: (p: Promise<unknown>) => {
        waitedOn.push(p);
        ctx.waitUntil(p);
      },
    };
    let finishWork!: () => void;
    let clientInWork!: typeof db.$client;
    let openDuringWork = false;
    const response = await runWithRequestDb(LOCAL_A, recordingCtx, async () => {
      const work = (async () => {
        await new Promise<void>((r) => (finishWork = r));
        clientInWork = db.$client;
        openDuringWork = !(await isEnded(clientInWork));
      })();
      keepRequestAliveUntil(work);
      return new Response(new ReadableStream({ pull: () => new Promise(() => {}) }), {
        headers: { "content-type": "application/json" },
      });
    });

    await response.body!.cancel();
    const handedOver = waitedOn.length;
    finishWork();
    await settled();

    expect(handedOver).toBeGreaterThan(0);
    expect(openDuringWork).toBe(true);
    expect(await isEnded(clientInWork)).toBe(true);
  });

  it("refuses the database once the request's client has closed, instead of opening one that never closes", async () => {
    const { ctx, settled } = fakeCtx();
    const response = await runWithRequestDb(LOCAL_A, ctx, async () => {
      const stream = new ReadableStream({
        async pull(controller) {
          await new Promise((r) => setTimeout(r, 5));
          let outcome = "opened a client";
          try {
            void db.$client;
          } catch (err) {
            outcome = (err as Error).message;
          }
          controller.enqueue(new TextEncoder().encode(outcome));
          controller.close();
        },
      });
      return new Response(stream, { headers: { "content-type": "application/json" } });
    });

    await settled();
    expect(await response.text()).toMatch(/after the request's database client closed/);
  });

  it("does nothing with keepRequestAliveUntil outside a request, as under Node", async () => {
    expect(() => keepRequestAliveUntil(Promise.resolve())).not.toThrow();
  });

  it("does not need a connection string until the database is used", async () => {
    const { ctx } = fakeCtx();
    const response = await runWithRequestDb(undefined, ctx, async () => new Response("public"));
    expect(await response.text()).toBe("public");

    await expect(
      runWithRequestDb(undefined, ctx, async () => {
        void db.$client;
        return new Response("never");
      }),
    ).rejects.toThrow("No database connection string");
  });
});

describe("runWithJobDb", () => {
  it("gives a scheduled job its own client and closes it when the job ends", async () => {
    const { ctx } = fakeCtx();
    let client!: typeof db.$client;
    const result = await runWithJobDb(LOCAL_B, ctx, async () => {
      client = db.$client;
      return 7;
    });

    expect(result).toBe(7);
    expect(client.options.database).toBe("request_b");
    expect(await isEnded(client)).toBe(true);
  });

  it("closes the client and rethrows when the job throws", async () => {
    const { ctx } = fakeCtx();
    let client!: typeof db.$client;
    await expect(
      runWithJobDb(LOCAL_A, ctx, async () => {
        client = db.$client;
        throw new Error("job failed");
      }),
    ).rejects.toThrow("job failed");
    expect(await isEnded(client)).toBe(true);
  });
});

describe("resolveConnectionString", () => {
  it("uses the Hyperdrive binding's connection string", () => {
    expect(resolveConnectionString({ HYPERDRIVE: { connectionString: LOCAL_B } })).toBe(LOCAL_B);
  });

  // Postgres.js sends no TLS request for these URLs, so falling back to one
  // would quietly send queries and results across the internet in the clear.
  it("never falls back to a plain DATABASE_URL", () => {
    expect(
      resolveConnectionString({ DATABASE_URL: LOCAL_A } as Parameters<
        typeof resolveConnectionString
      >[0]),
    ).toBeUndefined();
  });
});

describe("db outside a request", () => {
  it("refuses on a Worker rather than share a client between requests", () => {
    vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
    expect(() => db.$client).toThrow("outside a request");
  });

  it("uses one shared client under Node, as next dev and next start need", () => {
    vi.stubEnv("DATABASE_URL", LOCAL_A);
    expect(db.$client.options.database).toBe("request_a");
    expect(db.$client).toBe(db.$client);
  });
});
