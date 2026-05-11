"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  CATEGORY_DEFAULT_PRESET,
  STYLE_PRESETS,
  formatCategory,
  type StylePresetId,
} from "@/lib/generation/presets";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { ResultPanel } from "@/components/result-panel";
import { WizardStepper, WIZARD_STEPS } from "@/components/wizard-stepper";
import { parseApiError } from "@/lib/http";
import { compressImage } from "@/lib/image/compress";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_MAX_CHARS,
  PITCH_MAX_CHARS,
  PITCH_MIN_CHARS,
} from "@/lib/validation/pitch";

const CATEGORIES = Object.keys(CATEGORY_DEFAULT_PRESET);

const SHOT_LABELS = ["Hero feature", "Differentiator", "Another feature"] as const;

const LAST_STEP = (WIZARD_STEPS.length - 1) as Step;

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

export function Wizard() {
  const [step, setStep] = useState<Step>(0);
  const [appName, setAppName] = useState("");
  const [pitch, setPitch] = useState("");
  const [audience, setAudience] = useState("");
  const [category, setCategory] = useState<string>("");
  const [shots, setShots] = useState<ShotState[]>([
    EMPTY_SHOT,
    EMPTY_SHOT,
    EMPTY_SHOT,
  ]);
  const [preset, setPreset] = useState<StylePresetId | "">("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [images, setImages] = useState<string[] | null>(null);

  const effectivePreset =
    preset || (category ? CATEGORY_DEFAULT_PRESET[category] : "");
  const pitchChars = pitch.trim().length;
  const audienceChars = audience.trim().length;

  const shotsRef = useRef(shots);

  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  useEffect(() => {
    return () => {
      for (const s of shotsRef.current) {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      }
    };
  }, []);

  function updateShot(idx: number, updater: (s: ShotState) => ShotState) {
    setShots((prev) => prev.map((s, i) => (i === idx ? updater(s) : s)));
  }

  async function compressIntoSlot(idx: number, raw: File) {
    updateShot(idx, (s) => {
      if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      return { file: null, previewUrl: null, compressing: true };
    });
    try {
      const compressed = await compressImage(raw);
      const url = URL.createObjectURL(compressed);
      updateShot(idx, () => ({
        file: compressed,
        previewUrl: url,
        compressing: false,
      }));
    } catch {
      updateShot(idx, () => EMPTY_SHOT);
      setError("Couldn't process that image. Please try a PNG or JPEG file.");
    }
  }

  function setShotFile(idx: number, file: File | null) {
    if (!file) {
      updateShot(idx, (s) => {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
        return EMPTY_SHOT;
      });
      return;
    }
    void compressIntoSlot(idx, file);
  }

  function fillEmptySlots(files: File[]) {
    const emptyIndices: number[] = [];
    shots.forEach((s, i) => {
      if (!s.file && !s.compressing) emptyIndices.push(i);
    });
    const used = files.slice(0, emptyIndices.length);
    used.forEach((f, j) => {
      void compressIntoSlot(emptyIndices[j], f);
    });
    if (used.length === 0) {
      setNotice(
        `All 3 slots are full. Remove a screenshot to add more — none of the ${files.length} picked were used.`,
      );
    } else if (files.length > used.length) {
      setNotice(
        `Picked ${files.length} — used the first ${used.length}. Remove a screenshot to add more.`,
      );
    } else {
      setNotice(null);
    }
  }

  function validateStep(s: Step): string | null {
    if (s === 0) {
      if (!appName.trim()) return "Please enter an app name.";
      if (pitchChars < PITCH_MIN_CHARS)
        return `Pitch must be at least ${PITCH_MIN_CHARS} characters.`;
      if (pitchChars > PITCH_MAX_CHARS)
        return `Pitch must be ${PITCH_MAX_CHARS} characters or fewer.`;
      if (audienceChars > AUDIENCE_MAX_CHARS)
        return `Audience must be ${AUDIENCE_MAX_CHARS} characters or fewer.`;
      if (!category) return "Please select a category.";
      return null;
    }
    if (s === 1) {
      for (let i = 0; i < 3; i++) {
        if (shots[i].compressing) return `Screenshot ${i + 1} is processing. Please wait.`;
        if (!shots[i].file) return `Please upload screenshot ${i + 1}.`;
      }
      return null;
    }
    if (s === 2) {
      if (!effectivePreset) return "Please select a style preset.";
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
    setNotice(null);
    if (step < LAST_STEP) setStep((step + 1) as Step);
  }

  function prev() {
    setError(null);
    setNotice(null);
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
      fd.append("pitch", pitch.trim());
      if (audience.trim()) fd.append("audience", audience.trim());
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
        throw new Error(
          parseApiError(
            res.status,
            data,
            "Couldn't generate your screenshots. Please try again.",
          ),
        );
      }
      const ok = data as { imageUrls?: string[] };
      if (!ok.imageUrls?.length) {
        throw new Error("Couldn't generate your screenshots. Please try again.");
      }
      setImages(ok.imageUrls);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't generate your screenshots. Please try again.",
      );
    }
  }

  function reset() {
    setStatus("idle");
    setImages(null);
    setError(null);
    setNotice(null);
    setStep(0);
  }

  if (status === "done" && images) {
    return <ResultPanel images={images} appName={appName} onReset={reset} />;
  }

  if (status === "submitting") {
    return <GeneratingPanel />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <WizardStepper current={step} />

      <div className="mt-12 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Step {step + 1} of {WIZARD_STEPS.length}
      </div>
      <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        {WIZARD_STEPS[step]}
      </h2>

      <Card className="mt-10 border-border/60">
        <CardContent className="space-y-10 p-8 sm:p-12">
          <div>
            {step === 0 && (
              <StepApp
                appName={appName}
                setAppName={setAppName}
                pitch={pitch}
                setPitch={setPitch}
                pitchChars={pitchChars}
                audience={audience}
                setAudience={setAudience}
                audienceChars={audienceChars}
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

          {!error && notice && (
            <p className="text-sm text-muted-foreground" role="status">
              {notice}
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
                Generate
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
  pitch,
  setPitch,
  pitchChars,
  audience,
  setAudience,
  audienceChars,
  category,
  setCategory,
}: {
  appName: string;
  setAppName: (v: string) => void;
  pitch: string;
  setPitch: (v: string) => void;
  pitchChars: number;
  audience: string;
  setAudience: (v: string) => void;
  audienceChars: number;
  category: string;
  setCategory: (v: string) => void;
}) {
  const pitchInvalid =
    pitchChars > 0 &&
    (pitchChars < PITCH_MIN_CHARS || pitchChars > PITCH_MAX_CHARS);
  const audienceInvalid = audienceChars > AUDIENCE_MAX_CHARS;
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
          <Combobox
            items={CATEGORIES}
            value={category}
            onValueChange={(v) => setCategory(v ?? "")}
            itemToStringLabel={formatCategory}
          >
            <ComboboxInput id="category" placeholder="Select a category" />
            <ComboboxContent className="dark">
              <ComboboxEmpty>No matching categories. Try a different search.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {formatCategory(item)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pitch">Pitch</Label>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest",
              pitchChars === 0 && "text-muted-foreground",
              pitchInvalid && "text-red-400",
              !pitchInvalid && pitchChars >= PITCH_MIN_CHARS && "text-emerald-400",
            )}
          >
            {pitchChars}/{PITCH_MAX_CHARS}
          </span>
        </div>
        <Textarea
          id="pitch"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder="Track calories by snapping a photo of your meal."
          rows={3}
          maxLength={PITCH_MAX_CHARS + 50}
        />
        <p className="text-xs text-muted-foreground">
          What problem does it solve? One sentence is plenty — we&apos;ll write the headline for you.
        </p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="audience">
            Who is it for?{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest",
              audienceChars === 0 && "text-muted-foreground",
              audienceInvalid && "text-red-400",
              !audienceInvalid && audienceChars > 0 && "text-emerald-400",
            )}
          >
            {audienceChars}/{AUDIENCE_MAX_CHARS}
          </span>
        </div>
        <Input
          id="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Busy parents, fitness coaches, college students"
          maxLength={AUDIENCE_MAX_CHARS + 30}
        />
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
            "relative flex aspect-[1290/2796] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-foreground/[0.02] transition hover:border-foreground/40 hover:bg-foreground/[0.04]",
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
              <span className="text-xs">Processing</span>
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
          <span className="text-foreground">{formatCategory(category)}</span>.
          Override if you&apos;d rather.
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
              <div className="font-medium">{p.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.voice}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {p.typography}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SHOT_OUTPUT_LABELS = [
  "Hero feature",
  "Differentiator",
  "Another feature",
] as const;

function GeneratingPanel() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-foreground" />
          <span className="font-medium">Generating your set</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Running 3 parallel jobs · 30–90 seconds.
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <span className="block h-full w-1/3 animate-pulse rounded-full bg-foreground" />
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {SHOT_OUTPUT_LABELS.map((label, i) => (
          <GeneratingTile key={i} index={i} label={label} />
        ))}
      </div>
    </div>
  );
}

function GeneratingTile({ index, label }: { index: number; label: string }) {
  return (
    <div className="relative aspect-[1290/2796] overflow-hidden rounded-2xl border border-border bg-[#1a1a1a]">
      <DottedGlowBackground
        className="pointer-events-none"
        gap={14}
        radius={1.4}
        colorDarkVar="--color-muted-foreground"
        glowColorDarkVar="--color-muted-foreground"
        colorLightVar="--color-muted-foreground"
        glowColorLightVar="--color-muted-foreground"
        opacity={0.6}
        speedMin={0.3}
        speedMax={1.1}
        speedScale={0.85}
      />
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-xs text-foreground/80">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-foreground/60" />
          <span className="relative inline-block h-2 w-2 rounded-full bg-foreground" />
        </span>
        <span>Creating {label.toLowerCase()}</span>
      </div>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/10 px-3 py-1 font-mono text-[10px] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

