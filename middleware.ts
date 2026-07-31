import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, checkPassword } from "@/lib/stuff/auth";

// jamiesbach.schlacter.me — internally serve everything under /jamie-bach-2026
// so guests land directly on the Bach site.
const BACH_HOST = "jamiesbach.schlacter.me";
const BACH_PREFIX = "/jamie-bach-2026";

// /stuff paths that must remain reachable without auth — matched by prefix so
// the content-hashed icon URLs (e.g. /stuff/icon-13gqup) pass through too.
const STUFF_PUBLIC_PREFIXES = [
  "/stuff/login",
  "/stuff/icon",
  "/stuff/apple-icon",
  "/stuff/manifest",
  "/api/stuff/login",
];

function isStuffPublic(pathname: string): boolean {
  return STUFF_PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "-") || pathname.startsWith(p + "."));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // ── Stuff auth gate ──────────────────────────────────────────────────
  const isStuffPage =
    pathname === "/stuff" || pathname.startsWith("/stuff/");
  const isStuffApi = pathname.startsWith("/api/stuff/");
  if (isStuffPage || isStuffApi) {
    if (isStuffPublic(pathname)) return NextResponse.next();
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    if (!checkPassword(cookie)) {
      if (isStuffApi) {
        return NextResponse.json(
          { error: "unauthorized" },
          { status: 401 }
        );
      }
      const url = req.nextUrl.clone();
      const search = req.nextUrl.search; // preserves ?add=… from share Shortcut
      url.pathname = "/stuff/login";
      url.search = "";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Jamie subdomain host rewrite ─────────────────────────────────────
  if (host !== BACH_HOST) return NextResponse.next();

  if (pathname === BACH_PREFIX || pathname.startsWith(`${BACH_PREFIX}/`)) {
    return NextResponse.next();
  }

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
  matcher: [
    // All non-API pages, minus Next internals + the jamie asset dir.
    "/((?!_next/|api/|jamie/|favicon\\.ico).*)",
    // Plus the Stuff API so it can be auth-gated.
    "/api/stuff/:path*",
  ],
};
