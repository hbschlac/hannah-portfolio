"use client";

import { useState } from "react";
import { shareUrl, track, useVisitor } from "./visitor";

// Opens the phone's share sheet where there is one, otherwise copies the link. The link carries
// this visitor's share code so visits and copies it leads to show up as "from a shared link".
export function ShareButton() {
  const { code } = useVisitor();
  const [copied, setCopied] = useState(false);
  const url = shareUrl(code);

  const onShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Career Kit",
          text: "Claude skills for a job search, in your own voice. Setup takes about 20 minutes.",
          url,
        });
        track("share");
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      track("share");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the link is still on screen to copy by hand
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onShare}
        className="text-sm px-5 py-2.5 rounded-lg transition-opacity hover:opacity-80"
        style={{ background: "#1A1A1A", color: "#FFF" }}
      >
        {copied ? "Link copied" : "Share this page"}
      </button>
      <span className="text-xs text-muted break-all">schlacter.me/career-kit</span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
