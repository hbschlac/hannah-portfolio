import { after, type NextRequest } from "next/server";
import { cleanHit, recordKitHit } from "@/lib/career-kit-stats";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/admin-session";

const KIT_REPO = "https://github.com/hbschlac/career-kit";

// The /career-kit "open the kit" link goes through here so every click is counted, even with
// JavaScript off, then lands on the kit's GitHub page. Counting runs after the redirect is sent.
export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const isAdmin = isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  const hit = cleanHit({ event: "copy_kit", vid: q.get("v") ?? undefined, via: q.get("via") ?? undefined });
  if (hit && !isAdmin) {
    after(async () => {
      try {
        await recordKitHit(hit);
      } catch {
        // Redis unavailable: the visitor still gets to GitHub
      }
    });
  }
  return Response.redirect(KIT_REPO, 307);
}
