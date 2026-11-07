import vinext from "vinext/server/fetch-handler";
import { resolveConnectionString, runWithRequestDb } from "@/lib/db";

export * from "vinext/server/fetch-handler";

type Env = Parameters<typeof resolveConnectionString>[0];
type Context = Parameters<typeof runWithRequestDb>[1];

const worker = {
  fetch(request: Request, env: Env, ctx: Context) {
    return runWithRequestDb(resolveConnectionString(env), ctx, () =>
      vinext.fetch(request, env, ctx),
    );
  },
};

export default worker;
