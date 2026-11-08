import vinext from "vinext/server/fetch-handler";
import { resolveConnectionString, runWithJobDb, runWithRequestDb } from "@/lib/db";
import { refundAbandonedGenerations } from "@/lib/generation";

export * from "vinext/server/fetch-handler";

type Env = Parameters<typeof resolveConnectionString>[0];
type Context = Parameters<typeof runWithRequestDb>[1];

// The URLs `src/proxy.ts` skips. vinext renders a missing one's 404 inside a
// layout that needs Clerk's middleware, so it throws where Next answers 404.
const FILE_URL =
  /\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$/;

const worker = {
  async fetch(request: Request, env: Env, ctx: Context) {
    try {
      return await runWithRequestDb(resolveConnectionString(env), ctx, () =>
        vinext.fetch(request, env, ctx),
      );
    } catch (err) {
      if (!FILE_URL.test(new URL(request.url).pathname)) throw err;
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
