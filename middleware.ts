import { NextResponse, type NextRequest } from "next/server";

// jamiesbach.schlacter.me — internally serve everything under /jamie-bach-2026
// so guests land directly on the Bach site. Static assets, /_next, /api, and
// /jamie/* uploaded files pass through unchanged (the matcher below already
// excludes them, but we double-check inside in case of edge cases).
const BACH_HOST = "jamiesbach.schlacter.me";
const BACH_PREFIX = "/jamie-bach-2026";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  if (host !== BACH_HOST) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Already on the right route — no rewrite needed.
  if (pathname === BACH_PREFIX || pathname.startsWith(`${BACH_PREFIX}/`)) {
    return NextResponse.next();
  }

  // Don't touch static-asset paths even if they slip past the matcher.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/jamie/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? BACH_PREFIX : `${BACH_PREFIX}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals + API + the /jamie/ asset folder. Match everything else.
  matcher: ["/((?!_next/|api/|jamie/|favicon\\.ico).*)"],
};
