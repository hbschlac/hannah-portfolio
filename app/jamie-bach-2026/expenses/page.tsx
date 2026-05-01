"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts, stickerShadow, sunsetGradient } from "@/lib/jamie/brand";

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

const BREAKDOWN: { label: string; emoji: string; perPerson: number }[] = [
  { label: "lodging", emoji: "🏠", perPerson: 359.55 },
  { label: "rental car", emoji: "🚗", perPerson: 65.45 },
  { label: "meals", emoji: "🍝", perPerson: 200 },
  { label: "sunset cruise", emoji: "🛥️", perPerson: 52 },
  { label: "activity", emoji: "🌸", perPerson: 30 },
  { label: "decor", emoji: "🎉", perPerson: 10.91 },
  { label: "groceries", emoji: "🛒", perPerson: 10 },
  { label: "alcohol (pregame)", emoji: "🍾", perPerson: 8.33 },
  { label: "jamie's share covered", emoji: "💕", perPerson: 32.47 },
];

function Body() {
  const { state, error, loading } = useGuestState();
  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const splitwiseLive = !!state.expenses.splitwiseUrl;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <SectionHeader kicker="settling up the easy way 💸" title="$$" />

      {/* Splitwise hero */}
      <div style={{ padding: "12px 20px 0" }}>
        <div
          style={{
            background: sunsetGradient,
            border: `3px solid ${colors.navy}`,
            borderRadius: 16,
            padding: "22px 18px",
            textAlign: "center",
            boxShadow: stickerShadow,
            transform: "rotate(-1deg)",
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: "0.78rem",
              letterSpacing: "0.1em",
              fontWeight: 700,
              color: colors.navy,
              background: colors.lime,
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              border: `2px solid ${colors.navy}`,
            }}
          >
            SPLITWISE GROUP
          </div>
          <h2
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "1.6rem",
              color: colors.navy,
              margin: "10px 0 4px",
              lineHeight: 1.1,
            }}
          >
            jamie&apos;s bach 2026
          </h2>
          <p
            style={{
              fontFamily: fonts.script,
              fontSize: "1.05rem",
              color: colors.navy,
              margin: 0,
            }}
          >
            we settle at end of trip ✿
          </p>
          <a
            href={splitwiseLive ? state.expenses.splitwiseUrl : "#"}
            target={splitwiseLive ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 14,
              padding: "10px 22px",
              background: "#fff",
              border: `3px solid ${colors.navy}`,
              borderRadius: 999,
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: "0.92rem",
              color: colors.navy,
              textDecoration: "none",
              boxShadow: "3px 3px 0 #1F2A44",
              opacity: splitwiseLive ? 1 : 0.55,
              cursor: splitwiseLive ? "pointer" : "default",
            }}
          >
            {splitwiseLive ? "open in splitwise →" : "link coming soon"}
          </a>
        </div>
      </div>

      {/* How it works */}
      <section style={{ padding: "28px 20px 0" }}>
        <SubHeader emoji="✨" title="how it works" />
        <ol
          style={{
            margin: "12px 0 0",
            padding: "16px 20px 16px 38px",
            background: "#fff",
            border: `3px solid ${colors.navy}`,
            borderRadius: 12,
            boxShadow: stickerShadow,
            fontSize: "0.95rem",
            lineHeight: 1.6,
          }}
        >
          <li>join the splitwise group ↑</li>
          <li>add expenses as you go (cabs, grocery runs, etc.)</li>
          <li>splitwise tells us all who owes who at the end</li>
          <li>we settle on sunday before flying home</li>
        </ol>
      </section>

      {/* Pre-paid */}
      <section style={{ padding: "28px 20px 0" }}>
        <SubHeader emoji="✅" title="already covered" />
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            border: `3px solid ${colors.navy}`,
            borderRadius: 12,
            boxShadow: stickerShadow,
            overflow: "hidden",
          }}
        >
          {state.expenses.prePaid.map((p, i) => {
            const payer =
              state.roster.find((r) => r.id === p.paidBy)?.name.split(" ")[0] ||
              p.paidBy;
            return (
              <div
                key={p.label}
                style={{
                  padding: "12px 14px",
                  borderTop: i === 0 ? "none" : `1px solid ${colors.navy}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.92rem",
                }}
              >
                <div>
                  <strong>{p.label}</strong>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: colors.navySoft,
                      fontFamily: fonts.mono,
                    }}
                  >
                    {payer.toLowerCase()} · pre-paid
                  </div>
                </div>
                <div style={{ fontFamily: fonts.mono, fontWeight: 700 }}>
                  ${p.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-person estimate */}
      <section style={{ padding: "28px 20px 40px" }}>
        <SubHeader emoji="📊" title="rough cost per person" />
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            border: `3px solid ${colors.navy}`,
            borderRadius: 12,
            boxShadow: stickerShadow,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "2.4rem",
              color: colors.coral,
              lineHeight: 1,
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            ~${state.expenses.estimatedPerPerson.toFixed(2)}
          </div>
          <p
            style={{
              fontFamily: fonts.script,
              fontSize: "1rem",
              color: colors.navySoft,
              textAlign: "center",
              margin: "0 0 14px",
            }}
          >
            includes everything (jamie&apos;s share covered by us all)
          </p>
          <div
            style={{
              borderTop: `2px solid ${colors.navy}`,
              paddingTop: 10,
              fontSize: "0.85rem",
              fontFamily: fonts.mono,
            }}
          >
            {BREAKDOWN.map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <span>
                  {b.emoji} {b.label}
                </span>
                <span>${b.perPerson.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <p
          style={{
            marginTop: 14,
            fontFamily: fonts.script,
            fontSize: "1rem",
            color: colors.navySoft,
            textAlign: "center",
          }}
        >
          questions? ping hannah ✿
        </p>
      </section>
    </div>
  );
}

function SubHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
      <h2
        style={{
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "1.4rem",
          color: colors.navy,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>💸</div>
      <p style={{ color: colors.navySoft, marginTop: 12 }}>loading...</p>
    </div>
  );
}

function ErrorView({ error }: { error: string | null }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <p style={{ color: colors.coral }}>oops — {error || "no data"}</p>
    </div>
  );
}
