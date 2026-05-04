"use client";

import { useState, useEffect } from "react";
import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { AttendeeId } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

export default function RoomsAdminPage() {
  return (
    <AdminGate>
      <AdminNav />
      <Body />
    </AdminGate>
  );
}

function Body() {
  const { state, error, loading, refresh } = useAdminState();
  const [actor, setActor] = useState<"hannah" | "ellie">("hannah");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jamie-admin-actor");
    if (stored === "hannah" || stored === "ellie") setActor(stored);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  };

  async function assign(floor: 1 | 2 | 3, bed: string, attendeeId: AttendeeId | null) {
    try {
      const res = await fetch("/api/jamie/admin/rooms", {
        method: "PUT",
        headers: { "content-type": "application/json", "x-admin-pw": ADMIN_PW },
        body: JSON.stringify({ floor, bed, attendeeId, actor }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      flash("saved ✿");
      refresh();
    } catch (e) {
      flash(`error: ${e}`);
    }
  }

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const assignedIds = new Set(state.rooms.assignments.filter((a) => a.attendeeId).map((a) => a.attendeeId));
  const unassigned = state.roster.filter((p) => !assignedIds.has(p.id));

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: fonts.script, fontSize: "1.15rem", color: colors.coral }}>
            who sleeps where
          </div>
          <h1 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "2rem", color: colors.navy, margin: 0, lineHeight: 1 }}>
            rooms
          </h1>
        </div>
        <ActorPicker
          actor={actor}
          setActor={(v) => {
            setActor(v);
            localStorage.setItem("jamie-admin-actor", v);
          }}
        />
      </header>

      <p style={{ fontFamily: fonts.script, fontSize: "1rem", color: colors.navySoft, marginBottom: 14 }}>
        ⚠️ Erica + Mahip prefer to room together (per the survey)
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {[1, 2, 3].map((floor) => (
          <FloorCard
            key={floor}
            floor={floor as 1 | 2 | 3}
            assignments={state.rooms.assignments.filter((a) => a.floor === floor)}
            roster={state.roster}
            onAssign={assign}
          />
        ))}
      </div>

      {unassigned.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "1.2rem", color: colors.navy, margin: "0 0 8px" }}>
            unassigned ({unassigned.length})
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {unassigned.map((p) => (
              <span
                key={p.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  background: colors[p.colorToken],
                  border: `2px solid ${colors.navy}`,
                  borderRadius: 999,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", border: `1px solid ${colors.navy}` }} />
                {p.name.split(" ")[0]}
              </span>
            ))}
          </div>
        </section>
      )}

      {toast && <Toast text={toast} />}
    </div>
  );
}

function FloorCard({
  floor,
  assignments,
  roster,
  onAssign,
}: {
  floor: 1 | 2 | 3;
  assignments: { floor: 1 | 2 | 3; bed: string; attendeeId: string | null }[];
  roster: { id: AttendeeId; name: string; colorToken: keyof typeof colors }[];
  onAssign: (floor: 1 | 2 | 3, bed: string, attendeeId: AttendeeId | null) => void;
}) {
  return (
    <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 14, padding: 14, boxShadow: stickerShadow }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: colors.coral,
          marginBottom: 10,
        }}
      >
        FLOOR {floor}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {assignments.map((a) => (
          <div key={a.bed} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, fontSize: "0.82rem", fontFamily: fonts.mono, color: colors.navySoft }}>
              {a.bed}
            </div>
            <select
              value={a.attendeeId || ""}
              onChange={(e) => onAssign(a.floor, a.bed, (e.target.value as AttendeeId) || null)}
              style={{
                flex: 2,
                padding: "6px 8px",
                border: `2px solid ${colors.navy}`,
                borderRadius: 6,
                background: a.attendeeId ? colors[roster.find((r) => r.id === a.attendeeId)?.colorToken || "cream"] : "#fff",
                fontFamily: fonts.body,
                fontSize: "0.85rem",
                color: colors.navy,
                cursor: "pointer",
              }}
            >
              <option value="">—</option>
              {roster.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.split(" ")[0]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActorPicker({ actor, setActor }: { actor: "hannah" | "ellie"; setActor: (v: "hannah" | "ellie") => void }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: "0.78rem", color: colors.navySoft }}>you are</span>
      {(["hannah", "ellie"] as const).map((name) => (
        <button
          key={name}
          onClick={() => setActor(name)}
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            border: `2px solid ${colors.navy}`,
            background: actor === name ? colors.coral : "#fff",
            color: colors.navy,
            fontSize: "0.78rem",
            fontWeight: actor === name ? 700 : 600,
            cursor: "pointer",
            boxShadow: actor === name ? "2px 2px 0 #1F2A44" : "none",
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: colors.navy, color: colors.cream, padding: "10px 18px", borderRadius: 999, fontWeight: 600, fontSize: "0.9rem", zIndex: 100 }}>
      {text}
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>🛏️</div>
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
