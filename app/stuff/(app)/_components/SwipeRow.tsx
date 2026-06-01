"use client";

import { useRef, useState, type ReactNode } from "react";

// Wrap a feed row so the user can swipe it left to reveal Read / Archive
// buttons. The row's inner content is expected to be a real <a href> link —
// regular taps just navigate through the anchor (most reliable on iOS PWAs).
// We only intercept the click when the user actually dragged, or when the
// action buttons are already showing.
export default function SwipeRow({
  children,
  onRead,
  onArchive,
}: {
  children: ReactNode;
  onRead: () => void;
  onArchive: () => void;
}) {
  const ACTIONS_WIDTH = 168;
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const startX = useRef<number | null>(null);
  const startDx = useRef(0);
  const moved = useRef(false);
  const justDragged = useRef(false);

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
    if (moved.current) {
      // commit to open/closed and remember to swallow the upcoming click
      justDragged.current = true;
      if (dx < -ACTIONS_WIDTH / 2) {
        setOpen(true);
        setDx(-ACTIONS_WIDTH);
      } else {
        setOpen(false);
        setDx(0);
      }
    }
  };

  // Runs before the inner anchor's click. Swallow the click if (a) we just
  // dragged, or (b) the actions panel is already open — in both cases we don't
  // want the link to navigate.
  const onClickCapture = (e: React.MouseEvent) => {
    if (justDragged.current) {
      justDragged.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setDx(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
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
        onClickCapture={onClickCapture}
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
