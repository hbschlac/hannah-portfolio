"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStuff } from "../_components/StuffProvider";
import type { Note } from "../_data/mock";

export default function NotesPage() {
  const { notes, items, focusNoteId, setFocusNoteId } = useStuff();
  const [editing, setEditing] = useState<Note | null>(null);

  // If we arrived here by tapping a note indicator on an article, open it.
  useEffect(() => {
    if (!focusNoteId) return;
    const target = notes.find((n) => n.id === focusNoteId);
    if (target) setEditing(target);
    setFocusNoteId(null);
  }, [focusNoteId, notes, setFocusNoteId]);

  const itemTitle = (id: string) =>
    items.find((it) => it.id === id)?.title ?? "(removed)";
  const itemUrl = (id: string) => items.find((it) => it.id === id)?.url;

  const blankNote = (): Note => ({
    id: `n-${Date.now()}`,
    title: "",
    body: "",
    updatedAt: new Date().toISOString(),
    linkedItemIds: [],
  });

  return (
    <>
      <header className="flex items-center justify-between pb-5 pt-4 md:pt-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-neutral-400">{notes.length} notes</p>
        </div>
        <button
          onClick={() => setEditing(blankNote())}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB2777] text-xl text-white shadow-sm shadow-pink-200"
          aria-label="New note"
        >
          +
        </button>
      </header>

      {notes.length === 0 && (
        <p className="mt-20 text-center text-sm text-neutral-400">
          No notes yet. Jot down what you learn.
        </p>
      )}

      <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        {notes.map((n) => (
          <li
            key={n.id}
            onClick={() => setEditing(n)}
            className="cursor-pointer rounded-2xl border border-neutral-200 p-4"
          >
            <p className="text-[15px] font-semibold leading-tight">
              {n.title || "Untitled note"}
            </p>
            {n.body && (
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-neutral-500">
                {n.body}
              </p>
            )}
            {n.linkedItemIds.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {n.linkedItemIds.map((id) => (
                  <a
                    key={id}
                    href={itemUrl(id)}
                    target="_blank"
                    rel="noopener"
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-[200px] truncate rounded-full bg-[#FDF2F5] px-2.5 py-1 text-xs text-[#BE2D6B]"
                  >
                    @{itemTitle(id)}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <NoteEditor note={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function NoteEditor({ note, onClose }: { note: Note; onClose: () => void }) {
  const { items, saveNote, deleteNote } = useStuff();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [linked, setLinked] = useState<string[]>(note.linkedItemIds);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");

  const candidates = useMemo(
    () =>
      items.filter(
        (it) =>
          !linked.includes(it.id) &&
          it.title.toLowerCase().includes(query.toLowerCase())
      ),
    [items, linked, query]
  );

  const itemTitle = (id: string) =>
    items.find((it) => it.id === id)?.title ?? "(removed)";

  const [saved, setSaved] = useState(true);
  const firstRun = useRef(true);

  // Autosave: persist on every change (debounced), no "Done" required.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    // Don't create a brand-new note that's still completely empty.
    if (!title.trim() && !body.trim() && linked.length === 0) return;
    setSaved(false);
    const t = setTimeout(() => {
      saveNote({
        ...note,
        title,
        body,
        linkedItemIds: linked,
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, linked]);

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex w-full max-w-[480px] flex-col bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <button onClick={onClose} className="flex items-center gap-1 text-sm font-medium text-[#DB2777]">
          <span className="text-lg leading-none">‹</span> Notes
        </button>
        <span className="text-sm font-medium">Note</span>
        <span className="text-xs text-neutral-400">
          {saved ? "Saved ✓" : "Autosaving…"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-xl font-semibold outline-none placeholder:text-neutral-300"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write what you learned…"
          rows={8}
          className="mt-3 w-full resize-none text-[15px] leading-relaxed outline-none placeholder:text-neutral-300"
        />

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Linked articles
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {linked.map((id) => (
              <span
                key={id}
                className="flex max-w-[220px] items-center gap-1 rounded-full bg-[#FDF2F5] px-2.5 py-1 text-xs text-[#BE2D6B]"
              >
                <span className="truncate">@{itemTitle(id)}</span>
                <button
                  onClick={() =>
                    setLinked((prev) => prev.filter((x) => x !== id))
                  }
                  className="text-neutral-400"
                  aria-label="Unlink"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              onClick={() => setPicking((v) => !v)}
              className="rounded-full border border-dashed border-[#E8A5B4] px-2.5 py-1 text-xs text-[#BE2D6B]"
            >
              @ link an article
            </button>
          </div>

          {picking && (
            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search saved items…"
                className="w-full border-b border-neutral-100 px-3 py-2.5 text-sm outline-none"
                autoFocus
              />
              <div className="max-h-52 overflow-y-auto">
                {candidates.length === 0 && (
                  <p className="px-3 py-3 text-sm text-neutral-400">
                    No matches.
                  </p>
                )}
                {candidates.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => {
                      setLinked((prev) => [...prev, it.id]);
                      setQuery("");
                      setPicking(false);
                    }}
                    className="block w-full px-3 py-2.5 text-left text-sm hover:bg-neutral-50"
                  >
                    <span className="font-medium">{it.title}</span>
                    <span className="ml-1 text-neutral-400">· {it.source}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {note.title || note.body ? (
          <button
            onClick={() => {
              deleteNote(note.id);
              onClose();
            }}
            className="mt-8 text-sm text-red-500"
          >
            Delete note
          </button>
        ) : null}
      </div>
    </div>
  );
}
