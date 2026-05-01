"use client";

import PasswordGate from "../_components/PasswordGate";
import BottomNav from "../_components/BottomNav";
import SectionHeader from "../_components/SectionHeader";
import TripSubNav from "../_components/TripSubNav";
import { useGuestState } from "../_components/useGuestState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import { useState, useEffect } from "react";

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

  const tilts = [-1, 1, -0.6, 0.6];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <SectionHeader kicker="don't forget anything 🧳" title="pack list" />
      <TripSubNav />
      <p
        style={{
          padding: "0 20px",
          color: colors.navySoft,
          fontFamily: fonts.script,
          fontSize: "1.05rem",
          marginTop: -6,
        }}
      >
        check things off as you go — saved on this device only
      </p>

      <div style={{ padding: "16px 20px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
        {state.packlist.map((cat, i) => (
          <div
            key={cat.name}
            style={{
              background: "#fff",
              border: `3px solid ${colors.navy}`,
              borderRadius: 14,
              padding: 16,
              boxShadow: stickerShadow,
              transform: `rotate(${tilts[i % tilts.length] * 0.5}deg)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: "1.5rem" }}>{cat.emoji}</span>
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontStyle: "italic",
                  fontWeight: 900,
                  fontSize: "1.3rem",
                  color: colors.navy,
                  margin: 0,
                }}
              >
                {cat.name}
              </h3>
            </div>
            <ul
              style={{
                margin: "12px 0 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 8,
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
                      gap: 10,
                      padding: "8px 10px",
                      background: checked ? colors.lime : colors.cream,
                      border: `2px solid ${colors.navy}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      textDecoration: checked ? "line-through" : "none",
                      opacity: checked ? 0.65 : 1,
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        border: `2px solid ${colors.navy}`,
                        borderRadius: 5,
                        background: checked ? colors.navy : "#fff",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>🧳</div>
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
