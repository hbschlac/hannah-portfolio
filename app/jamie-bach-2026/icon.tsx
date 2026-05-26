import { ImageResponse } from "next/og";

// Route-scoped favicon for Jamie's Bach (also served on jamiesbach.schlacter.me).
// Renders the 👰‍♀️ bride emoji as a 32×32 PNG so phones and browsers can pin it.
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
          fontSize: 26,
          background: "transparent",
        }}
      >
        👰‍♀️
      </div>
    ),
    size
  );
}
