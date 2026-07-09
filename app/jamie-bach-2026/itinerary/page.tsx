"use client";

import Image from "next/image";
import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import TripSubNav from "../_components/TripSubNav";
import SectionHeader from "../_components/SectionHeader";
import { EventWeatherChip, MarineCard } from "../_components/WeatherChip";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";
import type { ItineraryEvent } from "@/lib/jamie/types";

const dayMeta: Record<
  string,
  {
    label: string;
    subtitle: string;
    theme?: string;
    cover: { src: string; alt: string };
  }
> = {
  fri: {
    label: "Day One — Friday, July 10",
    subtitle: "Settling in, a walk along the water, first night together.",
    theme: "Theme: Something Blue 💙",
    cover: {
      src: "/jamie/newport/cliff-walk-real.jpg",
      alt: "Aerial view of Newport mansions along the Cliff Walk coast",
    },
  },
  sat: {
    label: "Day Two — Saturday, July 11",
    subtitle: "Pilates, fun around Newport, and sunset cruise.",
    theme: "Theme: The Last Disco ✨",
    cover: {
      src: "/jamie/newport/sailboats-sunset.jpg",
      alt: "Sailboats silhouetted against a Newport sunset",
    },
  },
  sun: {
    label: "Day Three — Sunday, July 12",
    subtitle: "One last brunch at CRU — head home whenever.",
    cover: {
      src: "/jamie/venues/downtown-ri.jpg",
      alt: "Downtown Newport — colorful storefronts and flags along the street",
    },
  },
};

// Per-event editorial thumbnail — actual venue photos where available
const eventCovers: Record<string, { src: string; alt: string }> = {
  "fri-lunch": {
    src: "/jamie/newport/newport-downtown.jpg",
    alt: "Downtown Newport — cobblestone street lined with shops and cafes",
  },
  "fri-cliff-walk": {
    src: "/jamie/newport/cliff-walk-real.jpg",
    alt: "Aerial view of Newport's Cliff Walk mansions",
  },
  "fri-pasta-beach": {
    src: "/jamie/venues/pasta-beach-interior.jpg",
    alt: "Pasta Beach Newport — interior dining room",
  },
  "fri-games": {
    src: "/jamie/venues/candy-salad.jpg",
    alt: "Bowl of candy for the candy salad",
  },
  "sat-codough": {
    src: "/jamie/venues/codough.jpg",
    alt: "Hot iced cinnamon buns from Co-Dough Bakery, Newport",
  },
  "sat-coffee": {
    src: "/jamie/venues/nitro-bar.jpg",
    alt: "Iced coffees from above — Nitro Bar Newport",
  },
  "sat-pilates": {
    src: "/jamie/venues/thrive-newport.jpg",
    alt: "Thrive Newport reformer pilates studio",
  },
  "sat-wallys": {
    src: "/jamie/newport/oysters.jpg",
    alt: "Newport seafood shack",
  },
  "sat-beach": {
    src: "/jamie/venues/easton-beach.jpg",
    alt: "A sunny beach day under blue skies",
  },
  "sat-cruise": {
    src: "/jamie/venues/gansett-sunset.jpg",
    alt: "Gansett Cruises sunset sail",
  },
  "sat-oyster": {
    src: "/jamie/venues/midtown-oyster.jpg",
    alt: "Midtown Oyster Bar — Newport",
  },
  "sat-out": {
    src: "/jamie/newport/newport-nightlife.jpg",
    alt: "Newport nightlife — waterfront bars lit up after dark",
  },
  "sun-brunch": {
    src: "/jamie/venues/cru-interior.jpg",
    alt: "Inside CRU Cafe — Red Sox flag and the \"GREATEST SAILORS\" sign",
  },
};

export default function ItineraryPage() {
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

  const grouped = state.itinerary.reduce<Record<string, ItineraryEvent[]>>(
    (acc, event) => {
      (acc[event.day] ||= []).push(event);
      return acc;
    },
    {}
  );
  const dayOrder: ("fri" | "sat" | "sun")[] = ["fri", "sat", "sun"];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="The Itinerary"
        title="What we're doing"
        dek="Three days in Newport, scheduled enough to be relaxing."
      />
      <TripSubNav />

      <div style={{ paddingBottom: 40 }}>
        {dayOrder.map((day) => {
          const events = grouped[day];
          if (!events?.length) return null;
          const meta = dayMeta[day];
          return (
            <article key={day} style={{ marginTop: 48 }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10" }}>
                <Image
                  src={meta.cover.src}
                  alt={meta.cover.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "20px 24px 0" }}>
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
                  {meta.label}
                </div>
                <h2
                  style={{
                    fontFamily: fonts.display,
                    fontWeight: 500,
                    fontSize: "1.9rem",
                    margin: "10px 0 0",
                    color: colors.ink,
                    letterSpacing: "-0.015em",
                    lineHeight: 1.08,
                  }}
                >
                  {meta.subtitle}
                </h2>
                {meta.theme && (
                  <div
                    style={{
                      marginTop: 16,
                      display: "inline-block",
                      fontFamily: fonts.body,
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#FFFFFF",
                      background: "#2F5D85",
                      borderRadius: 999,
                      padding: "9px 18px",
                      boxShadow: "0 2px 10px rgba(47, 93, 133, 0.28)",
                    }}
                  >
                    {meta.theme}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 18,
                    height: 1,
                    background: colors.brass,
                    width: 48,
                  }}
                />
              </div>
              <div style={{ padding: "0 24px" }}>
                {events
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event) => (
                    <EventEntry key={event.id} event={event} />
                  ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function EventEntry({ event }: { event: ItineraryEvent }) {
  const cover = eventCovers[event.id];
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: "22px 0",
        borderBottom: `1px solid ${colors.mist}`,
      }}
    >
      {cover ? (
        <div
          style={{
            position: "relative",
            width: 96,
            height: 96,
            flexShrink: 0,
            background: colors.mist,
            overflow: "hidden",
          }}
        >
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="96px"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.coral,
          }}
        >
          {formatTime(event.startTime)}
          {event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
        </div>
        <h3
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 22,
            margin: "4px 0 0",
            color: colors.ink,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            textTransform: "capitalize",
          }}
        >
          {event.title}
        </h3>
        <div style={{ marginTop: 6 }}>
          <a
            href={event.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.inkSoft,
              textDecoration: "none",
              borderBottom: `1px solid ${colors.mist}`,
            }}
          >
            {event.location.name}
          </a>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.inkSoft,
              marginTop: 2,
            }}
          >
            {event.location.address}
          </div>
        </div>

        {event.publicNote && (
          <p
            style={{
              fontFamily: fonts.display,
              fontSize: 14,
              color: colors.ink,
              margin: "12px 0 0",
              lineHeight: 1.5,
            }}
          >
            {event.publicNote}
          </p>
        )}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.inkSoft,
          }}
        >
          <EventWeatherChip date={event.date} />
          {event.dressCode && (
            <span style={{ letterSpacing: "0.04em" }}>
              <em style={{ fontFamily: fonts.display, fontStyle: "italic" }}>
                Dress:
              </em>{" "}
              {event.dressCode}
            </span>
          )}
          {event.bring?.length ? (
            <span style={{ letterSpacing: "0.04em" }}>
              <em style={{ fontFamily: fonts.display, fontStyle: "italic" }}>
                Bring:
              </em>{" "}
              {event.bring.join(", ")}
            </span>
          ) : null}
        </div>

        {event.id === "sat-cruise" && <MarineCard date={event.date} />}
      </div>
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
