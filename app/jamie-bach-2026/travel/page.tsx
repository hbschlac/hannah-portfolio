"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { Flight, Attendee } from "@/lib/jamie/types";

export default function TravelPage() {
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

  const flightsByAirport = Object.values(state.flights).reduce<
    Record<string, Flight[]>
  >((acc, f) => {
    const key = f.arrivalAirport || "tbd";
    (acc[key] ||= []).push(f);
    return acc;
  }, {});

  const tbdFlights = flightsByAirport["tbd"] || [];
  delete flightsByAirport["tbd"];

  const findPerson = (id: string): Attendee | undefined =>
    state.roster.find((r) => r.id === id);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <SectionHeader kicker="how we're getting there 🛫" title="travel" />
      <TripSubNav />

      <section style={{ padding: "12px 20px 0" }}>
        <SubHeader emoji="✈️" title="flights" />

        {Object.entries(flightsByAirport).length > 0 ? (
          Object.entries(flightsByAirport).map(([airport, flights]) => (
            <AirportGroup
              key={airport}
              airport={airport}
              flights={flights}
              findPerson={findPerson}
            />
          ))
        ) : null}

        {tbdFlights.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: "0.78rem",
                fontWeight: 700,
                color: colors.navySoft,
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              STILL BOOKING ✈️
            </div>
            <div
              style={{
                background: "#fff",
                border: `3px solid ${colors.navy}`,
                borderRadius: 12,
                padding: 14,
                boxShadow: stickerShadow,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {tbdFlights.map((f) => {
                const p = findPerson(f.attendeeId);
                if (!p) return null;
                return (
                  <span
                    key={f.attendeeId}
                    style={{
                      padding: "3px 9px",
                      background: colors.cream,
                      border: `2px solid ${colors.navy}`,
                      borderRadius: 999,
                      fontSize: "0.78rem",
                    }}
                  >
                    {p.name.split(" ")[0]} · {p.city}
                  </span>
                );
              })}
            </div>
            <p
              style={{
                marginTop: 8,
                fontFamily: fonts.script,
                fontSize: "1rem",
                color: colors.navySoft,
              }}
            >
              text hannah your flight info when you book ✨
            </p>
          </div>
        )}
      </section>

      <section style={{ padding: "32px 20px 0" }}>
        <SubHeader emoji="🚗" title="ground transport" />
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            border: `3px solid ${colors.navy}`,
            borderRadius: 12,
            padding: 16,
            boxShadow: stickerShadow,
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0 }}>
            most of us are flying into <strong>PVD</strong> (Providence, ~30 min) or{" "}
            <strong>BOS</strong> (Boston, ~1.5 hrs).
          </p>
          <p style={{ margin: "10px 0 0", fontFamily: fonts.script, fontSize: "1.05rem", color: colors.coral }}>
            rental car groups still being figured out — once flights firm up
            we&apos;ll match people who land near each other ✨
          </p>
        </div>
      </section>

      <section style={{ padding: "32px 20px 40px" }}>
        <SubHeader emoji="🅿️" title="parking · for the cruise" />
        <div
          style={{
            marginTop: 12,
            background: colors.lime,
            border: `3px solid ${colors.navy}`,
            borderRadius: 12,
            padding: 14,
            boxShadow: stickerShadow,
            fontSize: "0.85rem",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Mary St lot</strong> — $3/hr, 3-min walk to the boat. Or
            rideshare — parking is rough in summer.
          </p>
        </div>
      </section>
    </div>
  );
}

function AirportGroup({
  airport,
  flights,
  findPerson,
}: {
  airport: string;
  flights: Flight[];
  findPerson: (id: string) => Attendee | undefined;
}) {
  const cityName: Record<string, string> = {
    PVD: "providence",
    BOS: "boston",
  };
  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: "0.78rem",
          fontWeight: 700,
          color: colors.coral,
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        ✈️ {airport.toUpperCase()} · {cityName[airport] || ""}
      </div>
      <div
        style={{
          background: "#fff",
          border: `3px solid ${colors.navy}`,
          borderRadius: 12,
          boxShadow: stickerShadow,
          overflow: "hidden",
        }}
      >
        {flights.map((f, i) => {
          const p = findPerson(f.attendeeId);
          if (!p) return null;
          return (
            <div
              key={f.attendeeId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderTop: i === 0 ? "none" : `1px solid ${colors.navy}`,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: colors[p.colorToken],
                  border: `1.5px solid ${colors.navy}`,
                }}
              />
              <div style={{ flex: 1, fontSize: "0.88rem" }}>
                <strong>{p.name.split(" ")[0]}</strong>
                <span style={{ color: colors.navySoft }}> · {p.city}</span>
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: "0.78rem",
                  color: colors.navy,
                  textAlign: "right",
                }}
              >
                {f.airline && f.flightNumber
                  ? `${f.airline} ${f.flightNumber}`
                  : "—"}
                <br />
                {f.arrivalTime ? `${formatTime(f.arrivalTime)}` : ""}
              </div>
            </div>
          );
        })}
      </div>
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

function formatTime(t24: string): string {
  const [h, m] = t24.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${period}`;
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>🛫</div>
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
