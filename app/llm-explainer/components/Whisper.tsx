"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface WhisperProps {
  text: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

export function Whisper({ text, children, position = "top" }: WhisperProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState<"left" | "center" | "right">("center");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.left < 120) setCoords("left");
      else if (rect.right > window.innerWidth - 120) setCoords("right");
      else setCoords("center");
    }
  }, [show]);

  return (
    <span
      ref={ref}
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow((s) => !s)}
    >
      {children}
      {show && (
        <span
          className={`
            absolute z-50 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs
            leading-relaxed shadow-lg max-w-[260px] w-max pointer-events-none
            transition-opacity duration-150
            ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"}
            ${coords === "left" ? "left-0" : coords === "right" ? "right-0" : "left-1/2 -translate-x-1/2"}
          `}
        >
          {text}
          <span
            className={`
              absolute w-2 h-2 bg-gray-900 rotate-45
              ${position === "top" ? "top-full -mt-1" : "bottom-full -mb-1"}
              ${coords === "left" ? "left-4" : coords === "right" ? "right-4" : "left-1/2 -translate-x-1/2"}
            `}
          />
        </span>
      )}
    </span>
  );
}
