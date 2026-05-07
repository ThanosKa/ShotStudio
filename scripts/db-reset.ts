import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL_MIGRATIONS ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_MIGRATIONS or DATABASE_URL must be set");

  const sql = postgres(url, { connect_timeout: 15, prepare: false });
  try {
    await sql.unsafe(`DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
      DROP SCHEMA IF EXISTS drizzle CASCADE;`);
    console.log("public + drizzle schemas dropped and public recreated");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("db reset failed:", err);
  process.exit(1);
});
