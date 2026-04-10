import { revalidateTag } from "next/cache";
import type { RedditPost, RunSummary } from "@/app/claude-ideas/types";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = "hbschlac/build-log";
const BASE = "https://api.github.com/repos/" + REPO + "/contents/reddit-pulse";

async function getFile(path: string): Promise<{ content: unknown[]; sha: string }> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status}`);
  const data = await res.json();
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return { content: JSON.parse(decoded), sha: data.sha };
}

async function putFile(path: string, content: unknown[], sha: string, message: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");
  const res = await fetch(`${BASE}/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: encoded, sha }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${path} failed: ${res.status} ${err}`);
  }
}

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) return Response.json({ error: "Server misconfigured." }, { status: 500 });

  const authHeader = request.headers.get("x-sync-secret");
  let body: { secret?: string; posts?: RedditPost[]; run_summary?: RunSummary };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const provided = authHeader ?? body.secret;
  if (provided !== secret) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { posts, run_summary } = body;
  if (!posts || !run_summary) {
    return Response.json({ error: "posts and run_summary required." }, { status: 400 });
  }

  try {
    const [allPostsFile, runsFile] = await Promise.all([
      getFile("all-posts.json"),
      getFile("runs.json"),
    ]);

    const existingPosts = allPostsFile.content as RedditPost[];
    const existingIds = new Set(existingPosts.map((p) => p.id));
    const newPosts = posts.filter((p) => !existingIds.has(p.id));
    const updatedPosts = [...existingPosts, ...newPosts];

    const existingRuns = runsFile.content as RunSummary[];
    const updatedRuns = [...existingRuns, run_summary];

    const runDate = run_summary.run_date;
    await Promise.all([
      putFile(
        "all-posts.json",
        updatedPosts,
        allPostsFile.sha,
        `data: reddit-pulse run ${runDate} (+${newPosts.length} posts)`
      ),
      putFile(
        "runs.json",
        updatedRuns,
        runsFile.sha,
        `data: reddit-pulse run summary ${runDate}`
      ),
    ]);

    revalidateTag("reddit-pulse", "max");

    return Response.json({
      ok: true,
      new_posts: newPosts.length,
      total_posts: updatedPosts.length,
      runs: updatedRuns.length,
    });
  } catch (err) {
    console.error("ingest error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
