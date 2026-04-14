import { buildSnapshot } from "@/lib/cohere-experience";

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const provided = searchParams.get("secret") ?? request.headers.get("x-sync-secret");
  if (provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await buildSnapshot();
    return Response.json({
      ok: true,
      totalFeedback: snapshot.totalFeedback,
      byVendor: snapshot.byVendor,
      sources: snapshot.sources,
      themes: snapshot.themes.length,
      lastUpdated: snapshot.lastUpdated,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
