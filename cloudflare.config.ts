import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "shot-studio",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-11-07",
    compatibilityFlags: ["nodejs_compat"],
    observability: { enabled: true },
    // Temporary test hostname: Clerk live keys reject workers.dev. Remove at cutover.
    domains: ["cf-test.shotstudio.dev"],
    // Declaring a domain would otherwise switch workers.dev off.
    workersDev: true,
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // TLS straight to Postgres (no pooler in between), verified against Supabase's private CA.
      // Caching is off: Credits must never be read stale. The address and password live in
      // Cloudflare, not here.
      HYPERDRIVE: bindings.hyperdrive({
        id: "d903c21644534b03b8e0c8d5010545ba",
        // Local previews stay off the real database unless someone points them there.
        dev: { connectionString: "postgresql://ci:ci@localhost:5432/ci" },
      }),
      // The Worker only receives names declared here; undeclared ones are silently undefined.
      CHECKOUT_RATE_LIMIT_PER_HOUR: bindings.secret(),
      CLERK_SECRET_KEY: bindings.secret(),
      CLERK_WEBHOOK_SIGNING_SECRET: bindings.secret(),
      GENERATION_RATE_LIMIT_PER_HOUR: bindings.secret(),
      LOG_LEVEL: bindings.secret(),
      OPENROUTER_API_KEY: bindings.secret(),
      RESEND_API_KEY: bindings.secret(),
      RESEND_FROM_EMAIL: bindings.secret(),
      STRIPE_PRICE_GROWTH: bindings.secret(),
      STRIPE_PRICE_STARTER: bindings.secret(),
      STRIPE_PRICE_STUDIO: bindings.secret(),
      STRIPE_SECRET_KEY: bindings.secret(),
      STRIPE_WEBHOOK_SECRET: bindings.secret(),
      UPSTASH_REDIS_REST_TOKEN: bindings.secret(),
      UPSTASH_REDIS_REST_URL: bindings.secret(),
    },
  }),
});
