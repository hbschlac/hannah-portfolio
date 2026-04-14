import { revalidateTag } from "next/cache";
import type { PulsePost, PostCategory, Sentiment } from "@/app/managed-agents-pulse/types";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = "hbschlac/build-log";
const BASE = "https://api.github.com/repos/" + REPO + "/contents/managed-agents-pulse";

const VALID_CATEGORIES = new Set<PostCategory>(["momentum", "friction", "use_case", "feature_request"]);
const VALID_SENTIMENTS = new Set<Sentiment>(["negative", "positive", "neutral"]);
const VALID_TAGS = new Set([
  "auth", "sandbox", "pricing", "docs", "sdk", "rate_limits", "streaming",
  "tool_use", "error_handling", "deployment", "mcp", "context_window",
  "permissions", "tracing",
]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface TweetSeed {
  url: string;
  text: string;
  author: string; // "@handle" or "handle"
  score?: number; // likes/retweets — optional
  date: string; // "YYYY-MM-DD"
  category: PostCategory;
  tags?: string[];
  sentiment?: Sentiment;
}

function coerceTweet(t: TweetSeed): { ok: true; post: PulsePost } | { ok: false; reason: string } {
  if (typeof t.url !== "string" || (!t.url.includes("twitter.com") && !t.url.includes("x.com")))
    return { ok: false, reason: `invalid url: ${t.url}` };
  if (typeof t.text !== "string" || t.text.length === 0)
    return { ok: false, reason: "missing text" };
  if (typeof t.author !== "string" || t.author.length === 0)
    return { ok: false, reason: "missing author" };
  if (!DATE_RE.test(t.date))
    return { ok: false, reason: `invalid date: ${t.date}` };
  if (!VALID_CATEGORIES.has(t.category))
    return { ok: false, reason: `invalid category: ${t.category}` };
  const tags = t.tags ?? [];
  const badTag = tags.find((tag) => !VALID_TAGS.has(tag));
  if (badTag) return { ok: false, reason: `unknown tag: ${badTag}` };
  const sentiment = t.sentiment ?? "neutral";
  if (!VALID_SENTIMENTS.has(sentiment))
    return { ok: false, reason: `invalid sentiment: ${sentiment}` };

  // Derive a stable id from the URL
  const idMatch = t.url.match(/status\/(\d+)/);
  const id = idMatch ? `twitter-${idMatch[1]}` : `twitter-${Buffer.from(t.url).toString("base64url").slice(0, 16)}`;

  const handle = t.author.startsWith("@") ? t.author : `@${t.author}`;
  const snippet = t.text.length > 300 ? t.text.slice(0, 297) + "..." : t.text;

  const post: PulsePost = {
    id,
    collected_run: t.date,
    title: snippet.split("\n")[0].slice(0, 160),
    subreddit: handle,
    source: "twitter",
    score: typeof t.score === "number" ? t.score : 0,
    num_comments: 0,
    url: t.url,
    selftext_snippet: snippet,
    category: t.category,
    tags,
    sentiment,
  };
  return { ok: true, post };
}

async function getFile(path: string): Promise<{ content: unknown[]; sha: string }> {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" },
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
  let body: { secret?: string; tweets?: TweetSeed[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const provided = authHeader ?? body.secret;
  if (provided !== secret) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { tweets } = body;
  if (!Array.isArray(tweets) || tweets.length === 0)
    return Response.json({ error: "tweets (non-empty array) required." }, { status: 400 });

  const validPosts: PulsePost[] = [];
  const rejected: { index: number; reason: string }[] = [];
  for (let i = 0; i < tweets.length; i++) {
    const r = coerceTweet(tweets[i]);
    if (r.ok) validPosts.push(r.post);
    else rejected.push({ index: i, reason: r.reason });
  }
  if (rejected.length / tweets.length > 0.2) {
    return Response.json(
      { error: "Too many invalid tweets.", rejected: rejected.slice(0, 5) },
      { status: 422 },
    );
  }

  try {
    const allPostsFile = await getFile("all-posts.json");
    const existing = allPostsFile.content as PulsePost[];
    const existingIds = new Set(existing.map((p) => p.id));
    const newPosts = validPosts.filter((p) => !existingIds.has(p.id));
    const updated = [...existing, ...newPosts];

    await putFile(
      "all-posts.json",
      updated,
      allPostsFile.sha,
      `data: managed-agents-pulse twitter seed (+${newPosts.length} tweets)`,
    );

    revalidateTag("managed-agents-pulse", "max");

    return Response.json({
      ok: true,
      new_posts: newPosts.length,
      rejected_posts: rejected.length,
      total_posts: updated.length,
    });
  } catch (err) {
    console.error("twitter-seed ingest error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
