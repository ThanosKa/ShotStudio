import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ShotStudio — App Store screenshots in under a minute";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "#fb923c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 70,
              fontWeight: 800,
              letterSpacing: "-0.06em",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            <span style={{ color: "#fb923c" }}>Shot</span>
            <span style={{ color: "#ffffff" }}>Studio</span>
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          App Store screenshots in under a minute.
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#a3a3a3",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          Three raw mobile screenshots in. Three polished App Store shots out.
          One-time pay, never stored.
        </div>
      </div>
    ),
    { ...size },
  );
}
