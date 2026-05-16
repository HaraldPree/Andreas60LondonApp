import { ImageResponse } from "next/og";

// iOS browser-tab / iOS Safari "Add to Home Screen" fallback when no
// PWA manifest is honoured. For Android home-screen icons we use the
// real photo via manifest.ts.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #003366 0%, #2980B9 100%)",
          position: "relative",
          color: "#E5A00D",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 11,
            left: 11,
            right: 11,
            bottom: 11,
            border: "2px solid rgba(229, 160, 13, 0.35)",
            borderRadius: 16,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 100,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            marginTop: -6,
            display: "flex",
          }}
        >
          60
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#F8F6F1",
            letterSpacing: 4,
            marginTop: 6,
            display: "flex",
          }}
        >
          ANDREA
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#E5A00D",
            letterSpacing: 3,
            marginTop: 2,
            display: "flex",
          }}
        >
          LONDON
        </div>
      </div>
    ),
    { ...size },
  );
}
