"use client";

import { useState, useEffect } from "react";
import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { Reservation } from "@/lib/jamie/types";

const STATUS_ORDER: Reservation["status"][] = [
  "tbd",
  "pending",
  "booked",
  "confirmed",
  "paid",
];

const STATUS_LABEL: Record<Reservation["status"], string> = {
  tbd: "⚪ tbd",
  pending: "🟡 pending",
  booked: "🔵 booked",
  confirmed: "✅ confirmed",
  paid: "💚 paid",
};

const STATUS_BG: Record<Reservation["status"], string> = {
  tbd: "#eee",
  pending: "#FFE89A",
  booked: "#A8D8FF",
  confirmed: colors.lime,
  paid: "#9CDFB0",
};

export default function ReservationsAdminPage() {
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jamie-admin-actor");
    if (stored === "hannah" || stored === "ellie") setActor(stored);
  }, []);

  const setActorPersistent = (v: "hannah" | "ellie") => {
    setActor(v);
    localStorage.setItem("jamie-admin-actor", v);
  };

  const flashToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const updateRes = async (id: string, patch: Partial<Reservation>) => {
    setSaving(id);
    try {
      const res = await fetch("/api/jamie/admin/reservations", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-pw": "Admin-July2026",
        },
        body: JSON.stringify({ id, patch, actor }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      flashToast("saved ✿");
      refresh();
    } catch (e) {
      flashToast(`error: ${e}`);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: fonts.script,
              fontSize: "1.15rem",
              color: colors.coral,
            }}
          >
            who&apos;s booked what
          </div>
          <h1
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "2rem",
              color: colors.navy,
              margin: 0,
              lineHeight: 1,
            }}
          >
            reservations
          </h1>
        </div>
        <ActorPicker actor={actor} setActor={setActorPersistent} />
      </header>

      <div
        style={{
          background: "#fff",
          border: `3px solid ${colors.navy}`,
          borderRadius: 14,
          boxShadow: stickerShadow,
          overflow: "hidden",
        }}
      >
        {state.reservations.map((r, i) => (
          <ReservationRow
            key={r.id}
            res={r}
            isFirst={i === 0}
            expanded={expandedId === r.id}
            saving={saving === r.id}
            onToggle={() => setExpandedId((cur) => (cur === r.id ? null : r.id))}
            onUpdate={(patch) => updateRes(r.id, patch)}
          />
        ))}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: colors.navy,
            color: colors.cream,
            padding: "10px 18px",
            borderRadius: 999,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: "0.9rem",
            zIndex: 100,
            boxShadow: "4px 4px 0 #00000033",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function ActorPicker({
  actor,
  setActor,
}: {
  actor: "hannah" | "ellie";
  setActor: (v: "hannah" | "ellie") => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: "0.78rem", color: colors.navySoft }}>
        you are
      </span>
      {(["hannah", "ellie"] as const).map((name) => {
        const active = actor === name;
        return (
          <button
            key={name}
            onClick={() => setActor(name)}
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              border: `2px solid ${colors.navy}`,
              background: active ? colors.coral : "#fff",
              color: colors.navy,
              fontSize: "0.78rem",
              fontWeight: active ? 700 : 600,
              fontFamily: fonts.body,
              cursor: "pointer",
              boxShadow: active ? "2px 2px 0 #1F2A44" : "none",
            }}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

function ReservationRow({
  res,
  isFirst,
  expanded,
  saving,
  onToggle,
  onUpdate,
}: {
  res: Reservation;
  isFirst: boolean;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Reservation>) => void;
}) {
  const [confNum, setConfNum] = useState(res.confirmationNumber || "");
  const [internal, setInternal] = useState(res.internalNote || "");
  const [guestNote, setGuestNote] = useState(res.guestNote || "");
  const [totalCost, setTotalCost] = useState(
    res.totalCost?.toString() || ""
  );

  useEffect(() => {
    setConfNum(res.confirmationNumber || "");
    setInternal(res.internalNote || "");
    setGuestNote(res.guestNote || "");
    setTotalCost(res.totalCost?.toString() || "");
  }, [res]);

  return (
    <div style={{ borderTop: isFirst ? "none" : `1px solid ${colors.navy}33` }}>
      <div
        onClick={onToggle}
        style={{
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto auto",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          background: expanded ? "#FFF8EC" : "#fff",
        }}
      >
        <div style={{ fontSize: "1.4rem" }}>{res.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{res.name}</div>
          <div
            style={{
              fontSize: "0.78rem",
              color: colors.navySoft,
              fontFamily: fonts.mono,
            }}
          >
            {res.when}
          </div>
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            color: colors.navySoft,
            fontFamily: fonts.mono,
          }}
        >
          {res.owner}
        </div>
        <select
          value={res.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            onUpdate({ status: e.target.value as Reservation["status"] })
          }
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            border: `2px solid ${colors.navy}`,
            background: STATUS_BG[res.status],
            fontSize: "0.78rem",
            fontWeight: 700,
            fontFamily: fonts.body,
            cursor: "pointer",
          }}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <div style={{ fontSize: "0.95rem", color: colors.navy }}>
          {expanded ? "▾" : "▸"}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            padding: "8px 16px 18px",
            background: colors.cream,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <Field label="confirmation #">
            <input
              value={confNum}
              onChange={(e) => setConfNum(e.target.value)}
              onBlur={() => {
                if (confNum !== (res.confirmationNumber || "")) {
                  onUpdate({ confirmationNumber: confNum || undefined });
                }
              }}
              style={inputStyle}
            />
          </Field>
          <Field label="total cost">
            <input
              type="number"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              onBlur={() => {
                const num = totalCost === "" ? undefined : Number(totalCost);
                if (num !== res.totalCost) {
                  onUpdate({ totalCost: num });
                }
              }}
              style={inputStyle}
            />
          </Field>
          <Field label="internal note (planners only)" full>
            <textarea
              value={internal}
              onChange={(e) => setInternal(e.target.value)}
              onBlur={() => {
                if (internal !== (res.internalNote || "")) {
                  onUpdate({ internalNote: internal || undefined });
                }
              }}
              rows={2}
              style={textareaStyle}
            />
          </Field>
          <Field label="guest-visible note" full>
            <textarea
              value={guestNote}
              onChange={(e) => setGuestNote(e.target.value)}
              onBlur={() => {
                if (guestNote !== (res.guestNote || "")) {
                  onUpdate({ guestNote: guestNote || undefined });
                }
              }}
              rows={2}
              style={textareaStyle}
            />
          </Field>
          <div
            style={{
              gridColumn: "1 / -1",
              fontSize: "0.78rem",
              color: colors.navySoft,
              fontFamily: fonts.mono,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {res.contact?.phone && <span>📞 {res.contact.phone}</span>}
            {res.contact?.email && <span>✉️ {res.contact.email}</span>}
            {res.contact?.url && (
              <a
                href={res.contact.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.coral }}
              >
                🌐 {res.contact.url.replace(/^https?:\/\//, "")}
              </a>
            )}
            {saving && (
              <span style={{ color: colors.coral }}>saving...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div
        style={{
          fontSize: "0.7rem",
          fontFamily: fonts.mono,
          letterSpacing: "0.05em",
          fontWeight: 700,
          color: colors.navySoft,
          marginBottom: 3,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: `2px solid ${colors.navy}`,
  borderRadius: 8,
  background: "#fff",
  fontFamily: fonts.body,
  fontSize: "0.88rem",
  color: colors.navy,
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: fonts.body,
  resize: "vertical",
};

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>📅</div>
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
