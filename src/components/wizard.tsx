"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { WizardStepper } from "@/components/wizard-stepper";
import { compressImage } from "@/lib/image/compress";
import { cn } from "@/lib/utils";

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

const SHOT_LABELS = ["Hero feature", "Differentiator", "Another feature"] as const;

const STEP_TITLES = ["App details", "Screenshots", "Style"] as const;
const LAST_STEP = (STEP_TITLES.length - 1) as Step;

type Status = "idle" | "submitting" | "done" | "error";
type Step = 0 | 1 | 2;

type ShotState = {
  file: File | null;
  previewUrl: string | null;
  compressing: boolean;
};

const EMPTY_SHOT: ShotState = {
  file: null,
  previewUrl: null,
  compressing: false,
};

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function Wizard() {
  const [step, setStep] = useState<Step>(0);
  const [appName, setAppName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<string>("");
  const [shots, setShots] = useState<ShotState[]>([
    EMPTY_SHOT,
    EMPTY_SHOT,
    EMPTY_SHOT,
  ]);
  const [preset, setPreset] = useState<StylePresetId | "">("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[] | null>(null);

  const effectivePreset =
    preset || (category ? CATEGORY_DEFAULT_PRESET[category] : "");
  const taglineWords = wordCount(tagline);

  useEffect(() => {
    return () => {
      for (const s of shots) {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      }
    };
    // intentionally only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function compressIntoSlot(idx: number, raw: File) {
    setShots((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return { file: null, previewUrl: null, compressing: true };
      }),
    );
    try {
      const compressed = await compressImage(raw);
      const url = URL.createObjectURL(compressed);
      setShots((prev) =>
        prev.map((s, i) =>
          i === idx
            ? { file: compressed, previewUrl: url, compressing: false }
            : s,
        ),
      );
    } catch {
      setShots((prev) =>
        prev.map((s, i) => (i === idx ? EMPTY_SHOT : s)),
      );
      setError("Couldn't process that image. Try another file.");
    }
  }

  function setShotFile(idx: number, file: File | null) {
    if (!file) {
      setShots((prev) =>
        prev.map((s, i) => {
          if (i !== idx) return s;
          if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
          return EMPTY_SHOT;
        }),
      );
      return;
    }
    void compressIntoSlot(idx, file);
  }

  function fillEmptySlots(files: File[]) {
    const emptyIndices: number[] = [];
    shots.forEach((s, i) => {
      if (!s.file && !s.compressing) emptyIndices.push(i);
    });
    files.slice(0, emptyIndices.length).forEach((f, j) => {
      void compressIntoSlot(emptyIndices[j], f);
    });
  }

  function validateStep(s: Step): string | null {
    if (s === 0) {
      if (!appName.trim()) return "App name is required.";
      if (taglineWords < 5 || taglineWords > 10)
        return "Tagline must be 5–10 words.";
      if (!category) return "Pick a category.";
      return null;
    }
    if (s === 1) {
      for (let i = 0; i < 3; i++) {
        if (shots[i].compressing) return `Screenshot ${i + 1} is still processing — wait a moment.`;
        if (!shots[i].file) return `Upload screenshot ${i + 1}.`;
      }
      return null;
    }
    if (s === 2) {
      if (!effectivePreset) return "Pick a style preset.";
      return null;
    }
    return null;
  }

  function next() {
    setError(null);
    const v = validateStep(step);
    if (v) {
      setError(v);
      return;
    }
    if (step < LAST_STEP) setStep((step + 1) as Step);
  }

  function prev() {
    setError(null);
    if (step > 0) setStep((step - 1) as Step);
  }

  async function onSubmit() {
    setError(null);
    for (const s of [0, 1, 2] as const) {
      const v = validateStep(s);
      if (v) {
        setError(v);
        setStep(s);
        return;
      }
    }
    setStatus("submitting");
    try {
      const fd = new FormData();
      fd.append("appName", appName.trim());
      fd.append("tagline", tagline.trim());
      fd.append("category", category);
      fd.append("stylePreset", effectivePreset);
      shots.forEach((s, i) => {
        if (s.file) fd.append(`screenshot_${i}`, s.file, s.file.name);
      });
      const res = await fetch("/api/generations", {
        method: "POST",
        body: fd,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
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
    setStep(0);
  }

  if (status === "done" && images) {
    return <ResultPanel images={images} appName={appName} onReset={reset} />;
  }

  if (status === "submitting") {
    return <GeneratingPanel />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <WizardStepper current={step} />

      <div className="mt-12 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Step {step + 1} of 4
      </div>
      <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        {STEP_TITLES[step]}
      </h2>

      <Card className="mt-10 border-border/60">
        <CardContent className="space-y-10 p-8 sm:p-12">
          <div>
            {step === 0 && (
              <StepApp
                appName={appName}
                setAppName={setAppName}
                tagline={tagline}
                setTagline={setTagline}
                taglineWords={taglineWords}
                category={category}
                setCategory={(v) => {
                  setCategory(v);
                  setPreset("");
                }}
              />
            )}
            {step === 1 && (
              <StepScreenshots
                shots={shots}
                setShotFile={setShotFile}
                fillEmptySlots={fillEmptySlots}
              />
            )}
            {step === 2 && (
              <StepStyle
                category={category}
                effectivePreset={effectivePreset}
                setPreset={setPreset}
              />
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-6">
            {step > 0 ? (
              <Button variant="outline" onClick={prev}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {step < LAST_STEP ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button onClick={onSubmit} size="lg">
                Generate (1 credit)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepApp({
  appName,
  setAppName,
  tagline,
  setTagline,
  taglineWords,
  category,
  setCategory,
}: {
  appName: string;
  setAppName: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  taglineWords: number;
  category: string;
  setCategory: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="appName">App name</Label>
          <Input
            id="appName"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="My Awesome App"
            autoComplete="off"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent className="dark">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tagline">Tagline</Label>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest",
              taglineWords === 0 && "text-muted-foreground",
              taglineWords > 0 &&
                (taglineWords < 5 || taglineWords > 10) &&
                "text-red-400",
              taglineWords >= 5 && taglineWords <= 10 && "text-emerald-400",
            )}
          >
            {taglineWords}/5–10 words
          </span>
        </div>
        <Input
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="The fastest way to journal on the go"
        />
        <p className="text-xs text-muted-foreground">
          Becomes the hero headline on Shot 1.
        </p>
      </div>
    </div>
  );
}

function StepScreenshots({
  shots,
  setShotFile,
  fillEmptySlots,
}: {
  shots: ShotState[];
  setShotFile: (idx: number, file: File | null) => void;
  fillEmptySlots: (files: File[]) => void;
}) {
  const filled = shots.filter((s) => s.file).length;
  const allFilled = filled === 3;
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tracking-tight">
            {filled}
            <span className="text-muted-foreground"> / 3</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            PNG or JPEG · max 10 MB each. Each role tells the AI which feature
            to highlight.
          </p>
        </div>
        <Button asChild variant="outline" disabled={allFilled}>
          <label className={cn(allFilled && "cursor-not-allowed opacity-50")}>
            Browse
            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) fillEmptySlots(files);
                e.target.value = "";
              }}
            />
          </label>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {SHOT_LABELS.map((label, idx) => (
          <ScreenshotTile
            key={label}
            idx={idx}
            label={label}
            shot={shots[idx]}
            onFile={(f) => setShotFile(idx, f)}
          />
        ))}
      </div>
    </div>
  );
}

function ScreenshotTile({
  idx,
  label,
  shot,
  onFile,
}: {
  idx: number;
  label: string;
  shot: ShotState;
  onFile: (f: File | null) => void;
}) {
  const inputId = `shot-${idx}`;
  return (
    <div className="group/tile space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {String(idx + 1).padStart(2, "0")} · {label}
      </div>
      <div className="relative">
        <label
          htmlFor={inputId}
          className={cn(
            "relative flex aspect-[9/19] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-foreground/[0.02] transition hover:border-foreground/40 hover:bg-foreground/[0.04]",
            shot.previewUrl && "border-solid",
          )}
        >
          {shot.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shot.previewUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : shot.compressing ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
              <span className="text-xs">Processing…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs">Click to upload</span>
            </div>
          )}
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {shot.previewUrl && (
          <button
            type="button"
            aria-label={`Remove screenshot ${idx + 1}`}
            onClick={() => onFile(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur transition hover:bg-background group-hover/tile:opacity-100 focus-visible:opacity-100"
          >
            <span className="text-sm leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  );
}

function StepStyle({
  category,
  effectivePreset,
  setPreset,
}: {
  category: string;
  effectivePreset: string;
  setPreset: (v: StylePresetId) => void;
}) {
  return (
    <div className="space-y-6">
      {category && (
        <p className="text-sm text-muted-foreground">
          Auto-picked for{" "}
          <span className="text-foreground">{category}</span>. Override if
          you&apos;d rather.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(STYLE_PRESETS).map((p) => {
          const active = effectivePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={cn(
                "rounded-xl border p-5 text-left transition",
                active
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <div className="mb-3 flex gap-1.5">
                {p.palette.map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-full border border-foreground/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="font-medium">{p.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.toneModifier}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GeneratingPanel() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-foreground" />
          <span className="font-medium">Generating your set</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Running 4 parallel jobs · 30–90 seconds.
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <span className="block h-full w-1/3 animate-pulse rounded-full bg-foreground" />
        </div>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="relative aspect-[9/19] overflow-hidden rounded-2xl border border-border bg-foreground/[0.03]"
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-foreground/10 via-transparent to-foreground/5" />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 font-mono text-[10px] text-background">
              {String(n).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Status };
