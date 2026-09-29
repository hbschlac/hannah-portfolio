import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "admin_session";

// The admin cookie holds a value derived from ADMIN_PASSWORD rather than a constant, so it can't
// be forged by setting the cookie by hand. Changing the password signs every device out.
export function adminSessionToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (!secret) return null;
  return createHmac("sha256", secret).update("schlacter.me admin session v1").digest("hex");
}

export function isAdminSession(value: string | undefined): boolean {
  const expected = adminSessionToken();
  if (!expected || !value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
