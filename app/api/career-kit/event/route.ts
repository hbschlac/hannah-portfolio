import { cookies } from "next/headers";
import { cleanHit, recordKitHit } from "@/lib/career-kit-stats";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/admin-session";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord/i;

// Receives the /career-kit page's navigator.sendBeacon() events. Always answers 204 so a failure
// here never shows up for the visitor.
export async function POST(request: Request) {
  try {
    if (BOT.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
    // Hannah's own visits: skipped on any browser signed in to /admin.
    const cookieStore = await cookies();
    if (isAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) return new Response(null, { status: 204 });

    const text = await request.text();
    if (text.length > 1000) return new Response(null, { status: 204 });
    const hit = cleanHit(JSON.parse(text));
    if (hit) await recordKitHit(hit);
  } catch {
    // bad JSON or Redis unavailable: drop the event
  }
  return new Response(null, { status: 204 });
}
