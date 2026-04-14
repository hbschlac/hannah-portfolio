import { ImageResponse } from "next/og";

export const alt = "baked by hannah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Sprinkle positions — a subset of the page's strip, scaled for 1200×630
const SPRINKLES = [
  { left: "5%",  top: "40px",  color: "#E8A5B4", rotate: 20,  width: 36, height: 12 },
  { left: "13%", top: "18px",  color: "#F9C74F", rotate: -35, width: 28, height: 10 },
  { left: "22%", top: "56px",  color: "#90BE6D", rotate: 55,  width: 32, height: 11 },
  { left: "32%", top: "14px",  color: "#577590", rotate: -10, width: 22, height: 10 },
  { left: "42%", top: "50px",  color: "#F3722C", rotate: 40,  width: 30, height: 10 },
  { left: "52%", top: "22px",  color: "#E8A5B4", rotate: -50, width: 26, height: 10 },
  { left: "62%", top: "58px",  color: "#F9C74F", rotate: 15,  width: 34, height: 12 },
  { left: "72%", top: "10px",  color: "#90BE6D", rotate: -25, width: 28, height: 10 },
  { left: "82%", top: "50px",  color: "#577590", rotate: 60,  width: 22, height: 10 },
  { left: "92%", top: "24px",  color: "#F3722C", rotate: -45, width: 30, height: 10 },
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F8F6F2",
          color: "#1A1A1A",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Sprinkle strip */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "110px",
            display: "flex",
          }}
        >
          {SPRINKLES.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.left,
                top: s.top,
                width: s.width,
                height: s.height,
                backgroundColor: s.color,
                borderRadius: "9999px",
                transform: `rotate(${s.rotate}deg)`,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "60px",
            padding: "0 80px",
          }}
        >
          <div style={{ fontSize: 320, lineHeight: 1, display: "flex" }}>🧁</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              baked by hannah
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#5A5A5A",
                lineHeight: 1.3,
              }}
            >
              sugar is my love language
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div
          style={{
            padding: "24px 80px",
            fontSize: 22,
            color: "#8A8A8A",
            borderTop: "1px solid #E5E1D8",
            display: "flex",
          }}
        >
          schlacter.me/baked-by-hannah · oakland, ca
        </div>
      </div>
    ),
    { ...size }
  );
}
