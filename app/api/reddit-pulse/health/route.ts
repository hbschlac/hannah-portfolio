const RAW_BASE =
  "https://raw.githubusercontent.com/hbschlac/build-log/main/reddit-pulse";

const MAX_STALE_DAYS = 3;
const PULLPUSH_TEST_URL =
  "https://api.pullpush.io/reddit/search/submission/?q=claude&subreddit=ClaudeAI&size=1";

export async function GET() {
  const issues: string[] = [];
  const checks: Record<string, unknown> = {};

  // Check pullpush.io reachability
  try {
    const pullpushRes = await fetch(PULLPUSH_TEST_URL, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!pullpushRes.ok) {
      issues.push(`pullpush.io unreachable (HTTP ${pullpushRes.status})`);
      checks.pullpush = { ok: false };
    } else {
      const data = await pullpushRes.json();
      const count = Array.isArray(data?.data) ? data.data.length : 0;
      checks.pullpush = { ok: true, sampleCount: count };
    }
  } catch (err) {
    issues.push(`pullpush.io fetch failed: ${String(err)}`);
    checks.pullpush = { ok: false };
  }

  // Check GitHub files
  try {
    const [runsRes, postsRes] = await Promise.all([
      fetch(`${RAW_BASE}/runs.json`, { cache: "no-store" }),
      fetch(`${RAW_BASE}/all-posts.json`, { cache: "no-store" }),
    ]);

    if (!runsRes.ok) {
      issues.push(`runs.json unreachable (HTTP ${runsRes.status})`);
      checks.runs = { ok: false };
    } else {
      const runs = await runsRes.json();
      const lastRun = Array.isArray(runs) ? runs[runs.length - 1] : null;
      const lastDate = lastRun?.run_date ?? null;
      const daysSince = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
        : null;
      const stale = daysSince === null || daysSince > MAX_STALE_DAYS;
      if (stale) issues.push(`Data is stale — last run was ${daysSince ?? "never"} days ago`);
      checks.runs = { ok: true, count: runs.length, lastRun: lastDate, daysSince, stale };
    }

    if (!postsRes.ok) {
      issues.push(`all-posts.json unreachable (HTTP ${postsRes.status})`);
      checks.posts = { ok: false };
    } else {
      const posts = await postsRes.json();
      checks.posts = { ok: true, count: Array.isArray(posts) ? posts.length : 0 };
    }
  } catch (err) {
    issues.push(`GitHub fetch failed: ${String(err)}`);
  }

  const healthy = issues.length === 0;
  return Response.json(
    { healthy, issues, checks, checkedAt: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
