import { NextRequest } from "next/server";
import { buildSnapshot } from "@/lib/twitch-research";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.SYNC_SECRET?.trim()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await buildSnapshot();
    return Response.json({
      ok: true,
      totalFeedback: snapshot.totalFeedback,
      sources: snapshot.sources,
      themes: snapshot.themes.map((t) => ({ id: t.id, name: t.name, frequency: t.frequency, layer: t.layer })),
      perspectiveSplit: snapshot.perspectiveSplit,
      lastUpdated: snapshot.lastUpdated,
    });
  } catch (error) {
    return Response.json({ error: "Scrape failed", details: String(error) }, { status: 500 });
  }
}
