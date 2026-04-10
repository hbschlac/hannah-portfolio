import { getRawGmailFeedback, getCuratedGmailFeedback, HYPOTHESIS_KEYWORDS, getHypothesisById } from "@/lib/gmail-action";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hypothesisId = searchParams.get("hypothesisId");

  if (!hypothesisId) {
    return Response.json({ error: "hypothesisId query parameter required" }, { status: 400 });
  }

  const hypothesis = getHypothesisById(hypothesisId);
  if (!hypothesis) {
    return Response.json({ error: "Unknown hypothesisId" }, { status: 404 });
  }

  const keywords = HYPOTHESIS_KEYWORDS[hypothesisId as keyof typeof HYPOTHESIS_KEYWORDS] ?? [];

  let allFeedback = await getRawGmailFeedback();
  if (allFeedback.length === 0) {
    allFeedback = getCuratedGmailFeedback();
  }

  const items = allFeedback.filter((f) => {
    const lower = f.text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  });

  return Response.json({
    hypothesisId,
    hypothesisName: hypothesis.name,
    total: items.length,
    items,
  });
}
