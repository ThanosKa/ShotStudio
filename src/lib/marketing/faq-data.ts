export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Is this a subscription?",
    a: "No. Credit packs are one-time purchases. Buy what you need; what you don't use stays in your account.",
  },
  {
    q: "Where are my screenshots stored?",
    a: "Nowhere. Uploads are passed to the model in-memory and dropped after generation. Outputs are returned to your browser only — there's no images table, no S3 bucket, no thumbnail cache.",
  },
  {
    q: "What if a generation fails?",
    a: "We retry the failing shot once automatically. If our retries and fallback can't deliver three valid images, the credit is returned to your balance — no support ticket needed.",
  },
  {
    q: "Can I edit the text after?",
    a: "Not inside ShotStudio. The headline is rendered into each image, so what you download is a finished PNG. To change the wording, generate a new set with a different pitch (one credit), or touch up the PNG in any image editor.",
  },
  {
    q: "What sizes do I get?",
    a: "Three PNGs at 1290×2796, the App Store iPhone 6.7\" portrait spec — sRGB, no transparency, no watermark.",
  },
  {
    q: "Do you offer refunds?",
    a: "We don't refund cash, but we automatically return the credit to your balance whenever a generation can't be salvaged after our retries and fallback path. No support ticket needed.",
  },
];
