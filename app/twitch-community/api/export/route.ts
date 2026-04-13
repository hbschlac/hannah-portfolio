import { getRawFeedback } from "@/lib/twitch-research";

export async function GET() {
  const raw = await getRawFeedback();
  return Response.json(raw, {
    headers: {
      "Content-Disposition": "attachment; filename=twitch-community-research.json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
