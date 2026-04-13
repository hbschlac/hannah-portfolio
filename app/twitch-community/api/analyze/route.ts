import { getSnapshot } from "@/lib/twitch-research";

export async function GET() {
  const snapshot = await getSnapshot();
  if (!snapshot) {
    return Response.json({ error: "No data available. Run POST /api/scrape first." }, { status: 404 });
  }
  return Response.json(snapshot);
}
