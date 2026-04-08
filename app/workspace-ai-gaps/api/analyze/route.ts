import { getSnapshot } from "@/lib/workspace-ai";

export async function GET() {
  const snapshot = await getSnapshot();
  if (!snapshot) {
    return Response.json({ error: "No analysis data yet. Run the scraper first." }, { status: 404 });
  }
  return Response.json(snapshot);
}
