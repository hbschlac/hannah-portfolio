import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, checkPassword } from "@/lib/stuff/auth";

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

  // ── Wix archives: phones get the mobile-layout snapshot ────────────
  // Wix picked desktop vs mobile layout by user agent; the archives keep both
  // (public/<site>/... and public/<site>/_m/...). Desktop is served by the
  // rewrites in next.config.ts.
  const archive = pathname.match(WIX_ARCHIVE_PATH);
  if (
    archive &&
    !archive[2]?.startsWith("/_") &&
    MOBILE_UA.test(req.headers.get("user-agent") ?? "")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = `/${archive[1]}/_m${archive[2] ?? ""}/index.html`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

const WIX_ARCHIVE_PATH = /^\/(biggerthanrun|reva|ruach2016)(\/.*)?$/;
const MOBILE_UA = /Mobi|Android|iPhone|iPod/i;

export const config = {
  matcher: [
    // All non-API pages, minus Next internals.
    "/((?!_next/|api/|favicon\\.ico).*)",
    // Plus the Stuff API so it can be auth-gated.
    "/api/stuff/:path*",
  ],
};
