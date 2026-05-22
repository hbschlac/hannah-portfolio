"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";
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
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="Getting There"
        title="Flights & ground."
        dek="Providence is closer; Boston is bigger. Most of us land on Friday."
      />
      <TripSubNav />

      <section style={{ padding: "32px 24px 0" }}>
        <Eyebrow text="Arrivals" />
        <h2 style={h2Style}>Flights, by airport.</h2>

        <div style={{ marginTop: 20 }}>
          {Object.entries(flightsByAirport).map(([airport, flights]) => (
            <AirportSection
              key={airport}
              airport={airport}
              flights={flights}
              findPerson={findPerson}
            />
          ))}
        </div>

        {tbdFlights.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <Eyebrow text="Still Booking" />
            <h3
              style={{
                ...h2Style,
                fontSize: "1.3rem",
                marginTop: 8,
              }}
            >
              Waiting on these.
            </h3>
            <div
              style={{
                paddingTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 18px",
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.inkSoft,
              }}
            >
              {tbdFlights.map((f) => {
                const p = findPerson(f.attendeeId);
                if (!p) return null;
                return (
                  <span key={f.attendeeId}>
                    <span style={{ color: colors.ink, fontWeight: 500 }}>
                      {p.name.split(" ")[0]}
                    </span>{" "}
                    · {p.city}
                  </span>
                );
              })}
            </div>
            <p
              style={{
                marginTop: 18,
                fontFamily: fonts.display,
                fontSize: 14,
                color: colors.inkSoft,
              }}
            >
              Text Hannah your flight info when you book.
            </p>
          </div>
        )}
      </section>

      <section style={{ padding: "48px 24px 0" }}>
        <Eyebrow text="On the Ground" />
        <h2 style={h2Style}>Getting from the airport to the inn.</h2>
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 16,
            color: colors.ink,
            lineHeight: 1.55,
            marginTop: 16,
          }}
        >
          Most of us are flying into <strong>PVD</strong> (Providence, about 30
          minutes from Newport) or <strong>BOS</strong> (Boston, about an hour
          and a half). Rental car groups firm up once flights do — we&apos;ll
          pair people who land near each other.
        </p>
      </section>

      <section style={{ padding: "48px 24px 64px" }}>
        <Eyebrow text="Parking for the Cruise" />
        <h2 style={h2Style}>Mary Street Lot.</h2>
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 15,
            color: colors.ink,
            lineHeight: 1.55,
            marginTop: 14,
          }}
        >
          $3/hr, three minutes from the dock. Rideshare also works — Newport
          parking is rough in July.
        </p>
      </section>
    </div>
  );
}

function AirportSection({
  airport,
  flights,
  findPerson,
}: {
  airport: string;
  flights: Flight[];
  findPerson: (id: string) => Attendee | undefined;
}) {
  const cityName: Record<string, string> = {
    PVD: "Providence",
    BOS: "Boston",
  };
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: colors.brass,
          marginBottom: 8,
        }}
      >
        {airport} — {cityName[airport] || ""}
      </div>
      <div style={{ borderTop: `1px solid ${colors.mist}` }}>
        {flights.map((f) => {
          const p = findPerson(f.attendeeId);
          if (!p) return null;
          return (
            <div
              key={f.attendeeId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "14px 0",
                borderBottom: `1px solid ${colors.mist}`,
                gap: 12,
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
                  {p.name.split(" ")[0]}
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
                  {p.city}
                </div>
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: colors.ink,
                  textAlign: "right",
                }}
              >
                <div>
                  {f.airline && f.flightNumber
                    ? `${f.airline} ${f.flightNumber}`
                    : "—"}
                </div>
                {f.arrivalTime && (
                  <div
                    style={{
                      color: colors.inkSoft,
                      fontSize: 12,
                      letterSpacing: "0.06em",
                      marginTop: 2,
                    }}
                  >
                    Arr. {formatTime(f.arrivalTime)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
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

const h2Style = {
  fontFamily: fonts.display,
  fontWeight: 500,
  fontSize: "1.6rem",
  color: colors.ink,
  margin: "10px 0 0",
  letterSpacing: "-0.015em",
  lineHeight: 1.08,
} as const;

function formatTime(t24: string): string {
  const [h, m] = t24.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${period}`;
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
