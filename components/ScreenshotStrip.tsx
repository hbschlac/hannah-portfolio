"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Props = {
  screenshots: string[];
  title: string;
};

export default function ScreenshotStrip({ screenshots, title }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect scrollability after images load / container resizes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const scrollable = el.scrollWidth > el.clientWidth + 4;
      setIsScrollable(scrollable);
      setAtEnd(!scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [screenshots]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  const showFade = isScrollable && !atEnd;

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(
    () => setActive((i) => (i !== null && i < screenshots.length - 1 ? i + 1 : i)),
    [screenshots.length]
  );

  useEffect(() => {
    if (active === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <>
      {/* Strip + fade affordance */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex flex-row gap-3 overflow-x-auto pb-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {screenshots.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${title} screenshot ${i + 1}`}
              onClick={() => setActive(i)}
              className="rounded-xl h-72 w-auto flex-shrink-0 object-contain cursor-zoom-in transition-opacity hover:opacity-80"
            />
          ))}
        </div>

        {/* Right-edge gradient — signals more content, fades out at end */}
        <div
          className="absolute right-0 top-0 bottom-3 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity duration-300"
          style={{ opacity: showFade ? 1 : 0 }}
        />
      </div>

      {/* Scroll hint — disappears once user reaches the end */}
      {isScrollable && (
        <p
          className="text-[10px] text-muted/40 mt-0.5 text-right pr-1 transition-opacity duration-300 select-none"
          style={{ opacity: atEnd ? 0 : 1 }}
        >
          swipe to explore →
        </p>
      )}

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-5 text-white/70 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>

          {/* Prev */}
          {active > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 text-white/60 hover:text-white text-3xl leading-none px-2"
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshots[active]}
            alt={`${title} screenshot ${active + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />

          {/* Next */}
          {active < screenshots.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 text-white/60 hover:text-white text-3xl leading-none px-2"
              aria-label="Next"
            >
              ›
            </button>
          )}

          {/* Counter */}
          <p className="absolute bottom-5 left-0 right-0 text-center text-xs text-white/40">
            {active + 1} / {screenshots.length}
          </p>
        </div>
      )}
    </>
  );
}
