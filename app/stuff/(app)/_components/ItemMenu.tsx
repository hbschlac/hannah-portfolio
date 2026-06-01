"use client";

import { useEffect, useRef, useState } from "react";
import { useStuff } from "./StuffProvider";
import type { StuffItem } from "../_data/mock";

// The "⋯" dropdown. Works as the accessible fallback to the swipe gesture.
export default function ItemMenu({ item }: { item: StuffItem }) {
  const { setItemStatus, deleteItem } = useStuff();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const inFeed = item.status === "inbox";

  const actions: { label: string; run: () => void; danger?: boolean }[] = [
    {
      label: "Open link",
      run: () => window.open(item.url, "_blank", "noopener"),
    },
    ...(inFeed
      ? [
          { label: "Mark read", run: () => setItemStatus(item.id, "read") },
          { label: "Archive", run: () => setItemStatus(item.id, "saved") },
        ]
      : [{ label: "Move back to feed", run: () => setItemStatus(item.id, "inbox") }]),
    { label: "Delete", run: () => deleteItem(item.id), danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Item actions"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                a.run();
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm ${
                a.danger ? "text-red-500" : "text-neutral-800"
              } hover:bg-neutral-50`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TypeBadge({ type }: { type: StuffItem["type"] }) {
  if (type === "article") return null;
  const label = type === "video" ? "▶ Video" : "🎧 Podcast";
  return (
    <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
      {label}
    </span>
  );
}
