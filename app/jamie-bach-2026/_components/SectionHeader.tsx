import { colors, fonts } from "@/lib/jamie/brand";

export default function SectionHeader({
  emoji,
  title,
  kicker,
}: {
  emoji?: string;
  title: string;
  kicker?: string;
}) {
  return (
    <header style={{ padding: "32px 20px 12px" }}>
      {kicker && (
        <div
          style={{
            fontFamily: fonts.script,
            fontSize: "1.25rem",
            color: colors.coral,
            transform: "rotate(-2deg)",
          }}
        >
          {kicker}
        </div>
      )}
      <h1
        style={{
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "2.4rem",
          margin: kicker ? "6px 0 0" : 0,
          color: colors.navy,
          lineHeight: 1,
        }}
      >
        {emoji ? `${emoji} ` : ""}
        {title}
      </h1>
    </header>
  );
}
