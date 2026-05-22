import { colors, fonts } from "@/lib/jamie/brand";

type Props = {
  /** Small uppercase tracked tag above the headline. */
  kicker?: string;
  /** Backwards-compat: ignored — emoji is gone from the editorial system. */
  emoji?: string;
  /** Main serif headline. */
  title: string;
  /** Optional dek under the headline. */
  dek?: string;
};

export default function SectionHeader({ kicker, title, dek }: Props) {
  return (
    <header style={{ padding: "44px 24px 16px" }}>
      {kicker && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: colors.brass,
            marginBottom: 12,
          }}
        >
          {kicker}
        </div>
      )}
      <h1
        style={{
          fontFamily: fonts.display,
          fontWeight: 500,
          fontSize: "clamp(2rem, 7.5vw, 2.6rem)",
          margin: 0,
          color: colors.ink,
          lineHeight: 1.04,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h1>
      {dek && (
        <p
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontSize: 16,
            color: colors.inkSoft,
            margin: "12px 0 0",
            maxWidth: "32em",
            lineHeight: 1.5,
          }}
        >
          {dek}
        </p>
      )}
      <div
        style={{
          marginTop: 22,
          height: 1,
          background: colors.brass,
          width: 56,
        }}
      />
    </header>
  );
}
