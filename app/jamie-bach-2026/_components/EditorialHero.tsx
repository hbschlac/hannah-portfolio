import Image from "next/image";
import { colors, fonts } from "@/lib/jamie/brand";

type Props = {
  src: string;
  alt: string;
  eyebrow?: string;
  headline: string;
  dateline?: string;
  height?: number;
  priority?: boolean;
  objectPosition?: string;
};

export default function EditorialHero({
  src,
  alt,
  eyebrow,
  headline,
  dateline,
  height = 560,
  priority,
  objectPosition = "center",
}: Props) {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        background: colors.ink,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 768px"
        style={{ objectFit: "cover", objectPosition }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "0 24px 32px",
          color: "#FBF7EE",
        }}
      >
        {eyebrow && (
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: 0.85,
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: "clamp(2.4rem, 9vw, 3.4rem)",
            lineHeight: 1.02,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {headline}
        </h1>
        {dateline && (
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: "1.05rem",
              marginTop: 14,
              opacity: 0.92,
              letterSpacing: "0.01em",
            }}
          >
            {dateline}
          </div>
        )}
      </div>
    </section>
  );
}
