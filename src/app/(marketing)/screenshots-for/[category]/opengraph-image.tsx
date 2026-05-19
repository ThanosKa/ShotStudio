import { ImageResponse } from "next/og";
import { getCategoryBySlug } from "@/data/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "App Store screenshots — ShotStudio";

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = getCategoryBySlug(category);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "96px",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fb923c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.06em",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            <span style={{ color: "#fb923c" }}>Shot</span>
            <span style={{ color: "#ffffff" }}>Studio</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              color: "#a3a3a3",
              marginBottom: 16,
            }}
          >
            App Store screenshots for
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            {data ? data.name.toLowerCase() : "every iOS app"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#a3a3a3",
          }}
        >
          <span>shotstudio.dev</span>
          <span>$7 · 1290×2796 · under a minute</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
