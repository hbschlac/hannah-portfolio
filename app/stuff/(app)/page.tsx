"use client";

import { useState } from "react";
import { useStuff } from "./_components/StuffProvider";
import ItemMenu, { TypeBadge } from "./_components/ItemMenu";
import NoteIndicator from "./_components/NoteIndicator";
import SwipeRow from "./_components/SwipeRow";
import AddSheet from "./_components/AddSheet";
import type { ItemType } from "@/lib/stuff/types";

// Route preview images through the API proxy so publishers that block
// hotlinking (Fortune, NYT, LinkedIn previews, …) still display.
const proxy = (u?: string) =>
  u ? `/api/stuff/image?u=${encodeURIComponent(u)}` : undefined;

type TypeFilter = ItemType | "all";
type SortBy = "added" | "published";

const TYPE_CHIPS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "video", label: "Videos" },
  { key: "podcast", label: "Podcasts" },
];

export default function FeedPage() {
  const { items, setItemStatus, migrating } = useStuff();
  const [adding, setAdding] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("added");

  const feed = items
    .filter((it) => it.status === "inbox")
    .filter((it) => (typeFilter === "all" ? true : it.type === typeFilter))
    .sort((a, b) => {
      if (sortBy === "published") {
        // Fall back to savedAt so items without a scraped publishedAt still
        // sort sensibly (newest-saved at the top of the "no-date" tail).
        const ap = a.publishedAt || a.savedAt;
        const bp = b.publishedAt || b.savedAt;
        return bp.localeCompare(ap);
      }
      return b.savedAt.localeCompare(a.savedAt);
    });

  const [hero, ...rest] = feed;

  return (
    <>
      <header className="flex items-center justify-between pb-5 pt-4 md:pt-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:hidden">
            Stuff
          </h1>
          <h1 className="hidden text-2xl font-semibold tracking-tight md:block">
            Feed
          </h1>
          <p className="text-sm text-neutral-400">{feed.length} to read</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB2777] text-xl text-white shadow-sm shadow-pink-200"
          aria-label="Add link"
        >
          +
        </button>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {TYPE_CHIPS.map((c) => (
          <button
            key={c.key}
            onClick={() => setTypeFilter(c.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === c.key
                ? "bg-[#DB2777] text-white"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {c.label}
          </button>
        ))}
        <div className="ml-auto shrink-0">
          <button
            onClick={() =>
              setSortBy((s) => (s === "added" ? "published" : "added"))
            }
            className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600"
            aria-label="Toggle sort"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="whitespace-nowrap">
              {sortBy === "added" ? "Recently added" : "Recently published"}
            </span>
          </button>
        </div>
      </div>

      {migrating && (
        <div className="mb-4 rounded-2xl border border-[#F5D5DF] bg-[#FDF2F5] px-4 py-3 text-sm text-[#BE2D6B]">
          Restoring your saved items… {migrating.done}/{migrating.total}
        </div>
      )}

      {feed.length === 0 && !migrating && (
        <div className="mt-24 text-center text-neutral-400">
          <p className="text-base">Nothing here yet.</p>
          <p className="mt-1 text-sm">Tap + to paste a link to read later.</p>
        </div>
      )}

      {hero && (
        <a
          href={hero.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer overflow-hidden rounded-3xl border border-[#F5D5DF] bg-[#FDF2F5]"
        >
          {hero.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxy(hero.image)}
              alt=""
              className="h-44 w-full object-cover md:h-72"
            />
          )}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">{hero.source}</span>
              <span className="text-xs text-neutral-300">·</span>
              <span className="text-xs text-neutral-400">{hero.length}</span>
              <TypeBadge type={hero.type} />
              <div onClick={(e) => e.stopPropagation()}>
                <NoteIndicator itemId={hero.id} />
              </div>
              <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                <ItemMenu item={hero} />
              </div>
            </div>
            <h2 className="mt-1.5 text-lg font-semibold leading-snug">
              {hero.title}
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-neutral-500">
              {hero.summary}
            </p>
          </div>
        </a>
      )}

      {rest.length > 0 && (
        <ul className="mt-3 space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {rest.map((it) => (
            <li
              key={it.id}
              className="overflow-hidden rounded-2xl border border-neutral-200"
            >
              <SwipeRow
                onRead={() => setItemStatus(it.id, "read")}
                onArchive={() => setItemStatus(it.id, "saved")}
              >
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3.5"
                >
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proxy(it.image)}
                      alt=""
                      className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs text-neutral-400">
                        {it.source}
                      </span>
                      <span className="text-xs text-neutral-300">·</span>
                      <span className="whitespace-nowrap text-xs text-neutral-400">
                        {it.length}
                      </span>
                      <TypeBadge type={it.type} />
                      <NoteIndicator itemId={it.id} />
                    </div>
                    <p className="mt-0.5 truncate text-[15px] font-medium leading-tight">
                      {it.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-neutral-500">
                      {it.summary}
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
              </SwipeRow>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 px-2 text-center text-xs text-neutral-300">
        Swipe a row left for Read / Archive · tap ⋯ for more
      </p>

      {adding && <AddSheet onClose={() => setAdding(false)} />}
    </>
  );
}
