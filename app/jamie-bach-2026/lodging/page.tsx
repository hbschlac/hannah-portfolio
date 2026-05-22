"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import EditorialHero from "../_components/EditorialHero";
import ImageMosaic from "../_components/ImageMosaic";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";
import type { Attendee } from "@/lib/jamie/types";

const ROOM_TILES = [
  { src: "/jamie/venues/burbank-briar.jpg", alt: "Briar Rose Suite", span: "tall" as const },
  { src: "/jamie/venues/burbank-golden.jpg", alt: "Golden Rose Suite", span: "tall" as const },
  { src: "/jamie/venues/burbank-autumn.jpg", alt: "Autumn Rose Suite", span: "wide" as const },
  { src: "/jamie/venues/burbank-bourbon.jpg", alt: "Bourbon Rose Suite", span: "tall" as const },
  { src: "/jamie/venues/burbank-cherry.jpg", alt: "Cherry Rose Suite", span: "tall" as const },
];

const FLOOR_LABELS: Record<number, string> = {
  1: "First Floor",
  2: "Second Floor",
  3: "Third Floor",
};

export default function LodgingPage() {
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

  const byFloor = state.rooms.assignments.reduce<
    Record<number, typeof state.rooms.assignments>
  >((acc, a) => {
    (acc[a.floor] ||= []).push(a);
    return acc;
  }, {});

  const findAttendee = (id: string | null): Attendee | undefined =>
    id ? state.roster.find((r) => r.id === id) : undefined;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <EditorialHero
        src="/jamie/venues/burbank-briar.jpg"
        alt="The Burbank Rose Inn"
        eyebrow="The Stay"
        headline="The Burbank Rose Inn"
        dateline="111 Memorial Boulevard W · Newport"
        height={480}
        priority
      />

      <div style={{ padding: "0 24px" }}>
        <TripSubNav />
      </div>

      {/* Intro paragraph + meta */}
      <section style={{ padding: "32px 24px 0" }}>
        <p
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.55,
            color: colors.ink,
            margin: 0,
          }}
        >
          A nine-bed Victorian a five-minute walk from the harbor. Continental
          breakfast each morning, a wide front porch, and rooms named after
          roses.
        </p>
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px 24px",
            paddingTop: 22,
            borderTop: `1px solid ${colors.mist}`,
            borderBottom: `1px solid ${colors.mist}`,
            paddingBottom: 22,
          }}
        >
          <Meta label="Check-in" value="Friday, July 10" />
          <Meta label="Check-out" value="Monday, July 13" />
          <Meta label="Beds" value="9 · across 3 floors" />
          <Meta label="Phone" value="(401) 688-7958" href="tel:+14016887958" />
        </div>
        <div
          style={{
            display: "flex",
            gap: 22,
            paddingTop: 18,
          }}
        >
          <a
            href="https://maps.google.com/?q=111+Memorial+Blvd+W+Newport+RI+02840"
            target="_blank"
            rel="noopener noreferrer"
            style={textLinkStyle}
          >
            Open in maps
          </a>
          <a
            href="https://burbankrose.com"
            target="_blank"
            rel="noopener noreferrer"
            style={textLinkStyle}
          >
            Visit the inn
          </a>
        </div>
      </section>

      {/* Photo mosaic */}
      <section style={{ padding: "40px 24px 0" }}>
        <Eyebrow text="The Rooms" />
        <h2 style={h2Style}>Five named for roses.</h2>
        <div style={{ marginTop: 18 }}>
          <ImageMosaic tiles={ROOM_TILES} />
        </div>
      </section>

      {/* Assignments */}
      <section style={{ padding: "48px 24px 0" }}>
        <Eyebrow text="Who Sleeps Where" />
        <h2 style={h2Style}>The assignments.</h2>
        <div style={{ marginTop: 18 }}>
          {[1, 2, 3].map((floor) => (
            <div
              key={floor}
              style={{
                padding: "18px 0",
                borderBottom: `1px solid ${colors.mist}`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: colors.brass,
                  marginBottom: 10,
                }}
              >
                {FLOOR_LABELS[floor]}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {(byFloor[floor] || []).map((a, i) => {
                  const person = findAttendee(a.attendeeId);
                  return (
                    <div
                      key={`${floor}-${i}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        fontFamily: fonts.body,
                        fontSize: 14,
                        color: colors.ink,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.display,
                          fontWeight: 500,
                          fontSize: 17,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {person?.name ?? "—"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: colors.inkSoft,
                        }}
                      >
                        {a.bed}
                      </span>
                    </div>
                  );
                })}
              </div>
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
          Final assignments locked closer to the trip.
        </p>
      </section>

      {/* Emergency */}
      <section style={{ padding: "48px 24px 64px" }}>
        <Eyebrow text="Just in Case" />
        <h2 style={h2Style}>Numbers worth saving.</h2>
        <div style={{ marginTop: 18 }}>
          <EmergencyRow
            label="House staff"
            value={state.emergency.houseStaffPhone}
            href={`tel:${state.emergency.houseStaffPhone.replace(/\D/g, "")}`}
          />
          <EmergencyRow
            label="Nearest hospital"
            value={state.emergency.nearestHospital.name}
            sub={state.emergency.nearestHospital.address}
            href={`https://maps.google.com/?q=${encodeURIComponent(
              state.emergency.nearestHospital.address
            )}`}
          />
          <EmergencyRow
            label="Hospital phone"
            value={state.emergency.nearestHospital.phone}
            href={`tel:${state.emergency.nearestHospital.phone.replace(/\D/g, "")}`}
          />
          {state.emergency.planners.map((p) => (
            <EmergencyRow
              key={p.phone}
              label={`Planner — ${p.name}`}
              value={p.phone}
              href={`tel:${p.phone.replace(/\D/g, "")}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const h2Style = {
  fontFamily: fonts.display,
  fontWeight: 500,
  fontSize: "1.7rem",
  color: colors.ink,
  margin: "10px 0 0",
  letterSpacing: "-0.015em",
  lineHeight: 1.08,
} as const;

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

function Meta({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: colors.inkSoft,
          marginBottom: 4,
        }}
      >
        {label}
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
        {value}
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }
  return content;
}

function EmergencyRow({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "16px 0",
        borderBottom: `1px solid ${colors.mist}`,
        textDecoration: "none",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.inkSoft,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 16,
            color: colors.ink,
            letterSpacing: "-0.005em",
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.inkSoft,
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </a>
  );
}

const textLinkStyle = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: colors.ink,
  borderBottom: `1px solid ${colors.brass}`,
  paddingBottom: 4,
  textDecoration: "none",
};

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
