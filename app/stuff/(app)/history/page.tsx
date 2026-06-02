"use client";

import { useState } from "react";
import { useStuff } from "../_components/StuffProvider";
import ItemMenu, { TypeBadge } from "../_components/ItemMenu";
import NoteIndicator from "../_components/NoteIndicator";

const proxy = (u?: string) =>
  u ? `/api/stuff/image?u=${encodeURIComponent(u)}` : undefined;

type Filter = "all" | "read" | "saved";

const CHIPS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "read", label: "Read" },
  { key: "saved", label: "Archived" },
];

export default function HistoryPage() {
  const { items } = useStuff();
  const [filter, setFilter] = useState<Filter>("all");

  const history = items
    .filter((it) => it.status !== "inbox")
    .filter((it) => (filter === "all" ? true : it.status === filter))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return (
    <>
      <header className="pb-4 pt-4 md:pt-7">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-neutral-400">Everything you&apos;ve cleared.</p>
      </header>

      <div className="flex gap-2 pb-4">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === c.key
                ? "bg-[#DB2777] text-white"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {history.length === 0 ? (
        <p className="mt-20 text-center text-sm text-neutral-400">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {history.map((it) => (
            <li
              key={it.id}
              className="rounded-2xl border border-neutral-200"
            >
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5"
              >
              {it.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxy(it.image)}
                  alt=""
                  className="h-12 w-12 flex-shrink-0 rounded-xl object-cover opacity-70 grayscale"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs text-neutral-400">
                    {it.source}
                  </span>
                  <TypeBadge type={it.type} />
                  <NoteIndicator itemId={it.id} />
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      it.status === "read"
                        ? "bg-neutral-100 text-neutral-500"
                        : "bg-[#FDF2F5] text-[#BE2D6B]"
                    }`}
                  >
                    {it.status === "read" ? "Read" : "Archived"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[15px] font-medium leading-tight text-neutral-600">
                  {it.title}
                </p>
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <ItemMenu item={it} />
              </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
