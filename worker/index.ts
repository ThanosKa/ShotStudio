import vinext from "vinext/server/fetch-handler";
import { resolveConnectionString, runWithJobDb, runWithRequestDb } from "@/lib/db";
import { refundAbandonedGenerations } from "@/lib/generation";
import { logger } from "@/lib/logger";

export * from "vinext/server/fetch-handler";

type Env = Parameters<typeof resolveConnectionString>[0];
type Context = Parameters<typeof runWithRequestDb>[0]["ctx"];

const FILE_URL = /\.[^/]+$/;

const worker = {
  async fetch(request: Request, env: Env, ctx: Context) {
    try {
      return await runWithRequestDb({
        connectionString: resolveConnectionString(env),
        ctx,
        handler: () => vinext.fetch(request, env, ctx),
      });
    } catch (err) {
      const path = new URL(request.url).pathname;
      const isRead = request.method === "GET" || request.method === "HEAD";
      if (!isRead || !FILE_URL.test(path)) throw err;
      logger.warn({ err, path }, "missing file threw; answered 404");
      return new Response("Not found", { status: 404 });
    }
  },

  async scheduled(_controller: unknown, env: Env, ctx: Context) {
    await runWithJobDb({
      connectionString: resolveConnectionString(env),
      ctx,
      job: () => refundAbandonedGenerations(),
    });
  },
};

export default worker;
