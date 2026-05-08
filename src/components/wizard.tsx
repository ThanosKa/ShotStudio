"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_DEFAULT_PRESET,
  STYLE_PRESETS,
  type StylePresetId,
} from "@/lib/generation/presets";
import { ResultPanel } from "@/components/result-panel";

const CATEGORIES = [
  "productivity",
  "wellness",
  "finance",
  "games",
  "social",
  "education",
  "lifestyle",
  "dev tools",
  "other",
] as const;

type Status = "idle" | "submitting" | "done" | "error";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function Wizard() {
  const [appName, setAppName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<string>("");
  const [shots, setShots] = useState<(File | null)[]>([null, null, null]);
  const [headlines, setHeadlines] = useState<string[]>(["", "", ""]);
  const [preset, setPreset] = useState<StylePresetId | "">("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[] | null>(null);

  const effectivePreset =
    preset || (category ? CATEGORY_DEFAULT_PRESET[category] : "");

  function setShotAt(idx: number, file: File | null) {
    setShots((prev) => prev.map((s, i) => (i === idx ? file : s)));
  }
  function setHeadlineAt(idx: number, value: string) {
    setHeadlines((prev) => prev.map((h, i) => (i === idx ? value : h)));
  }

  function validate(): string | null {
    if (!appName.trim()) return "App name is required.";
    const tw = wordCount(tagline);
    if (tw < 5 || tw > 10) return "Tagline must be 5–10 words.";
    if (!category) return "Pick a category.";
    if (shots.some((s) => !s)) return "Upload all 3 screenshots.";
    for (let i = 0; i < 3; i++) {
      const f = shots[i]!;
      if (!["image/png", "image/jpeg"].includes(f.type))
        return `Screenshot ${i + 1} must be PNG or JPEG.`;
      if (f.size > 10 * 1024 * 1024)
        return `Screenshot ${i + 1} is over 10 MB.`;
    }
    for (let i = 0; i < 3; i++) {
      const h = headlines[i].trim();
      if (h) {
        const w = wordCount(h);
        if (w < 3 || w > 6) return `Shot ${i + 1} headline must be 3–6 words.`;
      }
    }
    if (!effectivePreset) return "Pick a style preset.";
    return null;
  }

  async function onSubmit() {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setStatus("submitting");
    try {
      const screenshots = await Promise.all(
        shots.map((f) => fileToBase64(f!)),
      );
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: appName.trim(),
          tagline: tagline.trim(),
          category,
          stylePreset: effectivePreset,
          headlines: headlines.map((h) => h.trim() || undefined),
          screenshots,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        const msg =
          data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Generation failed (${res.status})`;
        throw new Error(msg);
      }
      const ok = data as { imageUrls?: string[] };
      if (!ok.imageUrls || ok.imageUrls.length !== 4) {
        throw new Error("Generation returned no images.");
      }
      setImages(ok.imageUrls);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function reset() {
    setStatus("idle");
    setImages(null);
    setError(null);
  }

  if (status === "done" && images) {
    return <ResultPanel images={images} appName={appName} onReset={reset} />;
  }

  const submitting = status === "submitting";

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>New screenshot set</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            1 · About your app
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="appName">App name</Label>
            <Input
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Quill"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tagline">Tagline (5–10 words)</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="The fastest way to journal on the go"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPreset("");
              }}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            2 · Upload 3 screenshots
          </h3>
          {(["Hero feature", "Differentiator", "Another feature"] as const).map(
            (label, idx) => (
              <div key={label} className="grid gap-2">
                <Label>{label}</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) =>
                    setShotAt(idx, e.target.files?.[0] ?? null)
                  }
                  disabled={submitting}
                />
                <Input
                  placeholder="Optional headline (3–6 words)"
                  value={headlines[idx]}
                  onChange={(e) => setHeadlineAt(idx, e.target.value)}
                  disabled={submitting}
                />
              </div>
            ),
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            3 · Style
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(STYLE_PRESETS).map((p) => {
              const active = effectivePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  disabled={submitting}
                  className={`rounded-lg border p-4 text-left transition ${
                    active ? "border-foreground" : "border-border"
                  }`}
                >
                  <div className="mb-2 flex gap-1">
                    {p.palette.map((c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium">{p.label}</div>
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Generation takes 30–90 seconds. Don&apos;t close this tab.
          </p>
          <Button onClick={onSubmit} disabled={submitting} size="lg">
            {submitting ? "Generating…" : "Generate (1 credit)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export type { Status };
