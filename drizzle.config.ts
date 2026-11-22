import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL_MIGRATIONS ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Set DATABASE_URL_MIGRATIONS or DATABASE_URL to run drizzle-kit.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
