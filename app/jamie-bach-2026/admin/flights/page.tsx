"use client";

import { useState, useEffect } from "react";
import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { Flight, Attendee } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

export default function FlightsAdminPage() {
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

  async function update(attendeeId: string, patch: Partial<Flight>) {
    try {
      const res = await fetch("/api/jamie/admin/flights", {
        method: "PUT",
        headers: { "content-type": "application/json", "x-admin-pw": ADMIN_PW },
        body: JSON.stringify({ attendeeId, patch, actor }),
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

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: fonts.script, fontSize: "1.15rem", color: colors.coral }}>
            who's flying when
          </div>
          <h1 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "2rem", color: colors.navy, margin: 0, lineHeight: 1 }}>
            flights
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

      <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 14, boxShadow: stickerShadow, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 1fr 80px 90px 100px 90px",
            gap: 8,
            padding: "10px 14px",
            background: colors.cream,
            borderBottom: `2px solid ${colors.navy}`,
            fontFamily: fonts.mono,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: colors.navy,
          }}
        >
          <div>NAME</div>
          <div>STATUS</div>
          <div>AIRLINE / FLIGHT #</div>
          <div>FROM</div>
          <div>TO</div>
          <div>DATE</div>
          <div>TIME</div>
        </div>
        {state.roster.map((person) => (
          <FlightRow
            key={person.id}
            person={person}
            flight={state.flights[person.id]}
            onUpdate={(patch) => update(person.id, patch)}
          />
        ))}
      </div>

      {toast && <Toast text={toast} />}
    </div>
  );
}

function FlightRow({
  person,
  flight,
  onUpdate,
}: {
  person: Attendee;
  flight: Flight | undefined;
  onUpdate: (patch: Partial<Flight>) => void;
}) {
  const f = flight || { attendeeId: person.id, status: "tbd" as const };
  const [airline, setAirline] = useState(f.airline || "");
  const [flightNum, setFlightNum] = useState(f.flightNumber || "");
  const [origin, setOrigin] = useState(f.originAirport || "");
  const [arr, setArr] = useState(f.arrivalAirport || "");
  const [date, setDate] = useState(f.arrivalDate || "");
  const [time, setTime] = useState(f.arrivalTime || "");

  useEffect(() => {
    setAirline(f.airline || "");
    setFlightNum(f.flightNumber || "");
    setOrigin(f.originAirport || "");
    setArr(f.arrivalAirport || "");
    setDate(f.arrivalDate || "");
    setTime(f.arrivalTime || "");
  }, [flight?.airline, flight?.flightNumber, flight?.originAirport, flight?.arrivalAirport, flight?.arrivalDate, flight?.arrivalTime]);

  const blur = (key: keyof Flight, value: string | undefined, current: string | undefined) => {
    if ((value || "") !== (current || "")) {
      onUpdate({ [key]: value || undefined } as Partial<Flight>);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 90px 1fr 80px 90px 100px 90px",
        gap: 8,
        padding: "10px 14px",
        borderBottom: `1px solid ${colors.navy}22`,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: colors[person.colorToken],
            border: `1.5px solid ${colors.navy}`,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{person.name.split(" ")[0]}</div>
          <div style={{ fontSize: "0.68rem", color: colors.navySoft, fontFamily: fonts.mono }}>{person.city}</div>
        </div>
      </div>
      <select
        value={f.status}
        onChange={(e) => onUpdate({ status: e.target.value as Flight["status"] })}
        style={{ ...inputStyle, fontSize: "0.78rem", padding: "4px 6px" }}
      >
        <option value="tbd">⚪ tbd</option>
        <option value="pending">🟡 pending</option>
        <option value="booked">✅ booked</option>
      </select>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          placeholder="JetBlue"
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          onBlur={() => blur("airline", airline, f.airline)}
          style={{ ...inputStyle, flex: 1, fontSize: "0.78rem" }}
        />
        <input
          placeholder="1234"
          value={flightNum}
          onChange={(e) => setFlightNum(e.target.value)}
          onBlur={() => blur("flightNumber", flightNum, f.flightNumber)}
          style={{ ...inputStyle, width: 60, fontSize: "0.78rem" }}
        />
      </div>
      <input
        placeholder="JFK"
        value={origin}
        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
        onBlur={() => blur("originAirport", origin, f.originAirport)}
        style={{ ...inputStyle, fontSize: "0.78rem", textTransform: "uppercase" }}
      />
      <select
        value={arr}
        onChange={(e) => {
          setArr(e.target.value);
          onUpdate({ arrivalAirport: e.target.value || undefined });
        }}
        style={{ ...inputStyle, fontSize: "0.78rem", padding: "4px 6px" }}
      >
        <option value="">—</option>
        <option value="PVD">PVD</option>
        <option value="BOS">BOS</option>
        <option value="OTHER">other</option>
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onBlur={() => blur("arrivalDate", date, f.arrivalDate)}
        style={{ ...inputStyle, fontSize: "0.78rem" }}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onBlur={() => blur("arrivalTime", time, f.arrivalTime)}
        style={{ ...inputStyle, fontSize: "0.78rem" }}
      />
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
        fontWeight: 600,
        fontSize: "0.9rem",
        zIndex: 100,
      }}
    >
      {text}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: `2px solid ${colors.navy}`,
  borderRadius: 6,
  background: "#fff",
  fontFamily: fonts.body,
  fontSize: "0.85rem",
  color: colors.navy,
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
};

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>✈️</div>
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
