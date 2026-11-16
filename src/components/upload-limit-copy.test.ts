import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/components", "src/app"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    const isSource = /\.tsx?$/.test(entry.name);
    const isTest = /\.test\.tsx?$/.test(entry.name);
    return isSource && !isTest ? [full] : [];
  });
}

describe("upload size copy", () => {
  const files = ROOTS.flatMap((root) => sourceFiles(path.join(process.cwd(), root)));

  it("finds the user-facing sources", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("never promises a 10 MB upload limit", () => {
    const offenders = files.filter((file) =>
      /10\s*mb/i.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });

  it("keeps the wizard hint naming the accepted formats", () => {
    const wizard = readFileSync(
      path.join(process.cwd(), "src/components/wizard.tsx"),
      "utf8",
    );

    expect(wizard).toContain("PNG or JPEG");
  });
});
