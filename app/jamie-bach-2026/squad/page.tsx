"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import PortraitCard from "../_components/PortraitCard";
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
        kicker="The Cast"
        title="Nine on the trip."
        dek="A roster — bride, sister, two co-planners, and five who said yes."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px 18px",
          padding: "16px 24px 56px",
        }}
      >
        {state.roster.map((person) => (
          <PortraitCard
            key={person.id}
            name={person.name}
            role={person.role !== "guest" ? roleLabels[person.role] : undefined}
            city={person.city}
            photoUrl={person.photoUrl}
          />
        ))}
      </div>

      {/* Contact directory */}
      <section style={{ padding: "0 24px 48px" }}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: colors.brass,
            marginBottom: 14,
            paddingTop: 24,
            borderTop: `1px solid ${colors.mist}`,
          }}
        >
          Contact Directory
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {state.roster.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "14px 0",
                borderBottom: `1px solid ${colors.mist}`,
                fontFamily: fonts.body,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontWeight: 500,
                    fontSize: 17,
                    color: colors.ink,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: colors.inkSoft,
                    marginTop: 2,
                  }}
                >
                  {p.city}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  fontSize: 12,
                  color: colors.ink,
                }}
              >
                {p.phone && (
                  <a
                    href={`tel:${p.phone}`}
                    style={{
                      color: colors.ink,
                      textDecoration: "none",
                      borderBottom: `1px solid ${colors.mist}`,
                    }}
                  >
                    {p.phone}
                  </a>
                )}
                {p.instagram && (
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: colors.inkSoft,
                      textDecoration: "none",
                      borderBottom: `1px solid ${colors.mist}`,
                    }}
                  >
                    @{p.instagram}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
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
