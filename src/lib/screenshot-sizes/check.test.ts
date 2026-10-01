import { describe, expect, it } from "vitest";
import {
  checkApple,
  checkGooglePlay,
  nearestAppleSizes,
  orientationOf,
  planResize,
  resizeTargets,
  sizeId,
} from "@/lib/screenshot-sizes/check";
import { APPLE_SIZES } from "@/lib/screenshot-sizes/spec";

const png = { mimeType: "image/png", hasAlpha: false };

describe("APPLE_SIZES dataset", () => {
  it("has positive integer sizes and a consistent orientation label", () => {
    for (const s of APPLE_SIZES) {
      expect(Number.isInteger(s.width) && s.width > 0).toBe(true);
      expect(Number.isInteger(s.height) && s.height > 0).toBe(true);
      expect(orientationOf(s)).toBe(s.orientation);
    }
  });

  it("contains the sizes Apple lists for the 6.9-inch display, both orientations", () => {
    const sizes = APPLE_SIZES.filter((s) => s.display === '6.9"').map(sizeId);
    expect(sizes).toEqual(
      expect.arrayContaining([
        "1260x2736",
        "2736x1260",
        "1290x2796",
        "2796x1290",
        "1320x2868",
        "2868x1320",
      ]),
    );
  });

  it("keeps the status-bar variants explicit", () => {
    expect(APPLE_SIZES.some((s) => sizeId(s) === "1136x600")).toBe(true);
    expect(APPLE_SIZES.some((s) => sizeId(s) === "2048x1496")).toBe(true);
  });
});

describe("checkApple", () => {
  it("accepts 1290x2796 PNG and reports the matching display", () => {
    const result = checkApple({ width: 1290, height: 2796, ...png });
    expect(result.accepted).toBe(true);
    expect(result.matches.map((m) => m.display)).toEqual(['6.9"']);
  });

  it("reports every display a shared size belongs to", () => {
    const result = checkApple({ width: 2048, height: 2732, ...png });
    expect(result.matches.map((m) => m.display).sort()).toEqual(['12.9"', '13"']);
  });

  it("rejects an unlisted size", () => {
    const result = checkApple({ width: 1290, height: 2795, ...png });
    expect(result.accepted).toBe(false);
    expect(result.issues.map((i) => i.code)).toEqual(["size"]);
  });

  it("rejects transparency and unsupported formats even at a valid size", () => {
    const alpha = checkApple({ width: 1290, height: 2796, mimeType: "image/png", hasAlpha: true });
    expect(alpha.accepted).toBe(false);
    expect(alpha.issues.map((i) => i.code)).toEqual(["alpha"]);
    const webp = checkApple({ width: 1290, height: 2796, mimeType: "image/webp", hasAlpha: false });
    expect(webp.issues.map((i) => i.code)).toEqual(["format"]);
  });
});

describe("checkGooglePlay", () => {
  it("accepts 1080x1920 and marks it promo eligible", () => {
    const result = checkGooglePlay({ width: 1080, height: 1920, ...png });
    expect(result.accepted).toBe(true);
    expect(result.promoEligible).toBe(true);
  });

  it("flags 1290x2796 as breaking the 2x rule", () => {
    const result = checkGooglePlay({ width: 1290, height: 2796, ...png });
    // 2796 / 1290 = 2.167 > 2, so this common iPhone size fails the 2x rule.
    expect(result.accepted).toBe(false);
    expect(result.issues.map((i) => i.code)).toEqual(["aspect"]);
    expect(result.promoEligible).toBe(false);
  });

  it("accepts a 2:1 image exactly and rejects just beyond it", () => {
    expect(checkGooglePlay({ width: 1000, height: 2000, ...png }).accepted).toBe(true);
    expect(checkGooglePlay({ width: 1000, height: 2001, ...png }).accepted).toBe(false);
  });

  it("enforces the 320 and 3840 pixel limits", () => {
    expect(checkGooglePlay({ width: 319, height: 500, ...png }).issues.map((i) => i.code)).toContain("min-side");
    expect(checkGooglePlay({ width: 2000, height: 3841, ...png }).issues.map((i) => i.code)).toContain("max-side");
    expect(checkGooglePlay({ width: 320, height: 640, ...png }).accepted).toBe(true);
    expect(checkGooglePlay({ width: 2160, height: 3840, ...png }).accepted).toBe(true);
  });

  it("recognises 16:9 landscape promo sizes", () => {
    expect(checkGooglePlay({ width: 1920, height: 1080, ...png }).promoEligible).toBe(true);
    expect(checkGooglePlay({ width: 1280, height: 720, ...png }).promoEligible).toBe(false);
  });

  it("rejects transparency", () => {
    const result = checkGooglePlay({ width: 1080, height: 1920, mimeType: "image/png", hasAlpha: true });
    expect(result.accepted).toBe(false);
    expect(result.issues[0]?.code).toBe("alpha");
  });
});

