"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts, stickerShadow, sunsetGradient } from "@/lib/jamie/brand";
import type { Attendee, RoomAssignment } from "@/lib/jamie/types";

const ROOM_PHOTOS = [
  "https://burbankrose.com/wp-content/uploads/2024/06/Briar-Rose-Suite-Cover-1-min.jpg",
  "https://burbankrose.com/wp-content/uploads/2024/06/Golden-Rose-Suite-Cover-2-min.jpg",
  "https://burbankrose.com/wp-content/uploads/2024/06/Autumn-Rose-Cover-1-min.jpg",
  "https://burbankrose.com/wp-content/uploads/2024/06/Bourbon-Rose-Cover-1-min.jpg",
  "https://burbankrose.com/wp-content/uploads/2024/06/Cherry-Rose-Cover-1-min.jpg",
];

const FLOOR_LABELS: Record<number, string> = {
  1: "1st floor",
  2: "2nd floor",
  3: "3rd floor",
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

  const byFloor = state.rooms.assignments.reduce<Record<number, typeof state.rooms.assignments>>(
    (acc, a) => {
      (acc[a.floor] ||= []).push(a);
      return acc;
    },
    {}
  );

  const findAttendee = (id: string | null): Attendee | undefined =>
    id ? state.roster.find((r) => r.id === id) : undefined;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <SectionHeader kicker="where we're staying 🏠" title="lodging" />
      <TripSubNav />

      {/* PHOTOS */}
      <div style={{ padding: "12px 20px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            border: `3px solid ${colors.navy}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: stickerShadow,
            background: colors.navy,
          }}
        >
          {ROOM_PHOTOS.slice(0, 4).map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Burbank Rose room ${i + 1}`}
              style={{
                width: "100%",
                height: 110,
                objectFit: "cover",
                display: "block",
              }}
            />
          ))}
        </div>
      </div>

      {/* PROPERTY CARD */}
      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            background: "#fff",
            border: `3px solid ${colors.navy}`,
            borderRadius: 14,
            padding: 18,
            boxShadow: stickerShadow,
          }}
        >
          <h2
            style={{
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: "1.5rem",
              color: colors.navy,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            the burbank rose inn
          </h2>
          <p style={{ marginTop: 6, fontSize: "0.9rem", color: colors.navySoft }}>
            111 Memorial Blvd W · Newport, RI 02840
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Pill href="https://maps.google.com/?q=111+Memorial+Blvd+W+Newport+RI+02840" emoji="📍">
              open in maps
            </Pill>
            <Pill href="https://burbankrose.com" emoji="🌐">
              site
            </Pill>
            <Pill href="tel:+14016887958" emoji="📞">
              (401) 688-7958
            </Pill>
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              background: colors.cream,
              border: `2px solid ${colors.navy}`,
              borderRadius: 10,
              fontSize: "0.85rem",
              fontFamily: fonts.mono,
            }}
          >
            <div>check-in:&nbsp; FRI 7/10</div>
            <div>check-out: MON 7/13</div>
          </div>
          <div style={{ marginTop: 12, fontSize: "0.85rem", color: colors.navySoft }}>
            ☕ continental breakfast included · 🌊 walk to the harbor
          </div>
        </div>
      </div>

      {/* ROOM ASSIGNMENTS */}
      <section style={{ padding: "32px 20px 0" }}>
        <SubHeader emoji="🛏️" title="the rooms" />
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((floor) => (
            <div
              key={floor}
              style={{
                background: "#fff",
                border: `3px solid ${colors.navy}`,
                borderRadius: 12,
                padding: 14,
                boxShadow: stickerShadow,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  color: colors.coral,
                }}
              >
                {FLOOR_LABELS[floor].toUpperCase()}
              </div>
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(byFloor[floor] || []).map((a, i) => {
                  const person = findAttendee(a.attendeeId);
                  return (
                    <BedChip
                      key={`${floor}-${i}`}
                      bed={a.bed}
                      personName={person?.name.split(" ")[0]}
                      color={person ? colors[person.colorToken] : "#fff"}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 10, color: colors.navySoft, fontFamily: fonts.script, fontSize: "1rem" }}>
          rooms get assigned closer to the trip — stay tuned ✨
        </p>
      </section>

      {/* EMERGENCY */}
      <section style={{ padding: "28px 20px 40px" }}>
        <SubHeader emoji="🆘" title="emergency info" />
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            border: `3px solid ${colors.navy}`,
            borderRadius: 12,
            padding: 16,
            boxShadow: stickerShadow,
            fontSize: "0.88rem",
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <strong>house staff:</strong>{" "}
            <a
              href={`tel:${state.emergency.houseStaffPhone.replace(/\D/g, "")}`}
              style={{ color: colors.navy }}
            >
              {state.emergency.houseStaffPhone}
            </a>
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>nearest hospital:</strong>
            <br />
            {state.emergency.nearestHospital.name}
            <br />
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                state.emergency.nearestHospital.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.navy, textDecoration: "underline" }}
            >
              {state.emergency.nearestHospital.address}
            </a>
            <br />
            <a
              href={`tel:${state.emergency.nearestHospital.phone.replace(/\D/g, "")}`}
              style={{ color: colors.navy }}
            >
              {state.emergency.nearestHospital.phone}
            </a>
          </div>
          <div>
            <strong>planners on call:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
              {state.emergency.planners.map((p) => (
                <li key={p.phone}>
                  {p.name} —{" "}
                  <a
                    href={`tel:${p.phone.replace(/\D/g, "")}`}
                    style={{ color: colors.navy }}
                  >
                    {p.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
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

function Pill({
  href,
  emoji,
  children,
}: {
  href: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        background: colors.lime,
        border: `2px solid ${colors.navy}`,
        borderRadius: 999,
        textDecoration: "none",
        color: colors.navy,
        fontWeight: 600,
        fontSize: "0.78rem",
      }}
    >
      <span>{emoji}</span>
      {children}
    </a>
  );
}

function BedChip({
  bed,
  personName,
  color,
}: {
  bed: string;
  personName?: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        padding: "5px 10px",
        background: color,
        border: `2px solid ${colors.navy}`,
        borderRadius: 8,
        fontSize: "0.72rem",
        fontFamily: fonts.mono,
        minWidth: 60,
      }}
    >
      <span style={{ opacity: 0.7 }}>{bed}</span>
      <strong style={{ fontFamily: fonts.body, fontSize: "0.85rem" }}>
        {personName || "—"}
      </strong>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>🏠</div>
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
