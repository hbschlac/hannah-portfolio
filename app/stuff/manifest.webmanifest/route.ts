import { NextResponse } from "next/server";

// Manual PWA manifest route — Next 16 didn't pick up a nested app/stuff/manifest.ts
// via the file convention, so we serve the JSON directly.
export function GET() {
  const manifest = {
    name: "Stuff",
    short_name: "Stuff",
    description: "Stuff to read later.",
    start_url: "/stuff",
    scope: "/stuff",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#DB2777",
    icons: [
      { src: "/stuff/icon", sizes: "64x64", type: "image/png" },
      { src: "/stuff/apple-icon", sizes: "180x180", type: "image/png" },
      {
        src: "/stuff/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Web Share Target: if the OS / browser supports it, sharing a URL into
    // "Stuff" will route to /stuff?add=<URL>, which our provider already
    // handles. iOS support is inconsistent, but it costs nothing to declare.
    share_target: {
      action: "/stuff",
      method: "GET",
      params: {
        title: "title",
        text: "add",
        url: "add",
      },
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
