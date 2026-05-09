import { beforeEach, vi } from "vitest";
import { createTestDb, type TestDb } from "./src/lib/db/test-db";
import * as schema from "./src/lib/db/schema";

// Mutable holder so `beforeEach` can swap in a fresh DB per test without
// re-mocking. The `get db()` accessor below reads the live value.
let currentDb: TestDb;

vi.mock("@/lib/db", () => ({
  get db() {
    return currentDb;
  },
  schema,
}));

// 1×1 transparent PNG in base64. Lets sharp.upscaleToAppStore run on real
// bytes without hitting the network; tests that need OpenRouter to throw or
// return specific data override this via `vi.mocked(generateImage)`.
const ONE_PX_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

vi.mock("@/lib/openrouter", () => ({
  generateImage: vi.fn(async () => ONE_PX_PNG_B64),
}));

beforeEach(async () => {
  const { db } = await createTestDb();
  currentDb = db;
});
