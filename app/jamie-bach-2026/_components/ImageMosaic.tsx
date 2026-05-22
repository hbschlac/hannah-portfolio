import Image from "next/image";
import { colors } from "@/lib/jamie/brand";

type Tile = {
  src: string;
  alt: string;
  span?: "wide" | "tall" | "square";
};

export default function ImageMosaic({ tiles }: { tiles: Tile[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
      }}
    >
      {tiles.map((tile, i) => {
        const aspect =
          tile.span === "tall" ? "3 / 4" : tile.span === "wide" ? "16 / 10" : "1 / 1";
        const gridColumn = tile.span === "wide" ? "1 / -1" : undefined;
        return (
          <div
            key={`${tile.src}-${i}`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: aspect,
              background: colors.mist,
              overflow: "hidden",
              gridColumn,
            }}
          >
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              sizes="(max-width: 768px) 50vw, 384px"
              style={{ objectFit: "cover" }}
            />
          </div>
        );
      })}
    </div>
  );
}
