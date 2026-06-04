"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

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

  const steps = [
    "Join the group with the button above.",
    "We log every shared cost as we go — hotel, cruise, activities, food, the works.",
    "Check what you owe and settle up right in the app. Jamie's share is covered by the rest of us. 💛",
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="The Cost"
        title="It all lives in Splitwise."
        dek="No spreadsheet to keep up with — join the group to see what you owe and settle up there."
      />

      {/* Splitwise hero button */}
      <section style={{ padding: "24px 24px 0" }}>
        <a
          href={splitwiseLive ? state.expenses.splitwiseUrl : undefined}
          target={splitwiseLive ? "_blank" : undefined}
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "22px 24px",
            background: splitwiseLive ? colors.sky : colors.mist,
            color: splitwiseLive ? "#FFFFFF" : colors.inkSoft,
            textDecoration: "none",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.005em",
            borderRadius: 16,
            pointerEvents: splitwiseLive ? "auto" : "none",
          }}
        >
          {splitwiseLive
            ? "Open the Splitwise group →"
            : "Splitwise group — coming soon"}
        </a>
      </section>

      {/* How it works */}
      <section style={{ padding: "36px 24px 64px" }}>
        <Eyebrow text="How it works" />
        <ol style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {steps.map((s, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 0",
                borderBottom: `1px solid ${colors.mist}`,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: colors.sky,
                  color: "#FFFFFF",
                  fontFamily: fonts.body,
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 15,
                  color: colors.ink,
                  lineHeight: 1.5,
                }}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
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
