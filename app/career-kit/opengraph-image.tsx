import { ImageResponse } from "next/og";

export const alt = "Career Kit: Claude skills for your job search";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// What a visitor types once the kit is set up, shown as chat-style chips.
const PROMPTS = [
  "set me up",
  "tailor my resume for this job",
  "score my resume against this job",
  "write a note to a recruiter",
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
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "56px",
            padding: "0 80px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontSize: 24,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#8A8A8A",
                display: "flex",
              }}
            >
              Career Kit
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginTop: 16,
                display: "flex",
              }}
            >
              Claude skills for your job search
            </div>
            <div style={{ fontSize: 28, color: "#5A5A5A", lineHeight: 1.4, marginTop: 20, display: "flex" }}>
              Tailored resumes, outreach and a tracker. In your voice, from your facts.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px", width: 440 }}>
            {PROMPTS.map((p, i) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  background: i === 0 ? "#1A1A1A" : "#FFFFFF",
                  color: i === 0 ? "#FFFFFF" : "#1A1A1A",
                  border: "1px solid #E5E1D8",
                  borderRadius: 18,
                  padding: "14px 22px",
                  fontSize: 24,
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            padding: "24px 80px",
            fontSize: 22,
            color: "#8A8A8A",
            borderTop: "1px solid #E5E1D8",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>schlacter.me/career-kit</span>
          <span>12 skills · about 20 minutes to set up · no coding</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
