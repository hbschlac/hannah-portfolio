"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts } from "@/lib/jamie/brand";

const STORAGE_KEY = "jamie-pack-checks";

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
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setChecks(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const toggle = (id: string) => {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionHeader
        kicker="The Pack List"
        title="What to bring."
        dek="Saved on this device. Check things off as you go."
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
          src="/jamie/newport/newport-summer.jpg"
          alt="A sailboat passing a Newport channel marker"
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
              {cat.items.map((item) => {
                const checked = !!checks[item.id];
                return (
                  <li
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom: `1px solid ${colors.mist}`,
                      cursor: "pointer",
                      fontFamily: fonts.body,
                      fontSize: 15,
                      color: checked ? colors.inkSoft : colors.ink,
                      textDecoration: checked ? "line-through" : "none",
                      userSelect: "none",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 14,
                        height: 14,
                        border: `1px solid ${colors.ink}`,
                        background: checked ? colors.ink : "transparent",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {checked && (
                        <span
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -55%)",
                            color: colors.paper,
                            fontSize: 10,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </span>
                    {item.label}
                  </li>
                );
              })}
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
