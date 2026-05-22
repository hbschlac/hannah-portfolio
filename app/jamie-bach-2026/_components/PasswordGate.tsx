"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { colors, fonts } from "@/lib/jamie/brand";

type Props = {
  guestPassword: string;
  adminPassword?: string;
  storageKey: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function PasswordGate({
  guestPassword,
  adminPassword,
  storageKey,
  title = "Jamie's Bachelorette",
  subtitle = "Newport, Rhode Island · July 10–12, 2026",
  children,
}: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Read from localStorage so the unlock survives tab close, browser restart,
    // and new-tab navigations from shared links (iMessage, Notes, etc.).
    // Also accept a legacy sessionStorage value so anyone already in stays in.
    if (
      localStorage.getItem(storageKey) === "true" ||
      sessionStorage.getItem(storageKey) === "true"
    ) {
      setUnlocked(true);
    }
    setChecking(false);
  }, [storageKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid =
      input === guestPassword || (adminPassword && input === adminPassword);
    if (valid) {
      localStorage.setItem(storageKey, "true");
      if (adminPassword && input === adminPassword) {
        localStorage.setItem("jamie-bach-unlocked", "true");
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
        background: colors.paper,
        fontFamily: fonts.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "45vh",
          minHeight: 280,
          overflow: "hidden",
          background: colors.ink,
        }}
      >
        <Image
          src="/jamie/newport/sailboats-sunset.jpg"
          alt="Newport harbor at sunset"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.45) 100%)",
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          padding: "32px 28px 48px",
          maxWidth: 440,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: colors.brass,
            marginBottom: 14,
          }}
        >
          Newport · 2026
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: "2.4rem",
            color: colors.ink,
            margin: 0,
            lineHeight: 1.04,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: fonts.display,
            color: colors.inkSoft,
            margin: "16px 0 32px",
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
        <div
          style={{
            height: 1,
            width: 48,
            background: colors.brass,
            marginBottom: 24,
          }}
        />
        <form onSubmit={handleSubmit}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: colors.inkSoft,
              display: "block",
              marginBottom: 10,
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            autoFocus
            style={{
              width: "100%",
              padding: "12px 0",
              fontSize: 16,
              borderRadius: 0,
              border: "none",
              borderBottom: error
                ? `1px solid ${colors.coral}`
                : `1px solid ${colors.ink}`,
              outline: "none",
              fontFamily: fonts.body,
              marginBottom: 12,
              boxSizing: "border-box",
              background: "transparent",
              color: colors.ink,
            }}
          />
          {error && (
            <p
              style={{
                color: colors.coral,
                fontSize: 12,
                marginBottom: 12,
                letterSpacing: "0.05em",
              }}
            >
              That password isn't right. Try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              marginTop: 18,
              width: "100%",
              padding: "14px",
              background: colors.ink,
              color: colors.paper,
              border: "none",
              borderRadius: 0,
              fontSize: 12,
              fontFamily: fonts.body,
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
