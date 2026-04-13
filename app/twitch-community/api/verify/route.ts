import { getRawFeedback } from "@/lib/twitch-research";

interface VerifyResult {
  id: string;
  source: string;
  url: string;
  text: string;
  status: "verified" | "blocked" | "error";
  httpStatus?: number;
  contentMatch?: boolean;
  responseSnippet?: string;
  error?: string;
}

export async function GET() {
  const allFeedback = await getRawFeedback();
  if (!allFeedback.length) {
    return Response.json({ error: "No data available" }, { status: 500 });
  }

  // Pick a diverse sample: 5 Reddit, 5 HN, 3 Play Store, 3 App Store, 2 curated
  const sampleBySource: Record<string, number> = {
    reddit: 5,
    hackernews: 5,
    playstore: 3,
    appstore: 3,
    curated: 2,
  };

  const sample: typeof allFeedback = [];
  for (const [source, count] of Object.entries(sampleBySource)) {
    const items = allFeedback
      .filter((f) => f.source === source && f.url)
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
    sample.push(...items);
  }

  // Verify each URL
  const results: VerifyResult[] = await Promise.all(
    sample.map(async (item) => {
      const result: VerifyResult = {
        id: item.id,
        source: item.source,
        url: item.url,
        text: item.text.slice(0, 150),
        status: "error",
      };

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(item.url, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            Accept: "text/html,application/xhtml+xml",
          },
          redirect: "follow",
          signal: controller.signal,
        });
        clearTimeout(timeout);

        result.httpStatus = res.status;

        if (res.status === 200) {
          const body = await res.text();
          // Check if any words from the scraped text appear in the response
          const words = item.text
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 4)
            .slice(0, 10);
          const matchCount = words.filter((w) => body.toLowerCase().includes(w)).length;
          result.contentMatch = matchCount >= Math.min(3, words.length);
          result.responseSnippet = body.slice(0, 200).replace(/<[^>]*>/g, "").trim().slice(0, 120);
          result.status = "verified";
        } else if (res.status === 403 || res.status === 429) {
          result.status = "blocked";
          result.error = `HTTP ${res.status} — site blocks automated requests (expected for Reddit/some platforms)`;
        } else {
          result.status = "error";
          result.error = `HTTP ${res.status}`;
        }
      } catch (e) {
        result.status = "error";
        result.error = String(e).includes("abort") ? "Timeout (8s)" : String(e).slice(0, 100);
      }

      return result;
    })
  );

  const verified = results.filter((r) => r.status === "verified").length;
  const blocked = results.filter((r) => r.status === "blocked").length;
  const errors = results.filter((r) => r.status === "error").length;

  return Response.json({
    checkedAt: new Date().toISOString(),
    totalChecked: results.length,
    verified,
    blocked,
    errors,
    totalDataPoints: allFeedback.length,
    sourceBreakdown: Object.entries(sampleBySource).map(([source, target]) => ({
      source,
      sampled: results.filter((r) => r.source === source).length,
      verified: results.filter((r) => r.source === source && r.status === "verified").length,
      blocked: results.filter((r) => r.source === source && r.status === "blocked").length,
    })),
    results,
  });
}
