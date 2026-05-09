import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

/**
 * Spin up a fresh in-memory Postgres (PGlite) and apply all Drizzle migrations.
 * Returns a Drizzle instance with the same `schema` shape as production `db`.
 *
 * Use one DB per test (via `beforeEach`) for isolation. Tests run in parallel
 * across files but serially within a file — vitest's `pool: "forks"` keeps
 * test files isolated.
 */
export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  const dir = join(process.cwd(), "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const f of files) {
    const sql = readFileSync(join(dir, f), "utf-8");
    // Drizzle migrations split statements with this marker.
    const statements = sql.split(/--> statement-breakpoint/);
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed) await client.exec(trimmed);
    }
  }

  return { db, client };
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>["db"];
