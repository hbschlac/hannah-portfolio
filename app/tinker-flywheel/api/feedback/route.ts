import { NextRequest, NextResponse } from "next/server";
import { getRawFeedback, itemMatchesTheme, THEME_KEYWORDS } from "@/lib/tinker-flywheel";

export async function GET(req: NextRequest) {
  const themeId = req.nextUrl.searchParams.get("themeId");
  if (!themeId) {
    return NextResponse.json({ error: "Missing themeId" }, { status: 400 });
  }
  if (!THEME_KEYWORDS[themeId]) {
    return NextResponse.json({ error: "Unknown themeId" }, { status: 400 });
  }

  try {
    const all = await getRawFeedback();
    // Use the same proximity + fine-tune-context gate that drives snapshot
    // frequency counts, so drawer contents line up with the headline numbers.
    const matched = all.filter((item) => itemMatchesTheme(item.text, themeId));

    return NextResponse.json({
      ok: true,
      themeId,
      count: matched.length,
      data: matched.sort((a, b) => b.score - a.score).slice(0, 100),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Feedback fetch failed", details: String(error) },
      { status: 500 }
    );
  }
}
