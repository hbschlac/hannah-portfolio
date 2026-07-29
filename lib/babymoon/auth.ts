// Edge-safe passcode gate for the babymoon subdomain, mirroring lib/stuff/auth.
// The cookie value IS the passcode (HttpOnly keeps it out of client JS).
// Falls back to a default so the gate works even without a Vercel env var set;
// override anytime with a BABYMOON_PASSCODE env var. Server-only — never shipped
// to the browser.

export const BM_COOKIE = "bm_auth";

export const BABYMOON_PASSCODE = (process.env.BABYMOON_PASSCODE || "cabo2026").trim();

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPasscode(value: string | undefined | null): boolean {
  if (!BABYMOON_PASSCODE || !value) return false;
  return timingSafeEqual(value.trim(), BABYMOON_PASSCODE);
}
