/**
 * Returns RESEND_API_KEY, defensively stripping trailing whitespace and a
 * literal "\\n" suffix that has crept in via `vercel env add` in the past.
 * Same class of bug as the muse OAuth secret (global CLAUDE.md notes).
 */
export function getResendKey(): string | undefined {
  const raw = process.env.RESEND_API_KEY;
  if (!raw) return undefined;
  return raw.trim().replace(/\\n$/, "");
}
