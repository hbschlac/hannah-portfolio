"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { Attendee, RoomAssignment } from "@/lib/jamie/types";

export default function SquadPage() {
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

const roleLabels: Record<Attendee["role"], string> = {
  bride: "the bride 💍",
  moh: "MOH · sister",
  "co-planner": "co-planner",
  guest: "guest",
};

function Body() {
  const { state, error, loading } = useGuestState();
  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const findRoomie = (id: string): string | null => {
    const myAssign = state.rooms.assignments.find((a) => a.attendeeId === id);
    if (!myAssign) return null;
    const sameFloor = state.rooms.assignments.filter(
      (a) => a.floor === myAssign.floor && a.attendeeId && a.attendeeId !== id
    );
    if (!sameFloor.length) return null;
    return sameFloor
      .map((a) => state.roster.find((r) => r.id === a.attendeeId)?.name.split(" ")[0])
      .filter(Boolean)
      .join(" · ");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <SectionHeader kicker="meet everyone ✨" title="the squad" />
      <div style={{ padding: "12px 20px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
        {state.roster.map((person, idx) => (
          <PersonCard
            key={person.id}
            person={person}
            roomie={findRoomie(person.id)}
            tilt={idx % 2 === 0 ? -0.6 : 0.6}
          />
        ))}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  roomie,
  tilt,
}: {
  person: Attendee;
  roomie: string | null;
  tilt: number;
}) {
  const accent = colors[person.colorToken];
  return (
    <div
      style={{
        background: "#fff",
        border: `3px solid ${colors.navy}`,
        borderRadius: "14px",
        padding: "16px",
        display: "flex",
        gap: 14,
        boxShadow: stickerShadow,
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: accent,
          border: `3px solid ${colors.navy}`,
          boxShadow: "3px 3px 0 #1F2A44",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "2rem",
          color: colors.navy,
          backgroundImage: person.photoUrl ? `url(${person.photoUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!person.photoUrl && person.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "1.4rem",
            color: colors.navy,
            lineHeight: 1.1,
          }}
        >
          {person.name.toLowerCase()}
        </div>
        <div
          style={{
            fontFamily: fonts.script,
            fontSize: "1rem",
            color: colors.coral,
            marginTop: 2,
          }}
        >
          {roleLabels[person.role]}
        </div>
        <div style={{ fontSize: "0.82rem", marginTop: 8, lineHeight: 1.5 }}>
          <Row icon="📍">{person.city}</Row>
          {person.phone && (
            <Row icon="📱">
              <a
                href={`tel:${person.phone}`}
                style={{ color: colors.navy, textDecoration: "underline" }}
              >
                {person.phone}
              </a>
            </Row>
          )}
          {person.instagram && (
            <Row icon="📷">
              <a
                href={`https://instagram.com/${person.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.navy, textDecoration: "underline" }}
              >
                @{person.instagram}
              </a>
            </Row>
          )}
          {roomie && (
            <Row icon="🛏️">
              <span style={{ color: colors.navySoft }}>roomie: {roomie}</span>
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
      <span style={{ width: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>💕</div>
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
