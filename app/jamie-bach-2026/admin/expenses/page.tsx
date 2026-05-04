"use client";

import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import Link from "next/link";

export default function ExpensesAdminPage() {
  return (
    <AdminGate>
      <AdminNav />
      <Body />
    </AdminGate>
  );
}

function Body() {
  const { state, error, loading } = useAdminState();
  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const splitwiseLive = !!state.expenses.splitwiseUrl;
  const totalPrePaid = state.expenses.prePaid.reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: fonts.script, fontSize: "1.15rem", color: colors.coral }}>
          group $$ tracker
        </div>
        <h1 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "2rem", color: colors.navy, margin: 0, lineHeight: 1 }}>
          expenses
        </h1>
      </header>

      <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 14, padding: 18, boxShadow: stickerShadow, marginBottom: 16 }}>
        <SubHeader emoji="💸" title="splitwise group" />
        <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {splitwiseLive ? (
            <a
              href={state.expenses.splitwiseUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 16px",
                background: colors.lime,
                border: `2px solid ${colors.navy}`,
                borderRadius: 999,
                color: colors.navy,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
              }}
            >
              ✅ open in Splitwise
            </a>
          ) : (
            <Link
              href="/jamie-bach-2026/admin/settings"
              style={{
                padding: "8px 16px",
                background: colors.coral,
                border: `2px solid ${colors.navy}`,
                borderRadius: 999,
                color: colors.navy,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
              }}
            >
              ⚠️ paste URL in settings
            </Link>
          )}
          <span style={{ fontSize: "0.85rem", color: colors.navySoft }}>
            {splitwiseLive ? "guests can see this on the expenses page" : "no link saved yet"}
          </span>
        </div>
      </div>

      <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 14, padding: 18, boxShadow: stickerShadow, marginBottom: 16 }}>
        <SubHeader emoji="✅" title="who's joined splitwise" />
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {state.roster.map((p) => {
            const joined = state.expenses.splitwiseJoined[p.id];
            return (
              <span
                key={p.id}
                style={{
                  padding: "5px 11px",
                  background: joined ? colors.lime : "#fff",
                  border: `2px solid ${colors.navy}`,
                  borderRadius: 999,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: colors.navy,
                  opacity: joined ? 1 : 0.7,
                }}
              >
                {joined ? "✅" : "⚪"} {p.name.split(" ")[0]}
              </span>
            );
          })}
        </div>
        <p style={{ color: colors.navySoft, marginTop: 10, fontFamily: fonts.script, fontSize: "0.95rem" }}>
          (toggle states are seed defaults for now — wire up checkbox edits later if useful)
        </p>
      </div>

      <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 14, padding: 18, boxShadow: stickerShadow }}>
        <SubHeader emoji="🏷️" title="pre-paid" />
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.navy}` }}>
              <th style={{ textAlign: "left", padding: "8px", fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.05em" }}>ITEM</th>
              <th style={{ textAlign: "left", padding: "8px", fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.05em" }}>PAID BY</th>
              <th style={{ textAlign: "right", padding: "8px", fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.05em" }}>AMOUNT</th>
              <th style={{ textAlign: "center", padding: "8px", fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.05em" }}>LOGGED?</th>
            </tr>
          </thead>
          <tbody>
            {state.expenses.prePaid.map((p) => {
              const payer = state.roster.find((r) => r.id === p.paidBy);
              return (
                <tr key={p.label} style={{ borderTop: `1px solid ${colors.navy}22` }}>
                  <td style={{ padding: "8px", fontWeight: 600 }}>{p.label}</td>
                  <td style={{ padding: "8px" }}>{payer?.name.split(" ")[0] || p.paidBy}</td>
                  <td style={{ padding: "8px", textAlign: "right", fontFamily: fonts.mono, fontWeight: 700 }}>
                    ${p.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "8px", textAlign: "center" }}>{p.loggedToSplitwise ? "✅" : "⚪"}</td>
                </tr>
              );
            })}
            <tr style={{ borderTop: `2px solid ${colors.navy}` }}>
              <td style={{ padding: "8px", fontWeight: 700 }}>total pre-paid</td>
              <td />
              <td style={{ padding: "8px", textAlign: "right", fontFamily: fonts.mono, fontWeight: 900, color: colors.coral }}>
                ${totalPrePaid.toLocaleString()}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
      <h2 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "1.3rem", color: colors.navy, margin: 0 }}>
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
