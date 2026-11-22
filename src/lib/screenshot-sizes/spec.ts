/**
 *  - Apple: https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
 *  - Google Play: https://support.google.com/googleplay/android-developer/answer/9866151
 */

export type Orientation = "portrait" | "landscape";

export type AppleSize = {
  display: string;
  family: "iPhone" | "iPad";
  width: number;
  height: number;
  orientation: Orientation;
  variant?: string;
};

type AppleDisplay = {
  display: string;
  family: "iPhone" | "iPad";
  sizes: { width: number; height: number; variant?: string }[];
  requirement?: string;
};

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
    requirement:
      "Apple's required device sizes ask for at least one screenshot for this display (iPhone with Dynamic Island, medium display)",
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
    display: "Duo (outer display)",
    family: "iPhone",
    sizes: [{ width: 1398, height: 2034 }],
  },
  {
    display: "Duo (inner display)",
    family: "iPhone",
    sizes: [{ width: 2007, height: 2853 }],
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
      { width: 1512, height: 2316 },
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
  minCount: 1,
  maxCount: 10,
  formats: ["image/jpeg", "image/png"],
  allowsAlpha: false,
} as const;

export const GOOGLE_PLAY_RULES = {
  formats: ["image/jpeg", "image/png"],
  allowsAlpha: false,
  minSide: 320,
  maxSide: 3840,
  maxAspectRatio: 2,
  minTotalScreenshots: 2,
  maxPerDeviceType: 8,
  promo: {
    minScreenshots: 4,
    portrait: { width: 1080, height: 1920 },
    landscape: { width: 1920, height: 1080 },
  },
} as const;
