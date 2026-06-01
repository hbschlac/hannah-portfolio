"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/stuff",
    label: "Feed",
    icon: (
      <path d="M4 6h16M4 12h16M4 18h10" strokeWidth="1.9" strokeLinecap="round" />
    ),
  },
  {
    href: "/stuff/notes",
    label: "Notes",
    icon: (
      <path
        d="M5 4h11l3 3v13H5zM15 4v4h4M8 12h8M8 16h5"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
  {
    href: "/stuff/history",
    label: "History",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" strokeWidth="1.7" fill="none" />
        <path d="M12 8v4l3 2" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
];

// Desktop-only left nav. Hidden on mobile (the bottom TabBar takes over there).
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-neutral-200 px-4 py-7 md:flex">
      <div className="px-3">
        <span className="text-2xl font-semibold tracking-tight">Stuff</span>
        <p className="mt-0.5 text-xs text-neutral-400">Stuff to read later.</p>
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {tabs.map((tab) => {
          const active =
            tab.href === "/stuff"
              ? pathname === "/stuff"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#FDF2F5] text-[#DB2777]"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? "#DB2777" : "#6b7280"}
              >
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
