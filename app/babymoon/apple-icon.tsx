import { ImageResponse } from "next/og";

// Home-screen icon for babymoon.giddins.family (Add to Home Screen on iOS).
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
          alignItems: "flex-end",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(150deg,#12807b 0%,#1b9c86 48%,#e0a94e 115%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 36,
            width: 50,
            height: 50,
            borderRadius: 50,
            background: "#ffe6b0",
            boxShadow: "0 0 16px #ffd98a",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -22,
            width: 270,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -36,
            width: 270,
            height: 100,
            borderRadius: "50%",
            background: "rgba(13,91,87,0.55)",
          }}
        />
      </div>
    ),
    size,
  );
}
