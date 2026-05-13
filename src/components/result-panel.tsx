"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shotstudio";
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function ResultPanel({
  images,
  appName,
  onReset,
}: {
  images: string[];
  appName: string;
  onReset: () => void;
}) {
  const slug = slugify(appName);
  const [zipping, setZipping] = useState(false);

  async function downloadAll() {
    setZipping(true);
    try {
      const zip = new JSZip();
      images.forEach((src, i) => {
        zip.file(`${slug}-shot-${i + 1}.png`, dataUrlToBytes(src));
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-shots.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  }

  return (
    <Card className="mx-auto max-w-5xl">
      <CardHeader>
        <CardTitle>Your screenshot set is ready</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Privacy-first · nothing is stored on our side
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Shot ${i + 1}`}
              className="w-full rounded-md border"
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={downloadAll} size="lg" disabled={zipping}>
            {zipping ? "Preparing ZIP…" : "Download all (.zip)"}
          </Button>
          <Button variant="outline" onClick={onReset}>
            Create another set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
