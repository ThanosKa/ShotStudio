"use client";

import { useId, useMemo, useState } from "react";
import {
  checkImage,
  nearestAppleSizes,
  planResize,
  resizeTargets,
  type CheckResult,
  type FitMode,
  type ImageFacts,
} from "@/lib/screenshot-sizes/check";

type Item = {
  id: string;
  file: File;
  facts: ImageFacts;
  result: CheckResult;
};

type Status = { kind: "idle" } | { kind: "busy"; message: string } | { kind: "error"; message: string };

const ALPHA_SCAN_TYPES = ["image/png", "image/webp"];

/** Reads size and transparency in the browser. The file never leaves the device. */
async function readFacts(file: File): Promise<ImageFacts> {
  const bitmap = await createImageBitmap(file);
  try {
    let hasAlpha = false;
    if (ALPHA_SCAN_TYPES.includes(file.type)) {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasAlpha = true;
            break;
          }
        }
      }
    }
    return { width: bitmap.width, height: bitmap.height, mimeType: file.type, hasAlpha };
  } finally {
    bitmap.close();
  }
}

function canvasToBlob({
  canvas,
  type,
}: {
  canvas: HTMLCanvasElement;
  type: "image/png" | "image/jpeg";
}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image."))),
      type,
      type === "image/jpeg" ? 0.95 : undefined,
    );
  });
}

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

const controlClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function ScreenshotSizeChecker() {
  const fileId = useId();
  const targetId = useId();
  const modeId = useId();
  const colorId = useId();
  const formatId = useId();
  const targets = useMemo(() => resizeTargets(), []);

  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [targetKey, setTargetKey] = useState<string>(
    targets.find((t) => t.id === "apple-1290x2796")?.id ?? targets[0]?.id ?? "",
  );
  const [mode, setMode] = useState<FitMode>("contain");
  const [background, setBackground] = useState("#ffffff");
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");

  const target = targets.find((t) => t.id === targetKey);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setStatus({ kind: "busy", message: "Reading images…" });
    const next: Item[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const facts = await readFacts(file);
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          facts,
          result: checkImage(facts),
        });
      } catch {
        failed.push(file.name);
      }
    }
    setItems(next);
    setStatus(
      failed.length > 0
        ? { kind: "error", message: `Could not read: ${failed.join(", ")}. Use PNG or JPEG files.` }
        : { kind: "idle" },
    );
  }

  async function onDownload() {
    if (!target || items.length === 0) return;
    setStatus({ kind: "busy", message: "Building zip…" });
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const extension = format === "image/png" ? "png" : "jpg";
      const used = new Set<string>();
      for (const item of items) {
        const bitmap = await createImageBitmap(item.file);
        try {
          const plan = planResize({
            source: { width: bitmap.width, height: bitmap.height },
            target,
            mode,
          });
          const canvas = document.createElement("canvas");
          canvas.width = plan.canvasWidth;
          canvas.height = plan.canvasHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas is not available in this browser.");
          // Opaque background first: the output must not contain transparency.
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(bitmap, plan.drawX, plan.drawY, plan.drawWidth, plan.drawHeight);
          const blob = await canvasToBlob({ canvas, type: format });
          let name = `${baseName(item.file.name)}-${target.width}x${target.height}.${extension}`;
          for (let n = 2; used.has(name); n += 1) {
            name = `${baseName(item.file.name)}-${target.width}x${target.height}-${n}.${extension}`;
          }
          used.add(name);
          zip.file(name, blob);
        } finally {
          bitmap.close();
        }
      }
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = `screenshots-${target.width}x${target.height}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong building the zip.",
      });
    }
  }

  return (
    <div className="space-y-10">
      <div className="max-w-xl space-y-2">
        <label htmlFor={fileId} className="text-sm font-medium">
          Choose one or more screenshots (PNG or JPEG)
        </label>
        <input
          id={fileId}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => void onFiles(e.currentTarget.files)}
          className={`${controlClass} py-2`}
        />
        <p className="text-sm text-muted-foreground">
          Images are read in your browser and never uploaded.
        </p>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
        {status.kind === "busy" ? status.message : ""}
      </p>
      {status.kind === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {status.message}
        </p>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Screenshot checks against App Store Connect and Google Play requirements
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-3 pr-4 font-semibold">File</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Size</th>
                <th scope="col" className="py-3 pr-4 font-semibold">App Store</th>
                <th scope="col" className="py-3 font-semibold">Google Play</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const { apple, googlePlay } = item.result;
                const nearest = nearestAppleSizes({ image: item.facts, limit: 1 })[0];
                return (
                  <tr key={item.id} className="border-b align-top">
                    <th scope="row" className="py-4 pr-4 font-medium break-all">{item.file.name}</th>
                    <td className="py-4 pr-4 whitespace-nowrap">
                      {item.facts.width}×{item.facts.height}
                      <span className="block text-muted-foreground">
                        {item.facts.mimeType.replace("image/", "").toUpperCase()}
                        {item.facts.hasAlpha ? ", transparent" : ""}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <strong>{apple.accepted ? "Accepted" : "Not accepted"}</strong>
                      {apple.matches.length > 0 && (
                        <span className="block text-muted-foreground">
                          {apple.matches
                            .map((m) => `${m.family} ${m.display} ${m.orientation}`)
                            .join(", ")}
                        </span>
                      )}
                      {apple.issues.map((issue) => (
                        <span key={issue.code} className="block text-muted-foreground">
                          {issue.message}
                        </span>
                      ))}
                      {!apple.matches.length && nearest && (
                        <span className="block text-muted-foreground">
                          Closest shape: {nearest.width}×{nearest.height} ({nearest.family} {nearest.display}).
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <strong>{googlePlay.accepted ? "Accepted" : "Not accepted"}</strong>
                      {googlePlay.accepted && (
                        <span className="block text-muted-foreground">
                          {googlePlay.promoEligible
                            ? "Meets the promotion size (9:16 or 16:9)."
                            : "Valid, but not 9:16 or 16:9 promotion size."}
                        </span>
                      )}
                      {googlePlay.issues.map((issue) => (
                        <span key={issue.code} className="block text-muted-foreground">
                          {issue.message}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && target && (
        <fieldset className="max-w-2xl space-y-5 rounded-xl border p-6">
          <legend className="px-2 text-sm font-semibold">Resize to a required size (optional)</legend>
          <div className="space-y-2">
            <label htmlFor={targetId} className="text-sm font-medium">Target size</label>
            <select
              id={targetId}
              value={targetKey}
              onChange={(e) => setTargetKey(e.currentTarget.value)}
              className={controlClass}
            >
              <optgroup label="App Store Connect">
                {targets.filter((t) => t.store === "app-store").map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
              <optgroup label="Google Play">
                {targets.filter((t) => t.store === "google-play").map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor={modeId} className="text-sm font-medium">Fit</label>
              <select
                id={modeId}
                value={mode}
                onChange={(e) => setMode(e.currentTarget.value === "cover" ? "cover" : "contain")}
                className={controlClass}
              >
                <option value="contain">Pad (keep everything)</option>
                <option value="cover">Crop (fill the frame)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor={colorId} className="text-sm font-medium">Padding colour</label>
              <input
                id={colorId}
                type="color"
                value={background}
                onChange={(e) => setBackground(e.currentTarget.value)}
                className={`${controlClass} p-1`}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={formatId} className="text-sm font-medium">File type</label>
              <select
                id={formatId}
                value={format}
                onChange={(e) => setFormat(e.currentTarget.value === "image/jpeg" ? "image/jpeg" : "image/png")}
                className={controlClass}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG (never has an alpha channel)</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            The image is never stretched. Pad adds a solid border; crop trims the edges. Upscaling
            small images softens them, so start from the largest capture you have. PNG output is fully
            opaque; pick JPEG if App Store Connect still reports an alpha channel.
          </p>
          <button
            type="button"
            onClick={() => void onDownload()}
            disabled={status.kind === "busy"}
            className="inline-flex h-11 cursor-pointer items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download {items.length} resized {items.length === 1 ? "image" : "images"} as zip
          </button>
        </fieldset>
      )}
    </div>
  );
}
