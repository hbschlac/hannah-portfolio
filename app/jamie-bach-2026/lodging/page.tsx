"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import TripSubNav from "../_components/TripSubNav";
import EditorialHero from "../_components/EditorialHero";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

// Source of truth: Burbank Rose Inn invoice (Reservation #1016, 1/8/26) +
// May 12 email from Dawn confirming room contents. Hannah noted on 5/22 that
// a third suite is also booked — exact suite + beds TBD; placeholder below.
// Fri 7/10 → Sun 7/12 (two nights).
const SUITES = [
  {
    name: "Golden Rose Suite",
    coverSrc: "/jamie/venues/burbank-golden.jpg",
    beds: [
      { label: "King bed", count: 1 },
      { label: "Twin bed", count: 2 },
    ],
    sleeps: 4,
  },
  {
    name: "Cherry Rose Suite",
    coverSrc: "/jamie/venues/burbank-cherry.jpg",
    beds: [
      { label: "Queen bed", count: 1 },
      { label: "Queen pullout", count: 1 },
    ],
    sleeps: 4,
  },
  {
    name: "Third Rose Suite",
    coverSrc: "/jamie/venues/burbank-briar.jpg",
    beds: [{ label: "Bed layout — confirming with the inn", count: 0 }],
    sleeps: 0,
  },
] as const;

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

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <EditorialHero
        src="/jamie/venues/burbank-exterior.jpg"
        alt="The Burbank Rose Inn — a green Victorian on Memorial Boulevard"
        eyebrow="The Stay"
        headline="The Burbank Rose Inn"
        dateline="111 Memorial Boulevard W · Newport"
        height={480}
        priority
      />

      <div style={{ padding: "0 24px" }}>
        <TripSubNav />
      </div>

      {/* Intro + meta */}
      <section style={{ padding: "32px 24px 0" }}>
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 17,
            lineHeight: 1.55,
            color: colors.ink,
            margin: 0,
          }}
        >
          Three suites at a Victorian inn, five minutes from the harbor.
          Continental breakfast each morning and a wide front porch.
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
          <Meta label="Check-in" value="Fri July 10 · 3:00 pm" />
          <Meta label="Check-out" value="Sun July 12 · 11:00 am" />
          <Meta label="Suites" value="3 · sleeping nine" />
          <Meta label="Phone" value="(401) 688-7958" href="tel:+14016887958" />
        </div>
        <div style={{ display: "flex", gap: 22, paddingTop: 18 }}>
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

      {/* Suite-by-suite breakdown */}
      <section style={{ padding: "48px 24px 0" }}>
        <Eyebrow text="Bed Layout" />
        <h2 style={h2Style}>Who sleeps where.</h2>
        <div style={{ marginTop: 18 }}>
          {SUITES.map((suite) => (
            <div
              key={suite.name}
              style={{
                padding: "22px 0",
                borderBottom: `1px solid ${colors.mist}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontFamily: fonts.display,
                    fontWeight: 500,
                    fontSize: 22,
                    color: colors.ink,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {suite.name}
                </h3>
                {suite.sleeps > 0 && (
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: colors.brass,
                    }}
                  >
                    Sleeps {suite.sleeps}
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.ink,
                }}
              >
                {suite.beds.map((b) => (
                  <li
                    key={b.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <span style={b.count === 0 ? { color: colors.inkSoft } : undefined}>
                      {b.label}
                    </span>
                    {b.count > 0 && (
                      <span style={{ color: colors.inkSoft }}>×{b.count}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: 20,
            fontFamily: fonts.display,
            fontSize: 14,
            color: colors.inkSoft,
            lineHeight: 1.5,
          }}
        >
          Room assignments TBD — Hannah&apos;s sorting closer to the trip.
        </p>
      </section>

      {/* Burbank Rose contact */}
      <section style={{ padding: "48px 24px 64px" }}>
        <Eyebrow text="Burbank Rose Inn — Contact" />
        <h2 style={h2Style}>For the inn directly.</h2>
        <div style={{ marginTop: 18 }}>
          <EmergencyRow
            label="Address"
            value="111 Memorial Blvd W, Newport, RI 02840"
            href="https://maps.google.com/?q=111+Memorial+Blvd+W+Newport+RI+02840"
          />
          <EmergencyRow
            label="Phone"
            value="(401) 688-7958"
            href="tel:+14016887958"
          />
          <EmergencyRow
            label="Email"
            value="Burbankrose@yahoo.com"
            href="mailto:Burbankrose@yahoo.com"
          />
          <EmergencyRow
            label="Website"
            value="burbankrose.com"
            href="https://burbankrose.com"
          />
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
