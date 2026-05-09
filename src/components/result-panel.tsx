"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shotstudio";
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

  function downloadAll() {
    images.forEach((src, i) => {
      downloadDataUrl(src, `${slug}-shot-${i + 1}.png`);
    });
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
          <Button onClick={downloadAll} size="lg">
            Download all
          </Button>
          <Button variant="outline" onClick={onReset}>
            Create another set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
