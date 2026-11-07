import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { upscaleToAppStore } from "./upscale";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RED = { r: 255, g: 0, b: 0 };
const GREEN = { r: 0, g: 255, b: 0 };

// A 1024x1536 image cover-fitted to 1290x2796 keeps the centre 709px of width,
// so a centre crop drops about 157px from each side. Red side bands of 150px
// are therefore all cut, and any off-centre crop would leave red at an edge.
async function sideBandedImageB64(): Promise<string> {
  const png = await sharp({
    create: { width: 1024, height: 1536, channels: 3, background: GREEN },
  })
    .composite(
      [0, 874].map((left) => ({
        input: {
          create: { width: 150, height: 1536, channels: 3 as const, background: RED },
        },
        left,
        top: 0,
      })),
    )
    .png()
    .toBuffer();
  return png.toString("base64");
}

async function pixelAt(png: Buffer, left: number, top: number) {
  const { data } = await sharp(png)
    .extract({ left, top, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

describe("upscaleToAppStore (Next runtime)", () => {
  test("turns an image of another shape into a 1290x2796 PNG, cropped from the centre", async () => {
    const png = await upscaleToAppStore(await sideBandedImageB64());

    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
    const meta = await sharp(png).metadata();
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(1290);
    expect(meta.height).toBe(2796);
    expect(await pixelAt(png, 0, 1398)).toEqual(GREEN);
    expect(await pixelAt(png, 1289, 1398)).toEqual(GREEN);
  });
});
