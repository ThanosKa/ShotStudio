import {
  APPLE_SIZES,
  GOOGLE_PLAY_RULES,
  type AppleSize,
  type Orientation,
} from "@/lib/screenshot-sizes/spec";

/** What the browser can tell us about one uploaded image. */
export type ImageFacts = {
  width: number;
  height: number;
  /** MIME type, e.g. "image/png". */
  mimeType: string;
  /** True when at least one pixel is not fully opaque. Unknown formats pass false. */
  hasAlpha: boolean;
};

export type Issue = { code: string; message: string };

export type AppleResult = {
  /** Every Apple size the image already matches exactly. */
  matches: AppleSize[];
  /** True when there is at least one exact match and no blocking issue. */
  accepted: boolean;
  issues: Issue[];
};

export type GooglePlayResult = {
  accepted: boolean;
  issues: Issue[];
  /** 9:16 portrait at least 1080x1920, or 16:9 landscape at least 1920x1080. */
  promoEligible: boolean;
};

export type CheckResult = { apple: AppleResult; googlePlay: GooglePlayResult };

export function orientationOf({
  width,
  height,
}: {
  width: number;
  height: number;
}): Orientation | "square" {
  if (width === height) return "square";
  return height > width ? "portrait" : "landscape";
}

function formatIssues({
  mimeType,
  hasAlpha,
  formats,
  allowsAlpha,
  store,
}: {
  mimeType: string;
  hasAlpha: boolean;
  formats: readonly string[];
  allowsAlpha: boolean;
  store: string;
}): Issue[] {
  const issues: Issue[] = [];
  if (!formats.includes(mimeType)) {
    issues.push({
      code: "format",
      message: `${store} accepts JPEG or PNG; this file is ${mimeType || "an unknown type"}.`,
    });
  }
  if (hasAlpha && !allowsAlpha) {
    issues.push({
      code: "alpha",
      message: `${store} does not allow transparency; this image has transparent pixels.`,
    });
  }
  return issues;
}

export function checkApple(image: ImageFacts): AppleResult {
  const matches = APPLE_SIZES.filter(
    (s) => s.width === image.width && s.height === image.height,
  );
  const issues = formatIssues({
    mimeType: image.mimeType,
    hasAlpha: image.hasAlpha,
    formats: ["image/jpeg", "image/png"],
    allowsAlpha: false,
    store: "App Store Connect",
  });
  if (matches.length === 0) {
    issues.push({
      code: "size",
      message: `${image.width}×${image.height} is not an accepted App Store screenshot size.`,
    });
  }
  return { matches, accepted: issues.length === 0, issues };
}

export function checkGooglePlay(image: ImageFacts): GooglePlayResult {
  const rules = GOOGLE_PLAY_RULES;
  const issues = formatIssues({
    mimeType: image.mimeType,
    hasAlpha: image.hasAlpha,
    formats: rules.formats,
    allowsAlpha: rules.allowsAlpha,
    store: "Google Play",
  });
  const min = Math.min(image.width, image.height);
  const max = Math.max(image.width, image.height);
  if (min < rules.minSide) {
    issues.push({
      code: "min-side",
      message: `Shortest side is ${min}px; Google Play needs at least ${rules.minSide}px.`,
    });
  }
  if (max > rules.maxSide) {
    issues.push({
      code: "max-side",
      message: `Longest side is ${max}px; Google Play allows at most ${rules.maxSide}px.`,
    });
  }
  if (min > 0 && max / min > rules.maxAspectRatio) {
    issues.push({
      code: "aspect",
      message: `The longest side is more than ${rules.maxAspectRatio}× the shortest side.`,
    });
  }
  return {
    accepted: issues.length === 0,
    issues,
    promoEligible: isPromoEligible(image),
  };
}

function isPromoEligible({ width, height }: { width: number; height: number }): boolean {
  const { portrait, landscape } = GOOGLE_PLAY_RULES.promo;
  // Exact ratio on integers: 9:16 is width*16 === height*9.
  if (height > width) {
    return width * 16 === height * 9 && width >= portrait.width && height >= portrait.height;
  }
  return width * 9 === height * 16 && width >= landscape.width && height >= landscape.height;
}

export function checkImage(image: ImageFacts): CheckResult {
  return { apple: checkApple(image), googlePlay: checkGooglePlay(image) };
}

export type FitMode = "contain" | "cover";

