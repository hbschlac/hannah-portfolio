"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, fonts } from "@/lib/jamie/brand";

const tabs = [
  { href: "/jamie-bach-2026", label: "home", emoji: "🏠" },
  { href: "/jamie-bach-2026/itinerary", label: "trip", emoji: "🌊" },
  { href: "/jamie-bach-2026/squad", label: "squad", emoji: "💕" },
  { href: "/jamie-bach-2026/expenses", label: "$$", emoji: "💸" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: colors.cream,
        borderTop: `3px solid ${colors.navy}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 22px",
        zIndex: 50,
        fontFamily: fonts.body,
      }}
    >
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/jamie-bach-2026" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              textAlign: "center",
              textDecoration: "none",
              color: active ? colors.coral : colors.navy,
              fontWeight: active ? 700 : 500,
              fontSize: "0.78rem",
              flex: 1,
              padding: "4px 0",
            }}
          >
            <div style={{ fontSize: "1.4rem", lineHeight: 1 }}>{tab.emoji}</div>
            <div style={{ marginTop: "4px" }}>{tab.label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
