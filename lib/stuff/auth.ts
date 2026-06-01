// Edge-safe auth helpers. The cookie value IS the password (HttpOnly keeps
// it out of client JS). Single-user app — overkill avoided, but a
// timing-safe compare costs nothing.

export const COOKIE_NAME = "stuff_auth";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(value: string | undefined | null): boolean {
  const expected = process.env.STUFF_PASSWORD;
  if (!expected || !value) return false;
  return timingSafeEqual(value, expected);
}
