"use client";

import { useRef, useState, type ReactNode } from "react";

// Swipe a row left to reveal two actions — Read (you read it) and Archive
// (clearing it without reading). A tap (no real movement) opens the link.
// Pointer events cover both touch and mouse.
export default function SwipeRow({
  children,
  onRead,
  onArchive,
  onTap,
}: {
  children: ReactNode;
  onRead: () => void;
  onArchive: () => void;
  onTap: () => void;
}) {
  const ACTIONS_WIDTH = 168; // two 84px buttons
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const startX = useRef<number | null>(null);
  const startDx = useRef(0);
  const moved = useRef(false);

  const onDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startDx.current = dx;
    moved.current = false;
    setAnimating(false);
  };

  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 6) moved.current = true;
    const next = Math.min(0, Math.max(-ACTIONS_WIDTH, startDx.current + delta));
    setDx(next);
  };

  const finish = () => {
    if (startX.current === null) return;
    startX.current = null;
    setAnimating(true);
    if (!moved.current) {
      // a tap: if actions are open, close them; otherwise open the link
      if (open) {
        setOpen(false);
        setDx(0);
      } else {
        onTap();
      }
      return;
    }
    // snap open or closed based on how far it was dragged
    if (dx < -ACTIONS_WIDTH / 2) {
      setOpen(true);
      setDx(-ACTIONS_WIDTH);
    } else {
      setOpen(false);
      setDx(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Revealed action buttons sitting behind the row */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={onRead}
          className="flex w-[84px] flex-col items-center justify-center gap-0.5 bg-neutral-800 text-white"
        >
          <span className="text-base leading-none">✓</span>
          <span className="text-xs font-medium">Read</span>
        </button>
        <button
          onClick={onArchive}
          className="flex w-[84px] flex-col items-center justify-center gap-0.5 bg-[#DB2777] text-white"
        >
          <span className="text-base leading-none">⤓</span>
          <span className="text-xs font-medium">Archive</span>
        </button>
      </div>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        style={{
          transform: `translateX(${dx}px)`,
          transition: animating ? "transform 0.18s ease-out" : "none",
          touchAction: "pan-y",
        }}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  );
}
