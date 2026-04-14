"use client";

import { useState, useEffect } from "react";

// Sprinkle positions — fixed so they don't shift on hydration
const SPRINKLES = [
  { left: "4%",  top: "18px", color: "#E8A5B4", rotate: 20,  width: 14, height: 5 },
  { left: "11%", top: "8px",  color: "#F9C74F", rotate: -35, width: 10, height: 4 },
  { left: "19%", top: "24px", color: "#90BE6D", rotate: 55,  width: 12, height: 4 },
  { left: "27%", top: "6px",  color: "#577590", rotate: -10, width: 8,  height: 4 },
  { left: "35%", top: "20px", color: "#F3722C", rotate: 40,  width: 11, height: 4 },
  { left: "43%", top: "10px", color: "#E8A5B4", rotate: -50, width: 9,  height: 4 },
  { left: "51%", top: "26px", color: "#F9C74F", rotate: 15,  width: 13, height: 5 },
  { left: "59%", top: "5px",  color: "#90BE6D", rotate: -25, width: 10, height: 4 },
  { left: "67%", top: "22px", color: "#577590", rotate: 60,  width: 8,  height: 4 },
  { left: "75%", top: "12px", color: "#F3722C", rotate: -45, width: 12, height: 4 },
  { left: "83%", top: "20px", color: "#E8A5B4", rotate: 30,  width: 10, height: 4 },
  { left: "91%", top: "7px",  color: "#F9C74F", rotate: -20, width: 9,  height: 5 },
  { left: "8%",  top: "32px", color: "#90BE6D", rotate: 70,  width: 7,  height: 3 },
  { left: "23%", top: "36px", color: "#F3722C", rotate: -60, width: 8,  height: 3 },
  { left: "48%", top: "38px", color: "#577590", rotate: 45,  width: 7,  height: 3 },
  { left: "72%", top: "34px", color: "#E8A5B4", rotate: -15, width: 9,  height: 3 },
  { left: "88%", top: "30px", color: "#F9C74F", rotate: 55,  width: 8,  height: 4 },
];

// ── Replace these with real photos once available ──────────────────────────
// Drop photos into public/baked/ and update the paths below.
// Photos should be roughly square or portrait orientation for best results.
const PHOTOS = [
  "/baked/photo-1.jpg",
  "/baked/photo-2.jpg",
  "/baked/photo-3.jpg",
  "/baked/photo-4.jpg",
];
// ──────────────────────────────────────────────────────────────────────────

export default function BakedPage() {
  const [current, setCurrent] = useState(0);
  const [hasPhotos] = useState(false); // flip to true once real photos are added

  useEffect(() => {
    if (!hasPhotos) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % PHOTOS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [hasPhotos]);

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#F8F6F2", color: "#1A1A1A" }}
    >
      {/* Sprinkle strip */}
      <div
        className="relative w-full"
        style={{ height: "48px", overflow: "hidden" }}
        aria-hidden="true"
      >
        {SPRINKLES.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.width,
              height: s.height,
              backgroundColor: s.color,
              borderRadius: "9999px",
              transform: `rotate(${s.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-grow max-w-xl mx-auto w-full px-6 pt-8 pb-10">

        {/* "baked by hannah" wordmark */}
        <p
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "#8A8A8A" }}
        >
          baked by hannah
        </p>

        {/* Headline */}
        <h1
          className="font-bold leading-tight mb-6"
          style={{ fontSize: "2rem", color: "#1A1A1A" }}
        >
          hi, i&apos;m hannah.{" "}
          <span role="img" aria-label="cupcake">
            🧁
          </span>
        </h1>

        {/* Photo carousel */}
        {hasPhotos ? (
          <div
            className="relative mb-8 overflow-hidden"
            style={{
              borderRadius: "12px",
              aspectRatio: "4/3",
              background: "#E5E1D8",
            }}
          >
            {PHOTOS.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`Hannah baking, photo ${i + 1}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: i === current ? 1 : 0,
                  transition: "opacity 0.7s ease-in-out",
                }}
              />
            ))}
          </div>
        ) : (
          /* Placeholder shown until real photos are added */
          <div
            className="mb-8 flex items-center justify-center"
            style={{
              aspectRatio: "4/3",
              background: "#F0EDE8",
              borderRadius: "12px",
              border: "1px dashed #C8C4BC",
            }}
          >
            <p className="text-xs" style={{ color: "#B0AA9F" }}>
              photos coming soon 📸
            </p>
          </div>
        )}

        {/* Body copy */}
        <div
          className="mb-8 space-y-4"
          style={{ fontSize: "15px", lineHeight: "1.65", color: "#1A1A1A" }}
        >
          <p>
            if you&apos;re eating something right now, my husband made you scan
            this. fair enough — he&apos;s a good salesman and i&apos;m a
            product manager.
          </p>
          <p>
            i&apos;m looking for{" "}
            <strong>applied AI and native AI product roles</strong> at companies
            building{" "}
            <em>with</em> AI, not just on top of it. and i&apos;d love to know
            who at Persona i should be talking to.
          </p>
        </div>

        {/* LinkedIn CTA */}
        <a
          href="https://www.linkedin.com/in/hannahschlacter"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center font-medium transition-opacity hover:opacity-80"
          style={{
            background: "#1A1A1A",
            color: "#F8F6F2",
            padding: "14px 24px",
            borderRadius: "8px",
            fontSize: "15px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          add me on linkedin →
        </a>

        {/* Sub-ask */}
        <p
          className="mt-4 text-center"
          style={{ fontSize: "13px", color: "#8A8A8A", lineHeight: "1.6" }}
        >
          tell me which teams are doing interesting AI work.
          <br />
          i&apos;ll take flavor requests for next time.
        </p>
      </div>

      {/* Footer */}
      <footer
        className="max-w-xl mx-auto w-full px-6 py-6"
        style={{ borderTop: "1px solid #E5E1D8" }}
      >
        <p className="text-xs" style={{ color: "#8A8A8A" }}>
          vibed with love | oakland, ca
        </p>
      </footer>
    </main>
  );
}
