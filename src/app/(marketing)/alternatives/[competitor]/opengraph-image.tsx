import { ImageResponse } from "next/og";
import { getCompetitorBySlug } from "@/data/competitors";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "App Store screenshot tool alternatives — ShotStudio";

export default async function Image({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const data = getCompetitorBySlug(competitor);
  const headline = data ? `${data.name} alternatives` : "Alternatives";

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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
            Honest take on
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
            {headline}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#a3a3a3",
              marginTop: 18,
              maxWidth: 960,
              lineHeight: 1.3,
            }}
          >
            What indies actually pick when the subscription doesn&rsquo;t fit a
            once-a-year launch.
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
          <span>$7 one-time · never stored</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
