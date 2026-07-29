import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, checkPassword } from "@/lib/stuff/auth";
import { BM_COOKIE, checkPasscode } from "@/lib/babymoon/auth";

// jamiesbach.schlacter.me — internally serve everything under /jamie-bach-2026
// so guests land directly on the Bach site.
const BACH_HOST = "jamiesbach.schlacter.me";
const BACH_PREFIX = "/jamie-bach-2026";

// babymoon.giddins.family — same hidden-subdomain pattern as Jamie's Bach, but
// passcode-gated. Served internally from /babymoon/*, and kept off every other host.
const BM_HOST = "babymoon.giddins.family";
const BM_PREFIX = "/babymoon";

function isBmPublic(pathname: string): boolean {
  return (
    pathname === `${BM_PREFIX}/unlock` ||
    pathname === `${BM_PREFIX}/icon` ||
    pathname === `${BM_PREFIX}/apple-icon` ||
    pathname.startsWith(`${BM_PREFIX}/manifest`)
  );
}

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

  // ── Babymoon subdomain (babymoon.giddins.family) ─────────────────────
  const isBmPath =
    pathname === BM_PREFIX || pathname.startsWith(`${BM_PREFIX}/`);
  // Keep the babymoon off every other host (e.g. schlacter.me/babymoon).
  if (isBmPath && host !== BM_HOST) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (host === BM_HOST) {
    const isAsset =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/favicon");
    // Passcode gate — everything except the login page, assets, and PWA icons.
    if (!isAsset && !isBmPublic(pathname)) {
      const cookie = req.cookies.get(BM_COOKIE)?.value;
      if (!checkPasscode(cookie)) {
        const url = req.nextUrl.clone();
        url.pathname = `${BM_PREFIX}/unlock`;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
    // Serve internal /babymoon paths + assets directly …
    if (isBmPath || isAsset) return NextResponse.next();
    // … and map the subdomain root + friendly paths onto /babymoon/*.
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? BM_PREFIX : `${BM_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
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
