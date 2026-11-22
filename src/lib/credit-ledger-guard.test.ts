import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const LEDGER = "src/lib/credits.ts";
const SCANNED_DIRS = ["src", "scripts", "worker", "emails"];
const CODE_FILE = /\.(ts|tsx|mjs|js)$/;
const TEST_FILE = /(\.test\.|\.spec\.|[\\/]test-db\.)/;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

function callArgs(source: string, open: number): string {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")" && --depth === 0) return source.slice(open, i + 1);
  }
  return source.slice(open);
}

function statementFrom(source: string, start: number): string {
  const end = source.indexOf(";", start);
  return source.slice(start, end === -1 ? undefined : end);
}

export function findLedgerViolations(rawSource: string): string[] {
  const source = stripComments(rawSource);
  const found: string[] = [];

  for (const m of source.matchAll(/\.update\(\s*users\s*\)/g)) {
    const rest = statementFrom(source, m.index);
    const set = rest.indexOf(".set(");
    if (set !== -1 && /\bcredits\b/.test(callArgs(rest, set + ".set".length))) {
      found.push("writes users.credits with update(users).set(...)");
    }
  }

  for (const m of source.matchAll(/\.insert\(\s*users\s*\)/g)) {
    const withoutZero = statementFrom(source, m.index).replace(/\bcredits\s*:\s*0\b/g, "");
    if (/\bcredits\b/.test(withoutZero)) {
      found.push("inserts a users row with a balance other than 0");
    }
  }

  if (/\.insert\(\s*transactions\s*\)/.test(source)) {
    found.push("inserts a Transaction with insert(transactions)");
  }

  if (/\bupdate\s+"?users"?\s+set\b[^;]*\bcredits\b/i.test(source)) {
    found.push("writes users.credits with raw SQL");
  }
  if (/\binsert\s+into\s+"?transactions"?/i.test(source)) {
    found.push("inserts a Transaction with raw SQL");
  }

  return found;
}

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== "node_modules") out.push(...collectFiles(full));
    } else if (CODE_FILE.test(name) && !TEST_FILE.test(full)) {
      out.push(full);
    }
  }
  return out;
}

describe("Credit Ledger guard", () => {
  test("nothing outside the Credit Ledger writes a balance or inserts a Transaction", () => {
    const files = SCANNED_DIRS.flatMap((d) => collectFiles(path.join(ROOT, d)));
    expect(files.length).toBeGreaterThan(50);

    const violations = files
      .map((f) => path.relative(ROOT, f).split(path.sep).join("/"))
      .filter((rel) => rel !== LEDGER)
      .flatMap((rel) =>
        findLedgerViolations(readFileSync(path.join(ROOT, rel), "utf8")).map(
          (why) => `${rel}: ${why}`,
        ),
      );

    expect(violations).toEqual([]);
  });

  test("the scan reads the Ledger itself, so it would notice the patterns", () => {
    const ledger = readFileSync(path.join(ROOT, LEDGER), "utf8");
    expect(findLedgerViolations(ledger).length).toBeGreaterThan(0);
  });

  describe("detector", () => {
    test("flags a balance update", () => {
      const src = "await db.update(users).set({ credits: sql`${users.credits} + 1` }).where(x);";
      expect(findLedgerViolations(src)).toHaveLength(1);
    });
    test("flags a Transaction insert", () => {
      expect(findLedgerViolations("await tx.insert(transactions).values({});")).toHaveLength(1);
    });
    test("flags a new User row with a balance", () => {
      expect(findLedgerViolations("db.insert(users).values({ id, credits: 5 });")).toHaveLength(1);
    });
    test("flags raw SQL", () => {
      expect(findLedgerViolations('sql`update users set credits = 9`')).toHaveLength(1);
      expect(findLedgerViolations('sql`insert into "transactions" (x) values (1)`')).toHaveLength(1);
    });
    test("ignores credits: 0, other user updates, reads and comments", () => {
      expect(findLedgerViolations("db.insert(users).values({ id, email, credits: 0 });")).toEqual([]);
      expect(
        findLedgerViolations("db.update(users).set({ email }).returning({ credits: users.credits });"),
      ).toEqual([]);
      expect(findLedgerViolations("db.select({ credits: users.credits }).from(users);")).toEqual([]);
      expect(findLedgerViolations("// db.insert(transactions).values({})\n")).toEqual([]);
    });
  });
});
