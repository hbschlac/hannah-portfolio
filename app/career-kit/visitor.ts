import { useSyncExternalStore } from "react";

// Anonymous, first-party measurement for /career-kit. A visitor is a random id this browser
// makes; their share code is its first 8 characters, added to links they share (?s=CODE) so a
// visit or a copy can be credited to "came from a shared link". Nothing else is collected.
export const PAGE_URL = "https://schlacter.me/career-kit";
const EVENT_URL = "/api/career-kit/event";

type Visitor = { vid: string; via: string; code: string };
const SERVER: Visitor = { vid: "", via: "", code: "" };
let cached: Visitor | null = null;

function load(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function save(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage blocked: the id lasts for this page load only
  }
}

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export function readVisitor(): Visitor {
  if (cached) return cached;
  if (typeof window === "undefined") return SERVER;
  let vid = load("ck-vid");
  if (!/^[a-z0-9]{8,24}$/.test(vid)) {
    vid = randomId();
    save("ck-vid", vid);
  }
  const code = vid.slice(0, 8);
  // First touch wins: whoever's link brought this browser here first gets the credit.
  let via = load("ck-via");
  const s = new URLSearchParams(window.location.search).get("s") ?? "";
  if (!via && /^[a-z0-9]{6,12}$/.test(s) && s !== code) {
    via = s;
    save("ck-via", via);
  }
  cached = { vid, via, code };
  return cached;
}

const subscribe = () => () => {};

export function useVisitor(): Visitor {
  return useSyncExternalStore(subscribe, readVisitor, () => SERVER);
}

export function tracking(): boolean {
  return typeof navigator !== "undefined" && navigator.doNotTrack !== "1";
}

export function track(event: string, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !tracking()) return;
  const { vid, via } = readVisitor();
  const body = JSON.stringify({ event, vid, via: via || undefined, ...extra });
  try {
    if (navigator.sendBeacon?.(EVENT_URL, body)) return;
  } catch {
    // fall through to fetch
  }
  fetch(EVENT_URL, { method: "POST", body, keepalive: true }).catch(() => {});
}

export const shareUrl = (code: string) => (code ? `${PAGE_URL}?s=${code}` : PAGE_URL);
