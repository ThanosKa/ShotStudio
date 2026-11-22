import { beforeEach, vi } from "vitest";
import { createTestDb, type TestDb } from "./src/lib/db/test-db";
import * as schema from "./src/lib/db/schema";

process.env.STRIPE_PRICE_STARTER ??= "price_test_starter";
process.env.STRIPE_PRICE_GROWTH ??= "price_test_growth";
process.env.STRIPE_PRICE_STUDIO ??= "price_test_studio";

delete process.env.CLERK_SECRET_KEY;

let currentDb: TestDb;

vi.mock("@/lib/db", () => ({
  get db() {
    return currentDb;
  },
  schema,
  keepRequestAliveUntil: vi.fn(),
}));

const ONE_PX_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

vi.mock("@/lib/openrouter", () => ({
  generateImage: vi.fn(async () => ONE_PX_PNG_B64),
}));

beforeEach(async () => {
  const { db } = await createTestDb();
  currentDb = db;
});
