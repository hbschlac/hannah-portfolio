import { ImageResponse } from "next/og";

// 1200×630 Open Graph card for jamiesbach.schlacter.me link previews.
// Renders the bride emoji + title + date on the site's ecru palette so
// iMessage / Slack / WhatsApp / Twitter unfurls match the actual site.
export const alt = "Jamie's Bachelorette · Newport · July 10–12, 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F7F3E9";
const INK = "#1A1A1A";
const BRASS = "#9B7B3F";

export default function OGImage() {
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
          background: PAPER,
          padding: "64px 80px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 180, lineHeight: 1, marginBottom: 32 }}>
          👰‍♀️
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: BRASS,
            marginBottom: 28,
          }}
        >
          A Newport Bachelorette
        </div>

        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            color: INK,
            letterSpacing: "-0.02em",
            lineHeight: 1.02,
            marginBottom: 28,
          }}
        >
          Jamie&apos;s Bach
        </div>

        <div
          style={{
            fontSize: 32,
            color: INK,
            opacity: 0.78,
            letterSpacing: "0.02em",
          }}
        >
          Newport, Rhode Island · July 10–12, 2026
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: BRASS,
          }}
        >
          jamiesbach.schlacter.me
        </div>
      </div>
    ),
    size
  );
}
