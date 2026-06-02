"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { StuffItem, ItemStatus, Note } from "@/lib/stuff/types";

type Store = {
  items: StuffItem[];
  notes: Note[];
  loading: boolean;
  migrating: { total: number; done: number } | null;
  setItemStatus: (id: string, status: ItemStatus) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addItem: (partial: { url: string; via?: "share" | "paste" }) => Promise<void>;
  saveNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  notesForItem: (itemId: string) => Note[];
  focusNoteId: string | null;
  setFocusNoteId: (id: string | null) => void;
};

const StuffContext = createContext<Store | null>(null);

export function useStuff() {
  const ctx = useContext(StuffContext);
  if (!ctx) throw new Error("useStuff must be used inside <StuffProvider>");
  return ctx;
}

export default function StuffProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StuffItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState<{ total: number; done: number } | null>(null);
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);

  // Initial fetch from the backend (Upstash KV via /api/stuff/*).
  const refresh = useCallback(async () => {
    try {
      const [iRes, nRes] = await Promise.all([
        fetch("/api/stuff/items", { cache: "no-store" }),
        fetch("/api/stuff/notes", { cache: "no-store" }),
      ]);
      if (iRes.ok) {
        const { items: i } = await iRes.json();
        setItems(Array.isArray(i) ? i : []);
      }
      if (nRes.ok) {
        const { notes: n } = await nRes.json();
        setNotes(Array.isArray(n) ? n : []);
      }
    } catch {
      // leave state empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // POST /api/stuff/add. Server scrapes OG + asks Anthropic for a summary,
  // returns the populated item; we prepend it locally so the UI updates fast.
  const addItem = useCallback(
    async (partial: { url: string; via?: "share" | "paste" }) => {
      try {
        const res = await fetch("/api/stuff/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: partial.url,
            via: partial.via || "paste",
          }),
        });
        if (!res.ok) return;
        const { item } = (await res.json()) as { item: StuffItem };
        setItems((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
      } catch {
        // ignore — user can retry
      }
    },
    []
  );

  // One-time recovery: if this browser still has pre-Phase-2 items in
  // localStorage (under stuff-mockup-v1 or v2), post each URL to the API so it
  // gets re-scraped + stored in KV. Server dedupes by URL, so re-running on a
  // different device with the same URLs is safe. Marks itself done with the
  // stuff-migrated-to-kv flag so it only runs once per browser.
  useEffect(() => {
    if (loading) return;
    if (localStorage.getItem("stuff-migrated-to-kv") === "true") return;

    const DEMO_IDS = new Set([
      "i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8",
    ]);
    const DEMO_NOTE_IDS = new Set(["n1", "n2"]);

    type Legacy = { items?: StuffItem[]; notes?: Note[] };
    const readBlob = (key: string): Legacy | null => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as Legacy) : null;
      } catch {
        return null;
      }
    };

    const blobs = [readBlob("stuff-mockup-v2"), readBlob("stuff-mockup-v1")];
    const urls = new Map<string, { title?: string }>();
    const legacyNotes: Note[] = [];
    for (const b of blobs) {
      if (!b) continue;
      for (const it of b.items || []) {
        if (DEMO_IDS.has(it.id) || !it.url) continue;
        if (!urls.has(it.url)) urls.set(it.url, { title: it.title });
      }
      for (const n of b.notes || []) {
        if (DEMO_NOTE_IDS.has(n.id)) continue;
        if (!legacyNotes.some((x) => x.id === n.id)) legacyNotes.push(n);
      }
    }

    if (urls.size === 0 && legacyNotes.length === 0) {
      localStorage.setItem("stuff-migrated-to-kv", "true");
      return;
    }

    (async () => {
      const list = Array.from(urls.entries());
      setMigrating({ total: list.length, done: 0 });
      // Sequential so the order in KV matches the user's original order.
      for (let i = 0; i < list.length; i++) {
        const [url, meta] = list[i];
        try {
          await fetch("/api/stuff/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, title: meta.title, via: "paste" }),
          });
        } catch {
          // skip and keep going
        }
        setMigrating({ total: list.length, done: i + 1 });
      }
      // Notes can go in parallel — no scraping, just KV writes.
      await Promise.all(
        legacyNotes.map((n) =>
          fetch("/api/stuff/notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(n),
          }).catch(() => {})
        )
      );
      localStorage.setItem("stuff-migrated-to-kv", "true");
      await refresh();
      setMigrating(null);
    })();
  }, [loading, refresh]);

  // Share-sheet ingest: iOS Shortcut routes ?add=<encoded URL> here.
  // Wait for the initial fetch so the new item lands on top of the loaded list.
  useEffect(() => {
    if (loading) return;
    try {
      const here = new URL(window.location.href);
      const add = here.searchParams.get("add");
      if (add) {
        addItem({ url: add, via: "share" });
        here.searchParams.delete("add");
        window.history.replaceState({}, "", here.toString());
      }
    } catch {
      // bad URL — ignore
    }
  }, [loading, addItem]);

  const setItemStatus = useCallback(async (id: string, status: ItemStatus) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status } : it))
    );
    try {
      await fetch("/api/stuff/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // reconciled on next refresh
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await fetch(`/api/stuff/items?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      // ignore
    }
  }, []);

  const saveNote = useCallback(async (note: Note) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      return exists
        ? prev.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev];
    });
    try {
      await fetch("/api/stuff/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
    } catch {
      // ignore
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/stuff/notes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      // ignore
    }
  }, []);

  const notesForItem = useCallback(
    (itemId: string) => notes.filter((n) => n.linkedItemIds.includes(itemId)),
    [notes]
  );

  return (
    <StuffContext.Provider
      value={{
        items,
        notes,
        loading,
        migrating,
        setItemStatus,
        deleteItem,
        addItem,
        saveNote,
        deleteNote,
        notesForItem,
        focusNoteId,
        setFocusNoteId,
      }}
    >
      {children}
    </StuffContext.Provider>
  );
}
