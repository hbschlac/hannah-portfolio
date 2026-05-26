"use client";

import Image from "next/image";
import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

export default function PackingPage() {
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
        kicker="The Pack List"
        title="What to bring."
        dek="A starting point — adjust to your own packing style."
      />
      <TripSubNav />

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          marginTop: 24,
        }}
      >
        <Image
          src="/jamie/venues/packing-flatlay.jpg"
          alt="An open suitcase, ready for the trip"
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: "32px 24px 64px" }}>
        {state.packlist.map((cat) => (
          <section
            key={cat.name}
            style={{
              paddingTop: 28,
              paddingBottom: 4,
              borderTop: `1px solid ${colors.mist}`,
              marginTop: 24,
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
                marginBottom: 8,
              }}
            >
              {cat.name}
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {cat.items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: `1px solid ${colors.mist}`,
                    fontFamily: fonts.body,
                    fontSize: 15,
                    color: colors.ink,
                  }}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
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
