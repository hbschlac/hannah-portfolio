"use client";

import { useEffect } from "react";
import { readVisitor, track } from "./visitor";

let sent = false; // once per page load, even when React runs effects twice in development

// Counts the visit, notes where it came from (?ref= tag, referring site), then tidies the address
// bar so a visitor who copies it doesn't pass on someone else's share code.
export function PageTracker() {
  useEffect(() => {
    if (sent) return;
    sent = true;
    readVisitor();
    const url = new URL(window.location.href);
    let src: string | undefined;
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : "";
      if (host && host !== window.location.hostname) src = host;
    } catch {
      // unreadable referrer: count it as direct
    }
    track("view", { ref: url.searchParams.get("ref") ?? undefined, src });
    if (url.searchParams.has("s") || url.searchParams.has("ref")) {
      url.searchParams.delete("s");
      url.searchParams.delete("ref");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
  }, []);
  return null;
}
