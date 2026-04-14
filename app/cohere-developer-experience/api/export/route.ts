import { getRawFeedback, getCuratedFeedback } from "@/lib/cohere-experience";

export async function GET() {
  let feedback = await getRawFeedback();
  if (feedback.length === 0) feedback = getCuratedFeedback();
  return new Response(JSON.stringify(feedback, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="cohere-developer-experience.json"',
    },
  });
}
