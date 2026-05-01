"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, fonts } from "@/lib/jamie/brand";

const tabs = [
  { href: "/jamie-bach-2026/admin", label: "dashboard", emoji: "🏠" },
  { href: "/jamie-bach-2026/admin/reservations", label: "reservations", emoji: "📅" },
  { href: "/jamie-bach-2026/admin/todos", label: "todos", emoji: "✅" },
  { href: "/jamie-bach-2026/admin/flights", label: "flights", emoji: "✈️" },
  { href: "/jamie-bach-2026/admin/expenses", label: "expenses", emoji: "💸" },
  { href: "/jamie-bach-2026/admin/rooms", label: "rooms", emoji: "🛏️" },
  { href: "/jamie-bach-2026/admin/survey", label: "survey", emoji: "📋" },
  { href: "/jamie-bach-2026/admin/settings", label: "settings", emoji: "⚙️" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: colors.cream,
        borderBottom: `3px solid ${colors.navy}`,
        padding: "10px 12px",
        display: "flex",
        gap: 6,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Link
        href="/jamie-bach-2026"
        style={{
          flexShrink: 0,
          padding: "5px 11px",
          borderRadius: 999,
          border: `2px solid ${colors.navy}`,
          background: "#fff",
          color: colors.navy,
          fontSize: "0.78rem",
          fontFamily: fonts.body,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← guest
      </Link>
      {tabs.map((tab) => {
        const active =
          tab.href === "/jamie-bach-2026/admin"
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flexShrink: 0,
              padding: "5px 11px",
              borderRadius: 999,
              border: `2px solid ${colors.navy}`,
              background: active ? colors.coral : "#fff",
              color: colors.navy,
              fontSize: "0.78rem",
              fontWeight: active ? 700 : 600,
              textDecoration: "none",
              fontFamily: fonts.body,
              boxShadow: active ? "2px 2px 0 #1F2A44" : "none",
            }}
          >
            {tab.emoji} {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
