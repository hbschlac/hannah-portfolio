"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";
import type { Attendee } from "@/lib/jamie/types";

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

  const findPerson = (id: string): Attendee | undefined =>
    state.roster.find((r) => r.id === id);

  const flights = Object.values(state.flights);
  const carPeople = flights
    .filter((f) => f.mode === "car")
    .map((f) => findPerson(f.attendeeId))
    .filter((p): p is Attendee => Boolean(p));
  const mahip = carPeople.find((p) => p.name.split(" ")[0] === "Mahip");
  const flyPeople = flights
    .filter((f) => f.mode === "fly")
    .map((f) => findPerson(f.attendeeId))
    .filter((p): p is Attendee => Boolean(p));

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="Getting There"
        title="Getting to Newport."
        dek="Most of us drive up together from NYC; a couple are flying into Providence."
      />
      <TripSubNav />

      <section style={{ padding: "32px 24px 0" }}>
        <Eyebrow text="By Car" />
        <h2 style={h2Style}>The rental car crew.</h2>
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 16,
            color: colors.ink,
            lineHeight: 1.55,
            marginTop: 16,
          }}
        >
          Seven of us are driving up together — the rental car is{" "}
          <strong>booked</strong>. The departure time and where we&apos;ll all
          meet in NYC are still <strong>TBD</strong> — details to come.
        </p>
        <PeopleList people={carPeople} asteriskId={mahip?.id} />
        {mahip && (
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.inkSoft,
              lineHeight: 1.5,
              marginTop: 16,
            }}
          >
            * {mahip.name.split(" ")[0]} is only taking the rental car back to
            NY, not up to Newport.
          </p>
        )}
      </section>

      <section style={{ padding: "48px 24px 64px" }}>
        <Eyebrow text="By Air" />
        <h2 style={h2Style}>Flying into Providence.</h2>
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 16,
            color: colors.ink,
            lineHeight: 1.55,
            marginTop: 16,
          }}
        >
          Zoe and Daniella are flying in and out of <strong>Providence (PVD)</strong>
          , about 30 minutes from Newport, and will sort their own ride to the
          inn.
        </p>
        <PeopleList people={flyPeople} airport="PVD" />
      </section>
    </div>
  );
}

function PeopleList({
  people,
  airport,
  asteriskId,
}: {
  people: Attendee[];
  airport?: string;
  asteriskId?: string;
}) {
  if (!people.length) return null;
  return (
    <div style={{ marginTop: 20, borderTop: `1px solid ${colors.mist}` }}>
      {people.map((p) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "14px 0",
            borderBottom: `1px solid ${colors.mist}`,
            gap: 12,
          }}
        >
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
            {p.id === asteriskId ? " *" : ""}
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: colors.inkSoft,
            }}
          >
            {airport ? `${p.city} → ${airport}` : p.city}
          </div>
        </div>
      ))}
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
