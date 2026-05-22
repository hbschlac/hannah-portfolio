import Image from "next/image";
import { colors, fonts } from "@/lib/jamie/brand";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  ratio?: "square" | "portrait" | "landscape" | "wide";
};

const ratioMap = {
  square: "1 / 1",
  portrait: "3 / 4",
  landscape: "4 / 3",
  wide: "16 / 10",
} as const;

export default function PhotoCaption({
  src,
  alt,
  caption,
  credit,
  ratio = "landscape",
}: Props) {
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: ratioMap[ratio],
          background: colors.mist,
          overflow: "hidden",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          style={{ objectFit: "cover" }}
        />
      </div>
      {(caption || credit) && (
        <figcaption
          style={{
            paddingTop: 10,
            paddingBottom: 6,
            borderBottom: `1px solid ${colors.mist}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {caption && (
            <span
              style={{
                fontFamily: fonts.display,
                fontSize: 14,
                color: colors.ink,
                lineHeight: 1.4,
              }}
            >
              {caption}
            </span>
          )}
          {credit && (
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: colors.inkSoft,
                flexShrink: 0,
                marginTop: 4,
              }}
            >
              {credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
