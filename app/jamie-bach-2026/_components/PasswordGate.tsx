"use client";

import { useState, useEffect, type ReactNode } from "react";
import { colors, fonts, sunsetGradient, stickerShadow } from "@/lib/jamie/brand";

type Props = {
  guestPassword: string;
  adminPassword?: string; // if set, this gate also accepts admin pw
  storageKey: string; // sessionStorage key
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function PasswordGate({
  guestPassword,
  adminPassword,
  storageKey,
  title = "jamie's bach 2026",
  subtitle = "newport · jul 10–13 · party of 9",
  children,
}: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === "true") {
      setUnlocked(true);
    }
    setChecking(false);
  }, [storageKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid =
      input === guestPassword || (adminPassword && input === adminPassword);
    if (valid) {
      sessionStorage.setItem(storageKey, "true");
      // admin pw also unlocks guest
      if (adminPassword && input === adminPassword) {
        sessionStorage.setItem("jamie-bach-unlocked", "true");
      }
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
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: sunsetGradient,
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.4rem",
            border: `3px solid ${colors.navy}`,
            boxShadow: stickerShadow,
          }}
        >
          🌸
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: "1.8rem",
            color: colors.navy,
            fontWeight: 900,
            fontStyle: "italic",
            marginBottom: "6px",
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: colors.navySoft,
            marginBottom: "28px",
            fontFamily: fonts.script,
            fontSize: "1.15rem",
          }}
        >
          {subtitle}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="password"
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
              borderRadius: "10px",
              border: error
                ? `2px solid ${colors.coral}`
                : `2px solid ${colors.navy}`,
              outline: "none",
              fontFamily: fonts.body,
              textAlign: "center",
              marginBottom: "12px",
              boxSizing: "border-box",
              background: colors.cream,
              color: colors.navy,
            }}
          />
          {error && (
            <p
              style={{
                color: colors.coral,
                fontSize: "0.82rem",
                marginBottom: "10px",
                fontFamily: fonts.body,
              }}
            >
              wrong password — try again 💔
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: sunsetGradient,
              color: colors.navy,
              border: `3px solid ${colors.navy}`,
              borderRadius: "10px",
              fontSize: "1rem",
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: stickerShadow,
            }}
          >
            let me in ✨
          </button>
        </form>
      </div>
    </div>
  );
}
