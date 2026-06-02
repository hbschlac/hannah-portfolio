"use client";

import { useState } from "react";
import { useStuff } from "./_components/StuffProvider";
import ItemMenu, { TypeBadge } from "./_components/ItemMenu";
import NoteIndicator from "./_components/NoteIndicator";
import SwipeRow from "./_components/SwipeRow";
import AddSheet from "./_components/AddSheet";

export default function FeedPage() {
  const { items, setItemStatus, migrating } = useStuff();
  const [adding, setAdding] = useState(false);

  const feed = items
    .filter((it) => it.status === "inbox")
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));

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
              src={hero.image}
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
                      src={it.image}
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
