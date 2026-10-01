/**
 * Store screenshot specifications, transcribed from the official pages.
 *
 * Sources (fetched 2026-10-01 with WebFetch; the Apple page was re-fetched
 * and read verbatim after a first summarised pass disagreed with it, so the
 * numbers below are the verbatim ones):
 *  - Apple: https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
 *  - Google Play: https://support.google.com/googleplay/android-developer/answer/9866151
 *
 * Scope: iPhone and iPad for the App Store; phone and tablet rules for Google
 * Play. Mac, Apple TV, Vision Pro, Apple Watch, iPhone Duo (not yet uploadable
 * per Apple) and the Wear OS / TV / Automotive / XR Play surfaces are left out
 * on purpose: the tool does not claim anything it has not verified.
 *
 * When Apple or Google change a page, edit this file and the fetch date above.
 */

export type Orientation = "portrait" | "landscape";

export type AppleSize = {
  /** Display class, e.g. `6.9"`. */
  display: string;
  family: "iPhone" | "iPad";
  width: number;
  height: number;
  orientation: Orientation;
  /** Qualifier Apple prints next to the size, e.g. "with status bar". */
  variant?: string;
};

type AppleDisplay = {
  display: string;
  family: "iPhone" | "iPad";
  /** Every size row Apple lists for the display, in page order. */
  sizes: { width: number; height: number; variant?: string }[];
  /** Apple's "Requirement" line, when the page has one. */
  requirement?: string;
};

/** Apple's page lists both orientations for every row; we store the portrait rows and derive landscape. */
const APPLE_DISPLAYS: readonly AppleDisplay[] = [
  {
    display: '6.9"',
    family: "iPhone",
    sizes: [
      { width: 1260, height: 2736 },
      { width: 1290, height: 2796 },
      { width: 1320, height: 2868 },
    ],
  },
  {
    display: '6.5"',
    family: "iPhone",
    sizes: [
      { width: 1284, height: 2778 },
      { width: 1242, height: 2688 },
    ],
    requirement:
      'Required if the app runs on iPhone and screenshots for the 6.9" display are not provided',
  },
  {
    display: '6.3"',
    family: "iPhone",
    sizes: [
      { width: 1179, height: 2556 },
      { width: 1206, height: 2622 },
    ],
  },
  {
    display: '6.1"',
    family: "iPhone",
    sizes: [
      { width: 1170, height: 2532 },
      { width: 1125, height: 2436 },
      { width: 1080, height: 2340 },
    ],
  },
  {
    display: '5.5"',
    family: "iPhone",
    sizes: [{ width: 1242, height: 2208 }],
  },
  {
    display: '4.7"',
    family: "iPhone",
    sizes: [{ width: 750, height: 1334 }],
  },
  {
    display: '13"',
    family: "iPad",
    sizes: [
      { width: 2064, height: 2752 },
      { width: 2048, height: 2732 },
    ],
    requirement: "Required if the app runs on iPad",
  },
  {
    display: '12.9"',
    family: "iPad",
    sizes: [{ width: 2048, height: 2732 }],
  },
  {
    display: '11"',
    family: "iPad",
    sizes: [
      { width: 1488, height: 2266 },
      { width: 1668, height: 2420 },
      { width: 1668, height: 2388 },
      { width: 1640, height: 2360 },
    ],
  },
  {
    display: '10.5"',
    family: "iPad",
    sizes: [{ width: 1668, height: 2224 }],
  },
];

type StatusBarPair = {
  display: string;
  family: "iPhone" | "iPad";
  variant: "with status bar" | "without status bar";
  portrait: { width: number; height: number };
  landscape: { width: number; height: number };
};

function statusBarSizes(pair: StatusBarPair): AppleSize[] {
  const { display, family, variant } = pair;
  return [
    { display, family, variant, orientation: "portrait", ...pair.portrait },
    { display, family, variant, orientation: "landscape", ...pair.landscape },
  ];
}

/**
 * Older displays: Apple prints separate "with/without status bar" sizes whose
 * landscape size is not just the portrait size swapped, so these stay explicit.
 */
const APPLE_STATUS_BAR_PAIRS: readonly StatusBarPair[] = [
  { display: '4"', family: "iPhone", variant: "without status bar", portrait: { width: 640, height: 1096 }, landscape: { width: 1136, height: 600 } },
  { display: '4"', family: "iPhone", variant: "with status bar", portrait: { width: 640, height: 1136 }, landscape: { width: 1136, height: 640 } },
  { display: '3.5"', family: "iPhone", variant: "without status bar", portrait: { width: 640, height: 920 }, landscape: { width: 960, height: 600 } },
  { display: '3.5"', family: "iPhone", variant: "with status bar", portrait: { width: 640, height: 960 }, landscape: { width: 960, height: 640 } },
  { display: '9.7"', family: "iPad", variant: "without status bar", portrait: { width: 1536, height: 2008 }, landscape: { width: 2048, height: 1496 } },
  { display: '9.7"', family: "iPad", variant: "with status bar", portrait: { width: 1536, height: 2048 }, landscape: { width: 2048, height: 1536 } },
  { display: '9.7"', family: "iPad", variant: "without status bar", portrait: { width: 768, height: 1004 }, landscape: { width: 1024, height: 748 } },
  { display: '9.7"', family: "iPad", variant: "with status bar", portrait: { width: 768, height: 1024 }, landscape: { width: 1024, height: 768 } },
];

/** Every App Store screenshot size, portrait and landscape, as Apple lists them. */
export const APPLE_SIZES: readonly AppleSize[] = [
  ...APPLE_DISPLAYS.flatMap((d): AppleSize[] =>
    d.sizes.flatMap((s): AppleSize[] => [
      { display: d.display, family: d.family, width: s.width, height: s.height, orientation: "portrait" },
      { display: d.display, family: d.family, width: s.height, height: s.width, orientation: "landscape" },
    ]),
  ),
  ...APPLE_STATUS_BAR_PAIRS.flatMap(statusBarSizes),
];

export const APPLE_REQUIREMENTS: readonly { display: string; family: "iPhone" | "iPad"; text: string }[] =
  APPLE_DISPLAYS.flatMap((d) =>
    d.requirement ? [{ display: d.display, family: d.family, text: d.requirement }] : [],
  );

export const APPLE_RULES = {
  /** "You can upload one to 10 screenshots". */
  minCount: 1,
  maxCount: 10,
  formats: ["image/jpeg", "image/png"],
  /** "Images can't include alpha channels or transparencies." */
  allowsAlpha: false,
} as const;

export const GOOGLE_PLAY_RULES = {
  formats: ["image/jpeg", "image/png"],
  /** "JPEG or 24-bit PNG (no alpha)". */
  allowsAlpha: false,
  /** "Minimum dimension: 320px". */
  minSide: 320,
  /** "Maximum dimension: 3840px". */
  maxSide: 3840,
  /** "The maximum dimension ... can't be more than twice as long as the minimum dimension." */
  maxAspectRatio: 2,
  /** "...a minimum of two screenshots across different device types." */
  minTotalScreenshots: 2,
  /** "...up to 8 screenshots for each supported device type." */
  maxPerDeviceType: 8,
  /**
   * Enhanced eligibility: at least four screenshots, 16:9 landscape (minimum
   * 1920x1080) or 9:16 portrait (minimum 1080x1920).
   */
  promo: {
    minScreenshots: 4,
    portrait: { width: 1080, height: 1920 },
    landscape: { width: 1920, height: 1080 },
  },
} as const;
