"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

const BREAKDOWN: { label: string; perPerson: number }[] = [
  { label: "Lodging", perPerson: 359.55 },
  { label: "Rental car", perPerson: 65.45 },
  { label: "Meals", perPerson: 200 },
  { label: "Sunset cruise", perPerson: 52 },
  { label: "Activity", perPerson: 30 },
  { label: "Décor", perPerson: 10.91 },
  { label: "Groceries", perPerson: 10 },
  { label: "Alcohol (pregame)", perPerson: 8.33 },
  { label: "Jamie's share covered", perPerson: 32.47 },
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
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontSize: 14,
              color: colors.inkSoft,
              margin: "14px 0 0",
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

      {/* How it works */}
      <section style={{ padding: "40px 24px 0" }}>
        <Eyebrow text="How It Works" />
        <ol
          style={{
            margin: "14px 0 0",
            padding: 0,
            listStyle: "none",
            counterReset: "step",
            fontFamily: fonts.display,
            fontSize: 16,
            lineHeight: 1.55,
            color: colors.ink,
          }}
        >
          {[
            "Join the Splitwise group.",
            "Add expenses as you go — cabs, groceries, whatever comes up.",
            "Splitwise tallies who owes whom at the end.",
            "We settle on Sunday before flying home.",
          ].map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 16,
                padding: "12px 0",
                borderBottom: `1px solid ${colors.mist}`,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  color: colors.brass,
                  flexShrink: 0,
                  paddingTop: 4,
                }}
              >
                0{i + 1}
              </span>
              <span style={{ fontStyle: "italic" }}>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Pre-paid */}
      <section style={{ padding: "40px 24px 0" }}>
        <Eyebrow text="Already Covered" />
        <div style={{ marginTop: 14 }}>
          {state.expenses.prePaid.map((p) => {
            const payer =
              state.roster.find((r) => r.id === p.paidBy)?.name.split(" ")[0] ||
              p.paidBy;
            return (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "14px 0",
                  borderBottom: `1px solid ${colors.mist}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: fonts.display,
                      fontWeight: 500,
                      fontSize: 17,
                      color: colors.ink,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {p.label}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: colors.inkSoft,
                      marginTop: 2,
                    }}
                  >
                    Paid by {payer}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontWeight: 500,
                    fontSize: 17,
                    color: colors.ink,
                    letterSpacing: "-0.005em",
                  }}
                >
                  ${p.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Breakdown */}
      <section style={{ padding: "40px 24px 64px" }}>
        <Eyebrow text="The Breakdown" />
        <div style={{ marginTop: 14 }}>
          {BREAKDOWN.map((b) => (
            <div
              key={b.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: `1px solid ${colors.mist}`,
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.ink,
              }}
            >
              <span>{b.label}</span>
              <span style={{ color: colors.inkSoft }}>${b.perPerson.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: 20,
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontSize: 14,
            color: colors.inkSoft,
          }}
        >
          Questions? Ping Hannah.
        </p>
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
