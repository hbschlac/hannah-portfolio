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

// Fetch a static (ttf) instance of a Google font, subset to the glyphs we render.
// Server-side fetches (no browser UA) get truetype from the css2 API, which is
// what satori needs. Returns null on any failure so the card never 500s.
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family
    )}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const match = css.match(
      /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/
    );
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

const SANS_GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.·—–'";

export default async function OGImage() {
  // Inline the live cropped toddler-Jamie photo as a data URI, and load the
  // display/body fonts to match the site's typography.
  const [photoBuf, fraunces, outfit] = await Promise.all([
    fetch("https://jamiesbach.schlacter.me/jamie/jamie-beach-crop3.jpg").then(
      (r) => r.arrayBuffer()
    ),
    loadGoogleFont("Fraunces", 600, "Jamie's Bach"),
    loadGoogleFont("Outfit", 600, SANS_GLYPHS),
  ]);

  const photoSrc = `data:image/jpeg;base64,${Buffer.from(photoBuf).toString(
    "base64"
  )}`;

  const fonts = [];
  if (fraunces)
    fonts.push({
      name: "Fraunces",
      data: fraunces,
      weight: 600 as const,
      style: "normal" as const,
    });
  if (outfit)
    fonts.push({
      name: "Outfit",
      data: outfit,
      weight: 600 as const,
      style: "normal" as const,
    });

  const serif = fraunces ? "Fraunces" : "Outfit";
  const sans = outfit ? "Outfit" : "Fraunces";

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
            marginBottom: 34,
          }}
        />

        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: BRASS,
            marginBottom: 22,
          }}
        >
          A Newport Bachelorette
        </div>

        <div
          style={{
            fontFamily: serif,
            fontSize: 116,
            fontWeight: 600,
            color: INK,
            letterSpacing: "-0.01em",
            lineHeight: 1.0,
            marginBottom: 24,
          }}
        >
          Jamie&apos;s Bach
        </div>

        <div
          style={{
            fontFamily: sans,
            fontSize: 30,
            fontWeight: 600,
            color: INK,
            opacity: 0.72,
            letterSpacing: "0.01em",
          }}
        >
          Newport, Rhode Island · July 10–12, 2026
        </div>

        <div
          style={{
            fontFamily: sans,
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
    { ...size, fonts }
  );
}
