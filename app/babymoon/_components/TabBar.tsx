"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/babymoon", label: "Home", icon: "🏝️" },
  { href: "/babymoon/itinerary", label: "Itinerary", icon: "🗓️" },
  { href: "/babymoon/stay", label: "Stay", icon: "🏨" },
  { href: "/babymoon/travel", label: "Travel", icon: "✈️" },
  { href: "/babymoon/info", label: "Info", icon: "💡" },
];

export default function TabBar() {
  const pathname = usePathname();
  if (pathname === "/babymoon/unlock") return null;

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active =
          t.href === "/babymoon"
            ? pathname === "/babymoon"
            : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "active" : ""}>
            <span className="ic">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
