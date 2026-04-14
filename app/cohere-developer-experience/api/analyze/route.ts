import { getSnapshot } from "@/lib/cohere-experience";

export async function GET() {
  const snapshot = await getSnapshot();
  if (!snapshot) {
    return Response.json({ error: "No snapshot yet. Run scrape first." }, { status: 404 });
  }
  return Response.json(snapshot);
}
