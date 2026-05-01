"use client";

import Link from "next/link";
import PasswordGate from "./_components/PasswordGate";
import BottomNav from "./_components/BottomNav";
import Countdown from "./_components/Countdown";
import { CurrentWeatherChip } from "./_components/WeatherChip";
import { useGuestState } from "./_components/useGuestState";
import { colors, fonts, sunsetGradient, stickerShadow } from "@/lib/jamie/brand";

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

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "2rem" }}>🌸</div>
        <p style={{ color: colors.navySoft, marginTop: "12px" }}>loading...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: colors.coral }}>
          oops — {error || "no data yet"}
        </p>
        <p style={{ color: colors.navySoft, fontSize: "0.85rem", marginTop: 8 }}>
          (data may not be seeded yet — POST /api/jamie/seed)
        </p>
      </div>
    );
  }

  const { trip, roster, itinerary, photosUrl, groupChatUrl } = state;
  const visibleRoster = roster.slice(0, 9);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* HERO */}
      <header style={{ padding: "32px 20px 20px" }}>
        <div
          style={{
            fontFamily: fonts.script,
            fontSize: "1.4rem",
            color: colors.coral,
            transform: "rotate(-2deg)",
          }}
        >
          we're going to newport ❤️
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "2.6rem",
            lineHeight: 1,
            marginTop: 6,
            color: colors.navy,
          }}
        >
          jamie&apos;s bach
          <br />
          <span style={{ color: colors.coral }}>2026 🌸</span>
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: "0.95rem",
            color: colors.navySoft,
          }}
        >
          newport · jul 10–13 · party of {trip.partySize}
        </p>
        <div style={{ marginTop: 10 }}>
          <CurrentWeatherChip />
        </div>
      </header>

      {/* COUNTDOWN HERO CARD */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            background: sunsetGradient,
            border: `3px solid ${colors.navy}`,
            borderRadius: "20px",
            padding: "32px 20px",
            textAlign: "center",
            boxShadow: stickerShadow,
            transform: "rotate(-1deg)",
          }}
        >
          <Countdown targetDate={trip.startDate} />
          <div style={{ fontSize: "3rem", marginTop: 14, lineHeight: 1 }}>
            🌊 🍾 🌸
          </div>
          <p
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "1.4rem",
              color: colors.navy,
              marginTop: 14,
              lineHeight: 1.2,
            }}
          >
            it&apos;s almost time
          </p>
        </div>
      </div>

      {/* THE SQUAD */}
      <section style={{ padding: "32px 20px 16px" }}>
        <SectionHeader emoji="💕" title="the squad" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginTop: 14,
          }}
        >
          {visibleRoster.map((a) => (
            <FaceCircle
              key={a.id}
              name={a.name.split(" ")[0]}
              city={a.city}
              color={colors[a.colorToken]}
              photoUrl={a.photoUrl}
            />
          ))}
        </div>
        <Link
          href="/jamie-bach-2026/squad"
          style={{
            display: "inline-block",
            marginTop: 14,
            color: colors.coral,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          meet everyone →
        </Link>
      </section>

      {/* WHAT'S THE PLAN */}
      <section style={{ padding: "16px 20px" }}>
        <SectionHeader emoji="🌊" title="what's the plan" />
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {itinerary.map((event) => (
            <div
              key={event.id}
              style={{
                background: "#fff",
                border: `2px solid ${colors.navy}`,
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: stickerShadow,
              }}
            >
              <div style={{ fontSize: "1.4rem" }}>{event.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {event.title}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: colors.navySoft,
                    fontFamily: fonts.mono,
                  }}
                >
                  {event.day.toUpperCase()} · {formatTime(event.startTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/jamie-bach-2026/itinerary"
          style={{
            display: "inline-block",
            marginTop: 14,
            color: colors.coral,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          full itinerary →
        </Link>
      </section>

      {/* PHOTOS + GROUP CHAT CTAs */}
      <section style={{ padding: "16px 20px 40px" }}>
        <CTAButton
          href={photosUrl || "#"}
          disabled={!photosUrl}
          emoji="📸"
          label={photosUrl ? "add to our shared photos" : "shared album coming soon"}
          color={colors.lime}
        />
        <div style={{ height: 12 }} />
        <CTAButton
          href={groupChatUrl || "#"}
          disabled={!groupChatUrl}
          emoji="💬"
          label={groupChatUrl ? "join the group chat" : "group chat coming soon"}
          color={colors.lavender}
        />
      </section>
    </div>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
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

function FaceCircle({
  name,
  city,
  color,
  photoUrl,
}: {
  name: string;
  city: string;
  color: string;
  photoUrl: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: color,
          border: `3px solid ${colors.navy}`,
          boxShadow: "3px 3px 0 #1F2A44",
          backgroundImage: photoUrl ? `url(${photoUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "1.4rem",
          color: colors.navy,
        }}
      >
        {!photoUrl && name[0]}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "0.78rem",
          marginTop: 6,
          lineHeight: 1.1,
        }}
      >
        {name.toLowerCase()}
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          color: colors.navySoft,
          fontFamily: fonts.mono,
          marginTop: 1,
        }}
      >
        {city}
      </div>
    </div>
  );
}

function CTAButton({
  href,
  emoji,
  label,
  color,
  disabled,
}: {
  href: string;
  emoji: string;
  label: string;
  color: string;
  disabled?: boolean;
}) {
  const style = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: disabled ? "#fff" : color,
    border: `3px solid ${colors.navy}`,
    borderRadius: "12px",
    padding: "14px 18px",
    boxShadow: stickerShadow,
    color: colors.navy,
    fontWeight: 700,
    fontSize: "1rem",
    fontFamily: fonts.body,
    textDecoration: "none",
    opacity: disabled ? 0.55 : 1,
    cursor: disabled ? "default" : "pointer",
  } as const;

  if (disabled) {
    return (
      <div style={style}>
        <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
      <span>{label}</span>
    </a>
  );
}

function formatTime(t24: string): string {
  const [h, m] = t24.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${period}`;
}
