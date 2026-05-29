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

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-neutral-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.04)] md:hidden">
      <div className="flex items-stretch justify-around px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2.5">
        {tabs.map((tab) => {
          const active =
            tab.href === "/stuff"
              ? pathname === "/stuff"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-colors ${
                active ? "bg-[#FDF2F5]" : ""
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? "#DB2777" : "#6b7280"}
              >
                {tab.icon}
              </svg>
              <span
                className={`text-[11px] font-semibold tracking-wide ${
                  active ? "text-[#DB2777]" : "text-neutral-500"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
