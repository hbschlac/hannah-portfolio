import { ImageResponse } from "next/og";

// iPhone homescreen icon. 180×180 PNG with rounded corners + bold "S".
// (iOS itself applies an extra mask, so this looks like a real app icon.)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#DB2777",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: 140,
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
