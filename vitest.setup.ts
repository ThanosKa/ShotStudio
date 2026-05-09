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

beforeEach(async () => {
  const { db } = await createTestDb();
  currentDb = db;
});
