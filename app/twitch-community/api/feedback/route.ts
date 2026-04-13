import { NextRequest } from "next/server";
import { getRawFeedback, THEME_KEYWORDS } from "@/lib/twitch-research";

export async function GET(request: NextRequest) {
  const themeId = request.nextUrl.searchParams.get("themeId");
  const perspective = request.nextUrl.searchParams.get("perspective"); // "creator" | "viewer" | "both" | null
  if (!themeId) {
    return Response.json({ error: "Missing themeId parameter" }, { status: 400 });
  }

  const keywords = THEME_KEYWORDS[themeId];
  if (!keywords) {
    return Response.json({ error: `Unknown theme: ${themeId}` }, { status: 400 });
  }

  const raw = await getRawFeedback();
  let filtered = raw.filter((f) => {
    const lower = f.text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  });

  if (perspective && perspective !== "all") {
    filtered = filtered.filter((f) => f.perspective === perspective);
  }

  // Sort by score descending (signal strength)
  filtered.sort((a, b) => b.score - a.score);

  return Response.json({
    themeId,
    total: filtered.length,
    items: filtered,
  });
}
