import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { isWorkersRuntime } from "@/lib/runtime";
import * as schema from "./schema";

function createClient(connectionString: string | undefined) {
  if (!connectionString) {
    throw new Error("No database connection string");
  }
  return postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    fetch_types: false,
  });
}

function createDb(client: ReturnType<typeof createClient>) {
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;
type WaitUntil = { waitUntil(promise: Promise<unknown>): void };
type RequestScope = {
  connectionString: string | undefined;
  ctx: WaitUntil;
  db?: Db;
  /** Work that must finish before the client closes (see keepRequestAliveUntil). */
  pending: Promise<void>[];
  closed: boolean;
};

const requestScope = new AsyncLocalStorage<RequestScope>();

/**
 * The one place a Worker chooses its database. There is no fallback to
 * DATABASE_URL: Postgres.js would send those queries in the clear, and a Worker
 * cannot open TLS to Supabase's pooler itself (it rejects the private CA).
 */
export function resolveConnectionString(env: {
  HYPERDRIVE?: { connectionString: string };
}): string | undefined {
  return env.HYPERDRIVE?.connectionString;
}

function openScope(connectionString: string | undefined, ctx: WaitUntil) {
  const scope: RequestScope = { connectionString, ctx, pending: [], closed: false };
  const close = async () => {
    // Work can hand over more work while it runs, so wait until none is added.
    for (let seen = -1; seen !== scope.pending.length; ) {
      seen = scope.pending.length;
      await Promise.all(scope.pending);
    }
    scope.closed = true;
    await scope.db?.$client.end({ timeout: 5 });
  };
  return { scope, close };
}

/**
 * Runs a Worker job that has no Response, such as a Cron Trigger, with its own
 * database client, closed once the job and its kept-alive work have finished.
 */
export function runWithJobDb<T>(
  connectionString: string | undefined,
  ctx: WaitUntil,
  job: () => Promise<T>,
): Promise<T> {
  const { scope, close } = openScope(connectionString, ctx);
  return requestScope.run(scope, async () => {
    try {
      return await job();
    } finally {
      await close();
    }
  });
}

/**
 * Runs one Worker request with its own database client, opened on first use.
 * A Worker cannot reuse a socket across requests, so nothing may outlive this.
 * The client closes once the response body ends or the reader cancels it,
 * because streamed pages can still query after the Response is returned, and
 * not before every promise handed to `keepRequestAliveUntil` has settled.
 * After that, using `db` in this request throws.
 */
export function runWithRequestDb(
  connectionString: string | undefined,
  ctx: WaitUntil,
  handler: () => Promise<Response>,
): Promise<Response> {
  const { scope, close } = openScope(connectionString, ctx);

  return requestScope.run(scope, async () => {
    let response: Response;
    try {
      response = await handler();
    } catch (err) {
      ctx.waitUntil(close());
      throw err;
    }
    // Only an open client or a page still rendering can need the wrap below,
    // which costs CPU and loses the Content-Length of a fixed-size body.
    const contentType = response.headers.get("content-type") ?? "";
    const mayStillQuery =
      scope.db !== undefined || /^text\/(html|x-component)/.test(contentType);
    if (!response.body || response.headers.has("content-length") || !mayStillQuery) {
      ctx.waitUntil(close());
      return response;
    }
    const { readable, writable } = new TransformStream();
    ctx.waitUntil(
      response.body
        .pipeTo(writable)
        .catch(() => {}) // A reader that hangs up is not an error here.
        .then(close),
    );
    return new Response(readable, response);
  });
}

/**
 * Keeps `work` running on a Worker after the response is sent or the visitor
 * hangs up (through `waitUntil`, which Cloudflare honours for about 30 seconds
 * after a disconnect), and keeps this request's database client open for it.
 * Under Node there is no request scope and nothing to do: the process keeps running.
 */
export function keepRequestAliveUntil(work: Promise<unknown>): void {
  const scope = requestScope.getStore();
  if (!scope) return;
  const settled = work.then(
    () => {},
    () => {},
  );
  scope.pending.push(settled);
  scope.ctx.waitUntil(settled);
}

declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

let sharedDb: Db | undefined;

function getSharedDb(): Db {
  if (isWorkersRuntime()) {
    throw new Error("db used outside a request on a Worker");
  }
  if (!sharedDb) {
    const client = globalThis.__pgClient ?? createClient(process.env.DATABASE_URL);
    if (process.env.NODE_ENV !== "production") {
      globalThis.__pgClient = client;
    }
    sharedDb = createDb(client);
  }
  return sharedDb;
}

function currentDb(): Db {
  const scope = requestScope.getStore();
  if (!scope) return getSharedDb();
  if (scope.closed) {
    throw new Error("db used after the request's database client closed");
  }
  scope.db ??= createDb(createClient(scope.connectionString));
  return scope.db;
}

/** Resolves on every access: the request's client on a Worker, a shared one under Node. */
export const db = new Proxy({} as Db, {
  get: (_target, property) => Reflect.get(currentDb(), property),
});
export { schema };
