import { NextResponse } from "next/server";

// Manual PWA manifest route (Next 16 doesn't pick up a nested manifest via the
// file convention — mirrors app/stuff/manifest.webmanifest/route.ts).
export function GET() {
  const manifest = {
    name: "Cabo Babymoon",
    short_name: "Babymoon",
    description: "Hannah & Sam · Cabo San Lucas · Aug 2026",
    start_url: "/babymoon",
    scope: "/babymoon",
    display: "standalone",
    background_color: "#12807b",
    theme_color: "#147d78",
    icons: [
      { src: "/babymoon/icon", sizes: "32x32", type: "image/png" },
      { src: "/babymoon/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/babymoon/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
