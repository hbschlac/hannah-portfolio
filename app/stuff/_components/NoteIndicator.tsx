"use client";

import { useRouter } from "next/navigation";
import { useStuff } from "./StuffProvider";

// Shows on any item that has at least one note linked to it. Tapping it opens
// that note (the first, if several) over in the Notes tab.
export default function NoteIndicator({ itemId }: { itemId: string }) {
  const { notesForItem, setFocusNoteId } = useStuff();
  const router = useRouter();
  const linked = notesForItem(itemId);
  if (linked.length === 0) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFocusNoteId(linked[0].id);
        router.push("/stuff/notes");
      }}
      className="flex items-center gap-1 rounded-full bg-[#FDF2F5] px-2 py-0.5 text-[10px] font-medium text-[#BE2D6B]"
      aria-label={`${linked.length} linked note${linked.length > 1 ? "s" : ""}`}
      title="Open linked note"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M5 4h11l3 3v13H5zM15 4v4h4M8 12h8M8 16h5"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {linked.length > 1 ? linked.length : "Note"}
    </button>
  );
}
