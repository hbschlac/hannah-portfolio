"use client";

import Image from "next/image";
import { useState } from "react";
import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";
import type { Attendee } from "@/lib/jamie/types";

const roleLabels: Record<Attendee["role"], string> = {
  bride: "The Bride",
  moh: "Maid of Honor",
  "co-planner": "Co-Planner",
  guest: "Guest",
};

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

function Body() {
  const { state, error, loading } = useGuestState();
  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="Squad"
        title="Nine on the trip."
        dek="Phone numbers below each photo — tap to call. Tap the @handle for Instagram."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "28px 14px",
          padding: "16px 24px 64px",
        }}
      >
        {state.roster.map((person) => (
          <SquadPerson key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}

function SquadPerson({ person }: { person: Attendee }) {
  const initial = person.name.trim()[0]?.toUpperCase() ?? "?";
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!person.photoUrl && !imgFailed;
  const role = person.role !== "guest" ? roleLabels[person.role] : undefined;

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: colors.mist,
          overflow: "hidden",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showImage ? (
          <Image
            src={person.photoUrl}
            alt={person.name}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            style={{ objectFit: "cover" }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 400,
              fontSize: "3rem",
              color: colors.inkSoft,
            }}
          >
            {initial}
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: fonts.display,
          fontWeight: 500,
          fontSize: 19,
          color: colors.ink,
          letterSpacing: "-0.005em",
          lineHeight: 1.15,
        }}
      >
        {person.name}
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 11,
          fontWeight: 500,
          color: colors.inkSoft,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {role ? `${role} · ${person.city}` : person.city}
      </div>

      {person.phone && (
        <a
          href={`tel:${person.phone.replace(/\D/g, "")}`}
          style={{
            display: "block",
            marginTop: 10,
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.ink,
            textDecoration: "none",
          }}
        >
          {person.phone}
        </a>
      )}
      {person.instagram && (
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginTop: 4,
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.brass,
            textDecoration: "none",
            letterSpacing: "0.02em",
          }}
        >
          @{person.instagram}
        </a>
      )}
    </div>
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
