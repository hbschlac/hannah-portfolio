"use client";

import { useState } from "react";
import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";

type Filter = "all" | "S" | "M" | "L" | "XL" | "XS" | "gluten" | "veg" | "noDrink";

export default function SurveyAdminPage() {
  return (
    <AdminGate>
      <AdminNav />
      <Body />
    </AdminGate>
  );
}

function Body() {
  const { state, error, loading } = useAdminState();
  const [filter, setFilter] = useState<Filter>("all");

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const matches = (s: typeof state.survey[0]): boolean => {
    if (filter === "all") return true;
    if (["XS", "S", "M", "L", "XL"].includes(filter)) return s.shirtSize === filter;
    if (filter === "gluten") return s.dietary.toLowerCase().includes("gluten");
    if (filter === "veg") return /vegetar|pescatar/i.test(s.dietary);
    if (filter === "noDrink") return /sober|doesn't drink|don't drink|n\/?a/i.test(s.drinkLevel);
    return true;
  };

  const filtered = state.survey.filter(matches);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "all" },
    { id: "XS", label: "XS" },
    { id: "S", label: "S" },
    { id: "M", label: "M" },
    { id: "L", label: "L" },
    { id: "XL", label: "XL" },
    { id: "gluten", label: "gluten-free" },
    { id: "veg", label: "veg/pesc" },
    { id: "noDrink", label: "no/light drink" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: fonts.script, fontSize: "1.15rem", color: colors.coral }}>
          everything from the form
        </div>
        <h1 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "2rem", color: colors.navy, margin: 0, lineHeight: 1 }}>
          survey
        </h1>
      </header>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "5px 11px",
              borderRadius: 999,
              border: `2px solid ${colors.navy}`,
              background: filter === f.id ? colors.coral : "#fff",
              color: colors.navy,
              fontSize: "0.78rem",
              fontWeight: filter === f.id ? 700 : 600,
              cursor: "pointer",
              boxShadow: filter === f.id ? "2px 2px 0 #1F2A44" : "none",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "0.82rem", color: colors.navySoft, marginBottom: 12 }}>
        showing {filtered.length} of {state.survey.length} responses
      </p>

      <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 14, boxShadow: stickerShadow, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: colors.cream, fontFamily: fonts.mono, fontSize: "0.7rem", letterSpacing: "0.05em" }}>
              <Th>name</Th>
              <Th>shirt</Th>
              <Th>sweat</Th>
              <Th>pants</Th>
              <Th>dietary</Th>
              <Th>medical</Th>
              <Th>drink</Th>
              <Th>roomie pref</Th>
              <Th>emergency</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const person = state.roster.find((r) => r.id === s.attendeeId);
              return (
                <tr key={s.attendeeId} style={{ borderTop: `1px solid ${colors.navy}22` }}>
                  <Td bold>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: person ? colors[person.colorToken] : "#ccc", border: `1.5px solid ${colors.navy}` }} />
                      {person?.name.split(" ")[0] || s.attendeeId}
                    </div>
                  </Td>
                  <Td>{s.shirtSize}</Td>
                  <Td>{s.sweatshirtSize}</Td>
                  <Td>{s.pantsSize}</Td>
                  <Td>{s.dietary}</Td>
                  <Td>{s.otherMedical || "—"}</Td>
                  <Td>{s.drinkLevel}</Td>
                  <Td>{s.roommatePref}</Td>
                  <Td small>{s.emergencyContact}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "10px 8px", textAlign: "left", color: colors.navy, fontWeight: 700 }}>{children?.toString().toUpperCase()}</th>;
}

function Td({ children, bold, small }: { children: React.ReactNode; bold?: boolean; small?: boolean }) {
  return <td style={{ padding: "8px", verticalAlign: "top", fontWeight: bold ? 700 : 400, fontSize: small ? "0.75rem" : undefined, color: colors.navy }}>{children}</td>;
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>📋</div>
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
