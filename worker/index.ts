import vinext from "vinext/server/fetch-handler";
import { resolveConnectionString, runWithJobDb, runWithRequestDb } from "@/lib/db";
import { refundAbandonedGenerations } from "@/lib/generation";
import { logger } from "@/lib/logger";

export * from "vinext/server/fetch-handler";

type Env = Parameters<typeof resolveConnectionString>[0];
type Context = Parameters<typeof runWithRequestDb>[1];

// A read of a file-like URL (the last segment has a dot). No page of the app
// has one, so a throw here is a missing file, not a broken page. A file route
// that breaks (`/sitemap.xml`, `/icon.svg`) also lands here: the warning below
// is how anyone finds out.
// `app/global-not-found.tsx` is the real fix for the scanner URLs that threw
// (the proxy's matcher skips them, and the old 404 needed Clerk's middleware);
// this keeps them at 404, with a log, if a missing file ever throws again.
const FILE_URL = /\.[^/]+$/;

const worker = {
  async fetch(request: Request, env: Env, ctx: Context) {
    try {
      return await runWithRequestDb(resolveConnectionString(env), ctx, () =>
        vinext.fetch(request, env, ctx),
      );
    } catch (err) {
      const path = new URL(request.url).pathname;
      const isRead = request.method === "GET" || request.method === "HEAD";
      if (!isRead || !FILE_URL.test(path)) throw err;
      logger.warn({ err, path }, "missing file threw; answered 404");
      return new Response("Not found", { status: 404 });
    }
  },

  // The Cron Trigger in `cloudflare.config.ts`: refunds Generations whose run
  // was cancelled before it could record an outcome.
  async scheduled(_controller: unknown, env: Env, ctx: Context) {
    await runWithJobDb(resolveConnectionString(env), ctx, () => refundAbandonedGenerations());
  },
};

export default worker;
