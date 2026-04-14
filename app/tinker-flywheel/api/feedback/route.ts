import { NextRequest, NextResponse } from "next/server";
import { getRawFeedback } from "@/lib/tinker-flywheel";
import { THEME_KEYWORDS } from "@/lib/tinker-flywheel";

export async function GET(req: NextRequest) {
  const themeId = req.nextUrl.searchParams.get("themeId");
  if (!themeId) {
    return NextResponse.json({ error: "Missing themeId" }, { status: 400 });
  }

  try {
    const all = await getRawFeedback();
    const keywords = THEME_KEYWORDS[themeId];
    if (!keywords) {
      return NextResponse.json({ error: "Unknown themeId" }, { status: 400 });
    }

    const matched = all.filter((item) => {
      const lower = item.text.toLowerCase();
      return keywords.some((kw: string) => lower.includes(kw));
    });

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
