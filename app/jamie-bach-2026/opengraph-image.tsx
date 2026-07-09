import { ImageResponse } from "next/og";

// 1200×630 Open Graph card for jamiesbach.schlacter.me link previews.
// Features the cropped toddler-Jamie photo + title + date on the site's
// soft-white + powder-blue palette so iMessage / Slack / WhatsApp / Twitter
// unfurls match the actual site.
export const alt = "Jamie's Bachelorette · Newport · July 10–12, 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#FAFBFC";
const INK = "#1A1A1A";
const BRASS = "#7BA7CE";

export default async function OGImage() {
  // Fetch the live cropped toddler-Jamie photo and inline it as a data URI so
  // the OG card renders it without relying on the function's local filesystem.
  const photo = await fetch(
    "https://jamiesbach.schlacter.me/jamie/jamie-beach-crop3.jpg"
  ).then((r) => r.arrayBuffer());
  const photoSrc = `data:image/jpeg;base64,${Buffer.from(photo).toString(
    "base64"
  )}`;

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
          padding: "56px 80px",
          textAlign: "center",
        }}
      >
        <img
          src={photoSrc}
          width={240}
          height={240}
          style={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            objectFit: "cover",
            border: `6px solid ${BRASS}`,
            marginBottom: 30,
          }}
        />

        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: BRASS,
            marginBottom: 24,
          }}
        >
          A Newport Bachelorette
        </div>

        <div
          style={{
            fontSize: 100,
            fontWeight: 700,
            color: INK,
            letterSpacing: "-0.02em",
            lineHeight: 1.02,
            marginBottom: 22,
          }}
        >
          Jamie&apos;s Bach
        </div>

        <div
          style={{
            fontSize: 30,
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
            bottom: 48,
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
