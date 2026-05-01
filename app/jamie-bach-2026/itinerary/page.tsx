"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import TripSubNav from "../_components/TripSubNav";
import { EventWeatherChip, MarineCard } from "../_components/WeatherChip";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { ItineraryEvent } from "@/lib/jamie/types";

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

const dayLabels: Record<string, { label: string; color: keyof typeof colors }> = {
  fri: { label: "FRI · 7/10", color: "coral" },
  sat: { label: "SAT · 7/11", color: "tangerine" },
  sun: { label: "SUN · 7/12", color: "lime" },
};

function Body() {
  const { state, error, loading } = useGuestState();

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "2rem" }}>🌊</div>
        <p style={{ color: colors.navySoft, marginTop: 12 }}>loading...</p>
      </div>
    );
  }
  if (error || !state) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: colors.coral }}>oops — {error || "no data yet"}</p>
      </div>
    );
  }

  const grouped = state.itinerary.reduce<Record<string, ItineraryEvent[]>>(
    (acc, event) => {
      (acc[event.day] ||= []).push(event);
      return acc;
    },
    {}
  );

  const dayOrder: ("fri" | "sat" | "sun")[] = ["fri", "sat", "sun"];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <header style={{ padding: "32px 20px 12px" }}>
        <div
          style={{
            fontFamily: fonts.script,
            fontSize: "1.25rem",
            color: colors.coral,
            transform: "rotate(-2deg)",
          }}
        >
          here&apos;s what&apos;s happening
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "2.4rem",
            margin: "6px 0 0",
            color: colors.navy,
            lineHeight: 1,
          }}
        >
          itinerary
        </h1>
      </header>

      <TripSubNav />

      <div style={{ padding: "12px 20px 40px" }}>
        {dayOrder.map((day) => {
          const events = grouped[day];
          if (!events?.length) return null;
          return (
            <div key={day} style={{ marginTop: 24 }}>
              <DayHeader meta={dayLabels[day]} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                {events
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event, idx) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      tilt={idx % 2 === 0 ? -1 : 1}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayHeader({ meta }: { meta: { label: string; color: keyof typeof colors } }) {
  return (
    <div
      style={{
        display: "inline-block",
        background: colors[meta.color],
        border: `3px solid ${colors.navy}`,
        boxShadow: "3px 3px 0 #1F2A44",
        borderRadius: "999px",
        padding: "6px 16px",
        fontFamily: fonts.mono,
        fontWeight: 700,
        fontSize: "0.85rem",
        letterSpacing: "0.08em",
        transform: "rotate(-1deg)",
      }}
    >
      {meta.label}
    </div>
  );
}

function EventCard({ event, tilt }: { event: ItineraryEvent; tilt: number }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `3px solid ${colors.navy}`,
        borderRadius: "14px",
        padding: "16px 18px",
        boxShadow: stickerShadow,
        transform: `rotate(${tilt * 0.5}deg)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontSize: "2rem", lineHeight: 1 }}>{event.emoji}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: "0.78rem",
              fontWeight: 700,
              color: colors.coral,
              letterSpacing: "0.05em",
            }}
          >
            {formatTime(event.startTime)}
            {event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
          </div>
          <h3
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "1.4rem",
              margin: "2px 0 0",
              color: colors.navy,
              lineHeight: 1.1,
            }}
          >
            {event.title}
          </h3>
        </div>
        <EventWeatherChip date={event.date} />
      </div>
      {event.id === "sat-cruise" && <MarineCard date={event.date} />}

      <div style={{ marginTop: 12, fontSize: "0.85rem", lineHeight: 1.5 }}>
        <Row label="📍">
          <a
            href={event.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.navy, textDecoration: "underline" }}
          >
            {event.location.name}
          </a>
          <div
            style={{ color: colors.navySoft, fontSize: "0.78rem" }}
          >
            {event.location.address}
          </div>
        </Row>

        {event.dressCode && (
          <Row label="👗">
            <span>{event.dressCode}</span>
          </Row>
        )}

        {event.bring?.length ? (
          <Row label="👜">
            <span>{event.bring.join(" · ")}</span>
          </Row>
        ) : null}

        {event.publicNote && (
          <Row label="💌">
            <span style={{ fontFamily: fonts.script, fontSize: "1rem" }}>
              {event.publicNote}
            </span>
          </Row>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
      <span style={{ width: 22, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function formatTime(t24: string): string {
  const [h, m] = t24.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${period}`;
}
