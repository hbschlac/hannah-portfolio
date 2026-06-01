import { ImageResponse } from "next/og";

// Favicon for the /stuff routes. Pink rounded "app icon" with a bold white S.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#DB2777",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: 48,
          fontWeight: 800,
          fontFamily:
            "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
