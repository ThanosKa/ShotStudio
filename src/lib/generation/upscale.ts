import sharp from "sharp";

const APP_STORE_PORTRAIT_W = 1290;
const APP_STORE_PORTRAIT_H = 2796;

export async function upscaleToAppStore(b64: string): Promise<Buffer> {
  const input = Buffer.from(b64, "base64");
  return sharp(input)
    .resize(APP_STORE_PORTRAIT_W, APP_STORE_PORTRAIT_H, {
      fit: "cover",
      position: "centre",
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}
