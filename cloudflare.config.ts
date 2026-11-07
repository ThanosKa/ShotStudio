import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "shot-studio",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-07",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // The Worker only receives names declared here; undeclared ones are silently undefined.
      CHECKOUT_RATE_LIMIT_PER_HOUR: bindings.secret(),
      CLERK_SECRET_KEY: bindings.secret(),
      CLERK_WEBHOOK_SIGNING_SECRET: bindings.secret(),
      DATABASE_URL: bindings.secret(),
      DATABASE_URL_MIGRATIONS: bindings.secret(),
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
