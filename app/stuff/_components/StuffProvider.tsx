"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_ITEMS,
  MOCK_NOTES,
  type StuffItem,
  type ItemStatus,
  type Note,
} from "../_data/mock";

// v2: empty seed (ship 2026-06-01). Bumping the key reseeds existing devices
// so the broken demo tiles don't linger after the deploy.
const STORAGE_KEY = "stuff-mockup-v2";

type Store = {
  items: StuffItem[];
  notes: Note[];
  setItemStatus: (id: string, status: ItemStatus) => void;
  deleteItem: (id: string) => void;
  addItem: (partial: { url: string; title?: string }) => void;
  saveNote: (note: Note) => void;
  deleteNote: (id: string) => void;
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

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

export default function StuffProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StuffItem[]>(MOCK_ITEMS);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [hydrated, setHydrated] = useState(false);
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);

  // Load any saved mockup state from a previous visit.
  // If there's no v2 yet but a v1 (pre-seed-wipe) blob exists, migrate Hannah's
  // own pasted items/notes over and drop the demo seed (ids i1–i8 / n1–n2).
  useEffect(() => {
    const DEMO_ITEM_IDS = new Set([
      "i1", "i2", "i3", "i4", "i5", "i6", "i7", "i8",
    ]);
    const DEMO_NOTE_IDS = new Set(["n1", "n2"]);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const v2HasData =
        parsed &&
        ((parsed.items || []).length > 0 || (parsed.notes || []).length > 0);
      if (v2HasData) {
        if (parsed.items) setItems(parsed.items);
        if (parsed.notes) setNotes(parsed.notes);
      } else {
        // v2 is missing or was created empty by the previous deploy. Try to
        // recover Hannah's own items from the legacy v1 blob.
        const legacy = localStorage.getItem("stuff-mockup-v1");
        if (legacy) {
          const v1 = JSON.parse(legacy);
          const userItems: StuffItem[] = (v1.items || []).filter(
            (i: StuffItem) => !DEMO_ITEM_IDS.has(i.id)
          );
          const userNotes: Note[] = (v1.notes || []).filter(
            (n: Note) => !DEMO_NOTE_IDS.has(n.id)
          );
          if (userItems.length || userNotes.length) {
            setItems(userItems);
            setNotes(userNotes);
            console.info(
              `[stuff] Migrated ${userItems.length} item(s) and ${userNotes.length} note(s) from v1 → v2.`
            );
          }
        }
      }
    } catch {
      // ignore — fall back to seed
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so we never clobber stored state with the seed.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, notes }));
  }, [items, notes, hydrated]);

  const setItemStatus = (id: string, status: ItemStatus) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status } : it))
    );

  const deleteItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const addItem = ({ url, title }: { url: string; title?: string }) => {
    const id = `i-${Date.now()}`;
    const source = domainFromUrl(url);
    setItems((prev) => [
      {
        id,
        url,
        title: title?.trim() || source,
        source,
        type: "article",
        summary: "Summary will be generated when this is connected to the backend.",
        length: "—",
        savedAt: new Date().toISOString(),
        via: "paste",
        status: "inbox",
      },
      ...prev,
    ]);
  };

  const saveNote = (note: Note) =>
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      return exists
        ? prev.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev];
    });

  const deleteNote = (id: string) =>
    setNotes((prev) => prev.filter((n) => n.id !== id));

  const notesForItem = (itemId: string) =>
    notes.filter((n) => n.linkedItemIds.includes(itemId));

  return (
    <StuffContext.Provider
      value={{
        items,
        notes,
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
