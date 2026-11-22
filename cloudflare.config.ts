import { bindings, defineConfig, defineWorker, triggers } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "shot-studio",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-11-07",
    compatibilityFlags: ["nodejs_compat"],
    observability: { enabled: true },
    domains: ["shotstudio.dev"],
    workersDev: true,
    triggers: [triggers.scheduled({ schedule: "*/5 * * * *" })],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      HYPERDRIVE: bindings.hyperdrive({
        id: "d903c21644534b03b8e0c8d5010545ba",
        dev: { connectionString: "postgresql://ci:ci@localhost:5432/ci" },
      }),
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
