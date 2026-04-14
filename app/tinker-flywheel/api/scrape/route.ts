import { NextRequest, NextResponse } from "next/server";
import { buildSnapshot, rebuildSnapshotFromStored } from "@/lib/tinker-flywheel";

export const maxDuration = 300; // 5 min for scraping

export async function POST(req: NextRequest) {
  const provided = (req.nextUrl.searchParams.get("secret") || req.headers.get("x-sync-secret") || "").trim();
  const expected = process.env.SYNC_SECRET?.trim();
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ?analyzeOnly=1 skips the fetch and re-analyzes already-stored raw feedback
  // with the current theme keywords. Use after tuning keywords.
  const analyzeOnly = req.nextUrl.searchParams.get("analyzeOnly") === "1";

  try {
    const snapshot = analyzeOnly ? await rebuildSnapshotFromStored() : await buildSnapshot();

    return NextResponse.json({
      ok: true,
      mode: analyzeOnly ? "analyze-only" : "full-scrape",
      totalFeedback: snapshot.totalFeedback,
      sources: snapshot.sources,
      themes: snapshot.themes.map((t) => ({
        id: t.id,
        name: t.name,
        phase: t.phase,
        frequency: t.frequency,
      })),
      phaseBreakdown: snapshot.phaseBreakdown,
      thesis: snapshot.thesis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}
