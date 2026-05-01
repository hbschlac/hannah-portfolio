"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, fonts } from "@/lib/jamie/brand";

const tabs = [
  { href: "/jamie-bach-2026/itinerary", label: "itinerary", emoji: "📅" },
  { href: "/jamie-bach-2026/lodging", label: "lodging", emoji: "🏠" },
  { href: "/jamie-bach-2026/travel", label: "travel", emoji: "✈️" },
  { href: "/jamie-bach-2026/packing", label: "pack", emoji: "🧳" },
];

export default function TripSubNav() {
  const pathname = usePathname();
  return (
    <div
      style={{
        padding: "0 12px",
        display: "flex",
        gap: 8,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 999,
              border: `2px solid ${colors.navy}`,
              background: active ? colors.coral : "#fff",
              color: colors.navy,
              fontWeight: active ? 700 : 600,
              fontSize: "0.82rem",
              textDecoration: "none",
              fontFamily: fonts.body,
              boxShadow: active ? "2px 2px 0 #1F2A44" : "none",
            }}
          >
            {tab.emoji} {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