describe("planResize", () => {
  it("pads a wider-than-target source (contain) and centres it", () => {
    const plan = planResize({
      source: { width: 2000, height: 1000 },
      target: { width: 1000, height: 1000 },
      mode: "contain",
    });
    expect(plan).toMatchObject({ drawWidth: 1000, drawHeight: 500, drawX: 0, drawY: 250 });
    expect(plan.aspectMismatch).toBe(true);
    expect(plan.upscaled).toBe(false);
  });

  it("crops (cover) so the source overflows the canvas evenly", () => {
    const plan = planResize({
      source: { width: 2000, height: 1000 },
      target: { width: 1000, height: 1000 },
      mode: "cover",
    });
    expect(plan).toMatchObject({ drawWidth: 2000, drawHeight: 1000, drawX: -500, drawY: 0 });
  });

  it("is an identity when source already matches the target", () => {
    const plan = planResize({
      source: { width: 1290, height: 2796 },
      target: { width: 1290, height: 2796 },
      mode: "contain",
    });
    expect(plan).toMatchObject({ drawX: 0, drawY: 0, drawWidth: 1290, drawHeight: 2796 });
    expect(plan.aspectMismatch).toBe(false);
    expect(plan.upscaled).toBe(false);
  });

  it("flags upscaling", () => {
    const plan = planResize({
      source: { width: 645, height: 1398 },
      target: { width: 1290, height: 2796 },
      mode: "contain",
    });
    expect(plan.upscaled).toBe(true);
  });

  it("contain always fits inside the canvas, for awkward ratios", () => {
    const plan = planResize({
      source: { width: 1179, height: 2556 },
      target: { width: 1242, height: 2208 },
      mode: "contain",
    });
    expect(plan.drawWidth).toBeLessThanOrEqual(1242);
    expect(plan.drawHeight).toBeLessThanOrEqual(2208);
    expect(plan.drawX).toBeGreaterThanOrEqual(0);
    expect(plan.drawY).toBeGreaterThanOrEqual(0);
  });

  it("rejects non-positive dimensions", () => {
    expect(() =>
      planResize({
        source: { width: 0, height: 10 },
        target: { width: 10, height: 10 },
        mode: "contain",
      }),
    ).toThrow(RangeError);
  });
});

describe("nearestAppleSizes", () => {
  it("returns portrait sizes for a portrait image, closest ratio first", () => {
    const [first, ...rest] = nearestAppleSizes({
      image: { width: 1000, height: 2170 },
      limit: 3,
    });
    expect(first?.orientation).toBe("portrait");
    expect(rest).toHaveLength(2);
  });

  it("returns landscape sizes for a landscape image", () => {
    const sizes = nearestAppleSizes({ image: { width: 2000, height: 1000 }, limit: 5 });
    expect(sizes.every((s) => s.orientation === "landscape")).toBe(true);
  });
});

describe("resizeTargets", () => {
  const targets = resizeTargets();

  it("has unique ids", () => {
    expect(new Set(targets.map((t) => t.id)).size).toBe(targets.length);
  });

  it("merges displays that share a size into one option", () => {
    const shared = targets.find((t) => t.id === "apple-2048x2732");
    expect(shared?.label).toContain('13"');
    expect(shared?.label).toContain('12.9"');
  });

  it("includes the Google Play promo sizes and every Apple size once", () => {
    expect(targets.some((t) => t.id === "google-1080x1920")).toBe(true);
    expect(targets.some((t) => t.id === "google-1920x1080")).toBe(true);
    const distinctApple = new Set(APPLE_SIZES.map(sizeId)).size;
    expect(targets.filter((t) => t.store === "app-store")).toHaveLength(distinctApple);
  });
});
