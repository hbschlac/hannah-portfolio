import { ImageResponse } from "next/og";

// Route-scoped favicon for the babymoon (served on babymoon.giddins.family).
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          background: "linear-gradient(150deg,#12807b,#1b9c86 55%,#e0a94e 120%)",
        }}
      >
        🌴
      </div>
    ),
    size,
  );
}
