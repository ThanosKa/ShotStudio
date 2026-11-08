// Fails a Worker build that would break in production while building cleanly:
// - sharp in the bundle (Workers cannot load it; only Generation would fail),
// - no Clerk publishable key baked in (NEXT_PUBLIC_* come from the build's env).
// Run after `pnpm build:vinext`, with the same env. Prints no values.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const bundle = process.argv[2] ?? ".cloudflare/output/v0/workers/default/bundle";
const files = readdirSync(bundle, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith(".js"))
  .map((f) => join(bundle, f));
const code = files.map((f) => readFileSync(f, "utf8"));
const problems = [];

if (code.some((c) => c.includes('Could not load the "sharp" module'))) {
  problems.push("sharp is in the Worker bundle (see the upscale plugin in vite.config.ts)");
}

const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? readKeyFromEnvFile();
if (!key) {
  problems.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set for this build");
} else if (!code.some((c) => c.includes(key))) {
  problems.push("the Clerk publishable key is not in the Worker bundle");
}

function readKeyFromEnvFile() {
  try {
    const line = readFileSync(".env.production.local", "utf8")
      .split("\n")
      .find((l) => l.startsWith("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="));
    return line?.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`check-worker-bundle: ${p}`);
  process.exit(1);
}
console.log(`check-worker-bundle: ok (${files.length} files)`);