export type ResizePlan = {
  canvasWidth: number;
  canvasHeight: number;
  /** Where and how large the source is drawn on the canvas. */
  drawX: number;
  drawY: number;
  drawWidth: number;
  drawHeight: number;
  /** "contain" pads with a background colour; "cover" crops the overflow. */
  mode: FitMode;
  /** True when source and target aspect ratios differ by more than 1%. */
  aspectMismatch: boolean;
  /** True when the source is drawn larger than its native size. */
  upscaled: boolean;
};

/**
 * Where to draw a source image on a target-size canvas. Never distorts: the
 * source keeps its aspect ratio and is either padded (contain) or cropped
 * (cover). Draw rectangles are rounded to whole pixels and clamped so the
 * result always fills exactly the target size.
 */
export function planResize({
  source,
  target,
  mode,
}: {
  source: { width: number; height: number };
  target: { width: number; height: number };
  mode: FitMode;
}): ResizePlan {
  if (
    source.width <= 0 ||
    source.height <= 0 ||
    target.width <= 0 ||
    target.height <= 0
  ) {
    throw new RangeError("Source and target dimensions must be positive.");
  }
  const scaleX = target.width / source.width;
  const scaleY = target.height / source.height;
  const scale = mode === "contain" ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  const drawWidth = Math.round(source.width * scale);
  const drawHeight = Math.round(source.height * scale);
  const sourceRatio = source.width / source.height;
  const targetRatio = target.width / target.height;
  return {
    canvasWidth: target.width,
    canvasHeight: target.height,
    drawWidth,
    drawHeight,
    drawX: Math.round((target.width - drawWidth) / 2),
    drawY: Math.round((target.height - drawHeight) / 2),
    mode,
    aspectMismatch: Math.abs(sourceRatio / targetRatio - 1) > 0.01,
    upscaled: scale > 1,
  };
}

/** Apple sizes ordered by how close their aspect ratio is to the image's, nearest first. */
export function nearestAppleSizes({
  image,
  limit,
}: {
  image: { width: number; height: number };
  limit: number;
}): AppleSize[] {
  const ratio = image.width / image.height;
  const wantsPortrait = image.height >= image.width;
  return APPLE_SIZES.filter((s) => (s.orientation === "portrait") === wantsPortrait)
    .map((s) => ({ s, diff: Math.abs(s.width / s.height / ratio - 1) }))
    .sort((a, b) => a.diff - b.diff || b.s.width - a.s.width)
    .slice(0, limit)
    .map((x) => x.s);
}

/** Stable id for a size, used as a form value and in zip file names. */
export function sizeId({ width, height }: { width: number; height: number }): string {
  return `${width}x${height}`;
}

export type ResizeTarget = {
  id: string;
  label: string;
  width: number;
  height: number;
  store: "app-store" | "google-play";
};

/**
 * Every size the tool can resize to: each distinct App Store size (labelled
 * with all the displays that accept it) plus the two Google Play promo sizes.
 */
export function resizeTargets(): ResizeTarget[] {
  const byId = new Map<string, { size: AppleSize; labels: string[] }>();
  for (const size of APPLE_SIZES) {
    const id = sizeId(size);
    const label = `${size.family} ${size.display}${size.variant ? ` ${size.variant}` : ""}`;
    const entry = byId.get(id);
    if (entry) {
      if (!entry.labels.includes(label)) entry.labels.push(label);
    } else {
      byId.set(id, { size, labels: [label] });
    }
  }
  const apple: ResizeTarget[] = [...byId.entries()].map(([id, { size, labels }]) => ({
    id: `apple-${id}`,
    label: `${size.width}×${size.height} ${size.orientation} · App Store · ${labels.join(", ")}`,
    width: size.width,
    height: size.height,
    store: "app-store",
  }));
  const { portrait, landscape } = GOOGLE_PLAY_RULES.promo;
  const google: ResizeTarget[] = [
    {
      id: `google-${sizeId(portrait)}`,
      label: `${portrait.width}×${portrait.height} portrait · Google Play · 9:16, promo eligible`,
      width: portrait.width,
      height: portrait.height,
      store: "google-play",
    },
    {
      id: `google-${sizeId(landscape)}`,
      label: `${landscape.width}×${landscape.height} landscape · Google Play · 16:9, promo eligible`,
      width: landscape.width,
      height: landscape.height,
      store: "google-play",
    },
  ];
  return [...apple, ...google];
}
