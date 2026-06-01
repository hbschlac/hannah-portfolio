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
