"use client";

import Link from "next/link";
import PasswordGate from "./_components/PasswordGate";
import BottomNav from "./_components/BottomNav";
import Countdown from "./_components/Countdown";
import EditorialHero from "./_components/EditorialHero";
import PhotoCaption from "./_components/PhotoCaption";
import PortraitCard from "./_components/PortraitCard";
import { CurrentWeatherChip } from "./_components/WeatherChip";
import { useGuestState } from "./_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

// Day → cover photo mapping for the "what's the plan" mosaic
const dayCovers: Record<string, { src: string; alt: string; caption: string }> = {
  fri: {
    src: "/jamie/newport/cliff-walk-real.jpg",
    alt: "Aerial view of Newport mansions along the Cliff Walk coast",
    caption: "Friday — settling in, slow lunch, first dinner.",
  },
  sat: {
    src: "/jamie/newport/sailboats-sunset.jpg",
    alt: "Sailboats silhouetted against a Newport sunset",
    caption: "Saturday — brunch, sunset cruise, the big dinner.",
  },
  sun: {
    src: "/jamie/newport/newport-rocks.jpg",
    alt: "Newport's Cliff Walk gazebo at sunset",
    caption: "Sunday — Cliff Walk, last brunch, fly home.",
  },
};

export default function JamieBachHome() {
  return (
    <PasswordGate
      guestPassword="Newport"
      adminPassword="Admin-July2026"
      storageKey="jamie-bach-unlocked"
    >
      <HomeContent />
      <BottomNav />
    </PasswordGate>
  );
}

function HomeContent() {
  const { state, error, loading } = useGuestState();

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const { trip, roster, itinerary, photosUrl, groupChatUrl } = state;
  const visibleRoster = roster.slice(0, 6);
  const days: Array<"fri" | "sat" | "sun"> = ["fri", "sat", "sun"];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <EditorialHero
        src="/jamie/newport/hero-harbor.jpg"
        alt="The Oliver Hazard Perry tall ship docked in Newport Harbor"
        eyebrow="A Newport Bachelorette"
        headline={`For ${trip.bride}`}
        dateline="Newport, Rhode Island · July 10–12, 2026"
        height={620}
        priority
      />

      <div
        style={{
          padding: "32px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <p
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontSize: 19,
            lineHeight: 1.55,
            color: colors.ink,
            margin: 0,
            letterSpacing: "-0.005em",
          }}
        >
          Four days on the Rhode Island coast for {trip.bride.split(" ")[0]} — sail-cloth sunsets,
          long dinners, and the kind of summer light New England saves for July.
          Here&apos;s what we&apos;ve planned.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 20,
            borderTop: `1px solid ${colors.mist}`,
            borderBottom: `1px solid ${colors.mist}`,
            paddingBottom: 18,
          }}
        >
          <Countdown targetDate={trip.startDate} />
          <CurrentWeatherChip />
        </div>
      </div>

      {/* THE WEEKEND */}
      <section style={{ padding: "48px 24px 0" }}>
        <Eyebrow text="The Weekend" />
        <h2
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: "2rem",
            color: colors.ink,
            margin: "10px 0 24px",
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
          }}
        >
          Three days, planned in pencil.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {days.map((d) => {
            const cover = dayCovers[d];
            return <PhotoCaption key={d} {...cover} ratio="wide" />;
          })}
        </div>
        <Link
          href="/jamie-bach-2026/itinerary"
          style={textLinkStyle}
        >
          See the full itinerary
        </Link>
      </section>

      {/* THE SQUAD PREVIEW */}
      <section style={{ padding: "56px 24px 0" }}>
        <Eyebrow text="The Squad" />
        <h2
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: "2rem",
            color: colors.ink,
            margin: "10px 0 24px",
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
          }}
        >
          The nine of us.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          {visibleRoster.map((a) => (
            <PortraitCard
              key={a.id}
              name={a.name.split(" ")[0]}
              role={a.role === "bride" ? "Bride" : undefined}
              city={a.city}
              photoUrl={a.photoUrl}
            />
          ))}
        </div>
        <Link href="/jamie-bach-2026/squad" style={textLinkStyle}>
          Meet everyone
        </Link>
      </section>

      {/* THE TABLE */}
      <section style={{ padding: "56px 24px 0" }}>
        <Eyebrow text="The Table" />
        <h2
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: "2rem",
            color: colors.ink,
            margin: "10px 0 24px",
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
          }}
        >
          A long weekend at the Burbank Rose Inn.
        </h2>
        <PhotoCaption
          src="/jamie/newport/cottage.jpg"
          alt="Coastal cottage with white picket fence"
          ratio="wide"
          caption="A 9-bed Victorian a five-minute walk to the harbor."
        />
        <Link href="/jamie-bach-2026/lodging" style={textLinkStyle}>
          See the inn
        </Link>
      </section>

      {/* CTAs */}
      <section style={{ padding: "56px 24px 64px" }}>
        <Eyebrow text="Stay Connected" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 18,
          }}
        >
          <ExternalLink
            href={photosUrl}
            label="Shared photo album"
            hint={photosUrl ? "Open in iCloud" : "Coming soon"}
          />
          <ExternalLink
            href={groupChatUrl}
            label="Group chat"
            hint={groupChatUrl ? "Join the iMessage thread" : "Coming soon"}
          />
        </div>
      </section>
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
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: colors.brass,
      }}
    >
      {text}
    </div>
  );
}

const textLinkStyle = {
  display: "inline-block",
  marginTop: 24,
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

function ExternalLink({
  href,
  label,
  hint,
}: {
  href?: string | null;
  label: string;
  hint: string;
}) {
  const disabled = !href;
  const content = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "18px 0",
        borderBottom: `1px solid ${colors.mist}`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 500,
          fontSize: 19,
          color: colors.ink,
          letterSpacing: "-0.005em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: fonts.body,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: colors.inkSoft,
        }}
      >
        {hint}
      </span>
    </div>
  );
  if (disabled) return content;
  return (
    <a
      href={href!}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      {content}
    </a>
  );
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
