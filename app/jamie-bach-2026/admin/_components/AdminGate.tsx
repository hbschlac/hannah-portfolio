"use client";

import { useState, useEffect, type ReactNode } from "react";
import { colors, fonts, sunsetGradient, stickerShadow } from "@/lib/jamie/brand";

const ADMIN_PW = "Admin-July2026";
const ADMIN_KEY = "jamie-admin-unlocked";
const GUEST_KEY = "jamie-bach-unlocked";

export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_KEY) === "true") {
      setUnlocked(true);
    }
    setChecking(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PW) {
      sessionStorage.setItem(ADMIN_KEY, "true");
      sessionStorage.setItem(GUEST_KEY, "true"); // admin also unlocks guest
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput("");
    }
  }

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.body,
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: `3px solid ${colors.navy}`,
          boxShadow: stickerShadow,
          borderRadius: "18px",
          padding: "40px 28px",
          maxWidth: 380,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: colors.lavender,
            width: 72,
            height: 72,
            borderRadius: "50%",
            margin: "0 auto 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.2rem",
            border: `3px solid ${colors.navy}`,
            boxShadow: stickerShadow,
          }}
        >
          🔐
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "1.8rem",
            color: colors.navy,
            marginBottom: 6,
          }}
        >
          admin
        </h1>
        <p
          style={{
            fontFamily: fonts.script,
            fontSize: "1.1rem",
            color: colors.navySoft,
            marginBottom: 26,
          }}
        >
          planners only ✨
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="admin password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "1rem",
              borderRadius: 10,
              border: error
                ? `2px solid ${colors.coral}`
                : `2px solid ${colors.navy}`,
              outline: "none",
              fontFamily: fonts.body,
              textAlign: "center",
              marginBottom: 12,
              boxSizing: "border-box",
              background: colors.cream,
              color: colors.navy,
            }}
          />
          {error && (
            <p style={{ color: colors.coral, fontSize: "0.85rem", marginBottom: 10 }}>
              wrong password — admins only 💔
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              background: sunsetGradient,
              color: colors.navy,
              border: `3px solid ${colors.navy}`,
              borderRadius: 10,
              fontSize: "1rem",
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: stickerShadow,
            }}
          >
            unlock 🔓
          </button>
        </form>
      </div>
    </div>
  );
}

export function getAdminPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_KEY) === "true" ? ADMIN_PW : null;
}
