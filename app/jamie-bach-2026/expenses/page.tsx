"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

const FIXED: { label: string; perPerson: number }[] = [
  { label: "Hotel", perPerson: 359.55 },
  { label: "Sunset cruise", perPerson: 52 },
  { label: "Pilates class", perPerson: 30 },
  { label: "Bach misc", perPerson: 61.71 },
];

export default function ExpensesPage() {
  return (
    <PasswordGate
      guestPassword="Newport"
      adminPassword="Admin-July2026"
      storageKey="jamie-bach-unlocked"
    >
      <Body />
      <BottomNav />
    </PasswordGate>
  );
}

function Body() {
  const { state, error, loading } = useGuestState();
  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const splitwiseLive = !!state.expenses.splitwiseUrl;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="The Cost"
        title="Settling up, the easy way."
        dek="We log expenses in Splitwise as we go and settle on Sunday."
      />

      {/* Total */}
      <section style={{ padding: "16px 24px 0" }}>
        <div
          style={{
            paddingTop: 28,
            paddingBottom: 28,
            borderTop: `1px solid ${colors.mist}`,
            borderBottom: `1px solid ${colors.mist}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: colors.brass,
              marginBottom: 14,
            }}
          >
            Roughly per person
          </div>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 500,
              fontSize: "3.4rem",
              color: colors.ink,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            ${state.expenses.estimatedPerPerson.toFixed(2)}
          </div>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.inkSoft,
              margin: "14px 0 0",
              lineHeight: 1.5,
            }}
          >
            Includes everything — Jamie&apos;s share covered by the rest of us.
          </p>
        </div>
      </section>

      {/* Splitwise CTA */}
      <section style={{ padding: "32px 24px 0" }}>
        <a
          href={splitwiseLive ? state.expenses.splitwiseUrl : "#"}
          target={splitwiseLive ? "_blank" : undefined}
          rel="noopener noreferrer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "20px 0",
            borderBottom: `1px solid ${colors.mist}`,
            textDecoration: "none",
            opacity: splitwiseLive ? 1 : 0.5,
          }}
        >
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 500,
              fontSize: 20,
              color: colors.ink,
              letterSpacing: "-0.005em",
            }}
          >
            Splitwise group
          </span>
          <span
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: colors.inkSoft,
            }}
          >
            {splitwiseLive ? "Open" : "Coming soon"}
          </span>
        </a>
      </section>

      {/* Fixed costs */}
      <section style={{ padding: "40px 24px 64px" }}>
        <Eyebrow text="Fixed" />
        <div style={{ marginTop: 14 }}>
          {FIXED.map((b) => (
            <div
              key={b.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: `1px solid ${colors.mist}`,
                fontFamily: fonts.body,
                fontSize: 15,
                color: colors.ink,
              }}
            >
              <span>{b.label}</span>
              <span style={{ color: colors.inkSoft }}>
                ${b.perPerson.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: fonts.body,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: colors.brass,
      }}
    >
      {text}
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "120px 24px", textAlign: "center" }}>
      <p
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 11,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: colors.inkSoft,
        }}
      >
        Loading
      </p>
    </div>
  );
}

function ErrorView({ error }: { error: string | null }) {
  return (
    <div style={{ padding: "120px 24px", textAlign: "center" }}>
      <p style={{ color: colors.coral, fontFamily: fonts.body }}>
        {error || "No data yet."}
      </p>
    </div>
  );
}
