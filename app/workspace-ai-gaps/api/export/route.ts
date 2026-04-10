import { getRawFeedback, getCuratedFeedback } from "@/lib/workspace-ai";

export async function GET() {
  let items = await getRawFeedback();
  if (items.length === 0) {
    items = getCuratedFeedback();
  }

  return new Response(JSON.stringify(items, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="workspace-ai-feedback.json"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
