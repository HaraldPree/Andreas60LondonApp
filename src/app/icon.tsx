import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 32,
          position: "relative",
          color: "#E5A00D",
        }}
      >
        {/* Decorative gold border */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "2px solid rgba(229, 160, 13, 0.35)",
            borderRadius: 22,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            marginTop: -8,
            display: "flex",
          }}
        >
          60
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#F8F6F1",
            letterSpacing: 4,
            marginTop: 8,
            display: "flex",
          }}
        >
          ANDREA
        </div>
        <div
          style={{
            fontSize: 11,
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
