# 0002: Test adapters come from mocking the module file, not from parameters

Status: accepted
Date: 2026-11-15

## Context

Tests need a stand-in for each outside system. The project already gets it by mocking the module file in Vitest: Clerk (`@clerk/nextjs/server`, `@clerk/nextjs/webhooks`), OpenRouter (`@/lib/openrouter`), Redis (`@/lib/redis`), Stripe (`@/lib/stripe`), Cloudflare (`cloudflare:workers`) and the database (`@/lib/db`, backed by in-memory PGlite from `src/lib/db/test-db.ts`). Each of these has a single production implementation.

## Decision

Test adapters keep coming from mocking the module file. No parameter, such as an injected client, is added to an interface only so that tests can pass a fake.

## Rejected alternatives

- **Pass the adapter as a parameter (dependency injection).** With one production implementation, the parameter would exist only for tests. It widens every interface and every caller, and shallow interfaces are what the architecture work removes.

## Exception

The upscale has two production adapters, not one: `src/lib/generation/upscale.ts` (sharp, under Next) and `src/lib/generation/upscale.worker.ts` (the Cloudflare Images binding, on the Worker). The Worker build swaps one for the other at build time, in `vite.config.ts`. That swap is a real seam with two adapters, so it is not a test-only seam and this decision does not cover it. Each adapter has its own tests (`upscale.test.ts`, `upscale.worker.test.ts`).

## Consequences

- A new outside system with a single implementation gets a module file that tests mock; its interface takes no test-only parameters.
- Mock the module by its import path, so the mock applies wherever the module is imported.
