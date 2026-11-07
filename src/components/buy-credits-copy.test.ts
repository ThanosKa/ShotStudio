import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const DIALOGS = ["buy-credits-panel.tsx", "buy-credits-button.tsx"];

describe("buy credits dialogs", () => {
  it.each(DIALOGS)("%s promises the three images a set contains", (file) => {
    const source = readFileSync(
      path.join(process.cwd(), "src/components", file),
      "utf8",
    );

    expect(source).toContain("polished 3-image App Store screenshot set");
    expect(source).not.toContain("4-image");
  });
});
