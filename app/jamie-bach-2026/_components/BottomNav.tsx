"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors, fonts } from "@/lib/jamie/brand";

const tabs = [
  { href: "/jamie-bach-2026", label: "Home" },
  { href: "/jamie-bach-2026/itinerary", label: "Trip" },
  { href: "/jamie-bach-2026/squad", label: "Squad" },
  { href: "/jamie-bach-2026/expenses", label: "Cost" },
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
        background: colors.paper,
        borderTop: `1px solid ${colors.mist}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "14px 0 26px",
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
              color: colors.ink,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              flex: 1,
              padding: "4px 0",
              position: "relative",
            }}
          >
            <span>{tab.label}</span>
            {active && (
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 1,
                  background: colors.brass,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
