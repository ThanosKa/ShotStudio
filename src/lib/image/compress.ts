const MAX_EDGE = 1536;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_EDGE / longest);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("OffscreenCanvas 2D context unavailable");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: QUALITY,
    });

    const base = file.name.replace(/\.[^.]+$/, "") || "screenshot";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
