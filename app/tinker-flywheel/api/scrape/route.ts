import { NextRequest, NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/tinker-flywheel";

export const maxDuration = 300; // 5 min for scraping

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-sync-secret");
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await buildSnapshot();

    return NextResponse.json({
      ok: true,
      totalFeedback: snapshot.totalFeedback,
      sources: snapshot.sources,
      themes: snapshot.themes.map((t) => ({
        id: t.id,
        name: t.name,
        phase: t.phase,
        frequency: t.frequency,
      })),
      phaseBreakdown: snapshot.phaseBreakdown,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}
