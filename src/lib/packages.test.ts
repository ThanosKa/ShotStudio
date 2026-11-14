import { describe, expect, it } from "vitest";
import { CREDIT_PACKAGE_LIST, packBlurb } from "@/lib/packages";

describe("packBlurb", () => {
  it.each(CREDIT_PACKAGE_LIST)(
    "$id names the pack's own Credits as Sets",
    (pack) => {
      expect(packBlurb(pack)).toMatch(new RegExp(`^${pack.credits} sets\\b`));
    },
  );

  it("follows the pack data when Credits change", () => {
    const pack = { ...CREDIT_PACKAGE_LIST[0], credits: 99 };
    expect(packBlurb(pack)).toMatch(/^99 sets\b/);
  });

  it("says one set, not one sets, for a single Credit", () => {
    const pack = { ...CREDIT_PACKAGE_LIST[0], credits: 1 };
    expect(packBlurb(pack)).toMatch(/^1 set\b(?!s)/);
  });

  it("keeps a pack's purpose phrase when it has one", () => {
    const pack = { ...CREDIT_PACKAGE_LIST[0], purpose: "for testing" };
    expect(packBlurb(pack)).toBe(`${pack.credits} sets — for testing`);
  });
});
