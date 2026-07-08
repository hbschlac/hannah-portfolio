"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, fonts } from "@/lib/jamie/brand";

const tabs = [
  { href: "/jamie-bach-2026/itinerary", label: "Itinerary" },
  { href: "/jamie-bach-2026/lodging", label: "Lodging" },
  { href: "/jamie-bach-2026/travel", label: "Travel" },
  { href: "/jamie-bach-2026/packing", label: "Pack" },
];

export default function TripSubNav() {
  const pathname = usePathname();
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: colors.paper,
        padding: "0 24px",
        display: "flex",
        gap: 22,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        borderBottom: `1px solid ${colors.mist}`,
        marginTop: 8,
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
              padding: "12px 0",
              color: active ? colors.ink : colors.inkSoft,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: fonts.body,
              borderBottom: active
                ? `1px solid ${colors.brass}`
                : "1px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
