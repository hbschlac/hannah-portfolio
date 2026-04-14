import { Redis } from "@upstash/redis";

// ── Types ──

export type FeedbackSource = "reddit" | "hackernews" | "github-issues" | "stackoverflow" | "huggingface" | "twitter" | "curated";

export type LifecyclePhase = "evaluate" | "iterate";

export type RawFeedback = {
  id: string;
  source: FeedbackSource;
  text: string;
  author: string;
  url: string;
  score: number;
  date: string;
  dateConfidence: "high" | "low";
  phase?: LifecyclePhase;
  subreddit?: string;
};

export type FlywheelTheme = {
  id: string;
  name: string;
  description: string;
  phase: LifecyclePhase;
  severity: number; // 1-5
  frequency: number;
  quotes: { text: string; source: FeedbackSource; url: string; author: string; date: string; score: number }[];
};

export type AnalysisSnapshot = {
  lastUpdated: string;
  totalFeedback: number;
  sources: Partial<Record<FeedbackSource, number>>;
  themes: FlywheelTheme[];
  phaseBreakdown: { evaluate: number; iterate: number };
  thesis: string;
};

// ── Redis helpers ──

const KV_KEY = "tinker-flywheel:snapshot";
const KV_RAW_KEY = "tinker-flywheel:raw-feedback";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Missing Redis credentials");
  return new Redis({ url, token });
}

export async function getSnapshot(): Promise<AnalysisSnapshot | null> {
  const redis = getRedis();
  return redis.get<AnalysisSnapshot>(KV_KEY);
}

export async function saveSnapshot(snapshot: AnalysisSnapshot): Promise<void> {
  const redis = getRedis();
  await redis.set(KV_KEY, snapshot);
}

export async function getRawFeedback(): Promise<RawFeedback[]> {
  const redis = getRedis();
  return (await redis.get<RawFeedback[]>(KV_RAW_KEY)) ?? [];
}

export async function saveRawFeedback(feedback: RawFeedback[]): Promise<void> {
  const redis = getRedis();
  await redis.set(KV_RAW_KEY, feedback);
}

// ── Fine-tuning context words (double-gate filter) ──

// Strong: unambiguously about fine-tuning. One match is enough.
const STRONG_CONTEXT = [
  "fine-tun", "finetun", "fine tun", "lora", "qlora",
  "sft", "rlhf", "dpo", "grpo",
  "training run", "training job",
  "axolotl", "unsloth", "tinker",
  "instruction tun",
];

// Weak: common in fine-tuning discussions but also appear in general ML.
// Need 2+ weak matches OR 1 weak + appears near a theme keyword.
const WEAK_CONTEXT = [
  "ppo", "training data", "train a model", "train the model",
  "trained model", "trained a", "adapter", "checkpoint",
  "base model", "huggingface", "transformers", "distill",
];

// Noise patterns to exclude (job listings, resumes, self-promo, meta-threads)
// These must be specific enough to not catch legitimate technical content
const NOISE_PATTERNS = [
  // Job listings & resumes (specific phrases only)
  "willing to relocate",
  "please check my resume",
  "looking for work", "seeking position",
  "years of experience", "salary:",
  "job posting", "job opening", "we're hiring", "we are hiring",
  "apply here", "apply now", "join our team",
  "compensation:", "benefits package",
  // HN "Who is Hiring" threads & monthly meta
  "who is hiring", "who's hiring", "ask hn: who is hiring",
  "freelancer? seeking freelancer",
  "seeking work", "looking for contract",
  // Self-promo / marketing
  "subscribe to our newsletter", "use my referral",
  "check out my course", "enroll now", "limited time offer",
  "discount code",
];

function hasFineTuneContext(text: string): boolean {
  const lower = text.toLowerCase();
  // Reject noise first
  if (NOISE_PATTERNS.some((p) => lower.includes(p))) return false;
  // One strong context word is sufficient
  if (STRONG_CONTEXT.some((kw) => lower.includes(kw))) return true;
  // For weak context words, require at least 2 matches
  const weakMatches = WEAK_CONTEXT.filter((kw) => lower.includes(kw)).length;
  return weakMatches >= 2;
}

// ── Freshness filter ──

function isWithinWindow(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 18);
  return date >= cutoff;
}

// ── Reddit scraper ──

// Primary subs get all terms, secondary subs get fewer high-value terms
const PRIMARY_SUBS = ["LocalLLaMA", "MachineLearning"];
const SECONDARY_SUBS = ["MLOps", "deeplearning", "artificial", "datascience", "LangChain"];

const PRIMARY_SEARCH_TERMS = [
  "fine-tuning evaluation", "fine-tune evaluate", "evaluate fine-tuned",
  "retrain model", "retraining", "when to retrain",
  "model drift", "model degradation",
  "fine-tune quality", "fine-tuning quality",
  "LoRA comparison", "LoRA merge", "LoRA adapter",
  "catastrophic forgetting", "model regression",
  "training data quality", "data quality fine-tune",
  "model versioning",
  "fine-tune benchmark", "fine-tuning benchmark",
  "fine-tune cost", "training cost",
  "incremental training", "continue training",
  "fine-tune broke", "fine-tuning worse",
  "compare models",
  "Tinker API", "thinkingmachines",
];

const SECONDARY_SEARCH_TERMS = [
  "fine-tuning evaluation", "catastrophic forgetting",
  "model drift", "retraining", "LoRA",
  "training data quality", "model versioning",
  "fine-tune cost",
];

// ── Pullpush.io Reddit scraper (Pushshift successor, no rate limits) ──

export async function scrapeRedditPullpush(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];

  // Build all (sub, term) pairs — primary subs × all terms, secondary subs × fewer terms
  const pairs: [string, string][] = [
    ...PRIMARY_SUBS.flatMap((sub) => PRIMARY_SEARCH_TERMS.map((term) => [sub, term] as [string, string])),
    ...SECONDARY_SUBS.flatMap((sub) => SECONDARY_SEARCH_TERMS.map((term) => [sub, term] as [string, string])),
  ];

  // Batch posts: 5 concurrent requests at a time with 500ms between batches
  const postTasks = pairs.map(([sub, term]) => async () => {
    const items: RawFeedback[] = [];
    try {
      // Don't filter by after= in API — Pullpush scores may differ from live Reddit
      const url = `https://api.pullpush.io/reddit/search/submission/?subreddit=${sub}&q=${encodeURIComponent(term)}&size=100&sort=score&order=desc`;
      let res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 3000));
        res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      }
      if (!res.ok) return items;
      const data = await res.json();

      for (const post of data?.data ?? []) {
        const dateStr = new Date((post.created_utc ?? 0) * 1000).toISOString();
        if (!isWithinWindow(dateStr)) continue;
        const text = `${post.title ?? ""}\n\n${post.selftext ?? ""}`.trim();
        if (text.length < 30) continue;
        // Pullpush captures historical scores — lower threshold to 1
        if ((post.score ?? 0) < 1) continue;

        items.push({
          id: `reddit-${post.id}`,
          source: "reddit",
          text,
          author: post.author ?? "anonymous",
          url: `https://reddit.com${post.permalink ?? `/r/${sub}/comments/${post.id}`}`,
          score: post.score ?? 0,
          date: dateStr,
          dateConfidence: "high",
          subreddit: sub,
        });
      }
    } catch {
      // skip failed requests
    }
    return items;
  });

  // Run post scraping in batches of 3 with 1s delay (Pullpush rate limits)
  for (let i = 0; i < postTasks.length; i += 3) {
    const batch = postTasks.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    for (const items of batchResults) results.push(...items);
    if (i + 3 < postTasks.length) await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`  Reddit posts scraped: ${results.length} raw items from ${pairs.length} queries`);

  // Fetch comments on top-scoring posts
  const seen = new Set<string>();
  const dedupedPosts = results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  const topPostIds = dedupedPosts
    .filter((r) => r.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 60)
    .map((r) => ({ id: r.id.replace("reddit-", ""), sub: r.subreddit ?? "" }));

  // Also search for comments directly with key terms
  const commentSearchTerms = [
    "fine-tuning evaluation", "catastrophic forgetting", "model drift",
    "retraining", "LoRA merge", "training data quality",
    "when to retrain", "fine-tune broke", "model versioning",
  ];

  const commentSubs = [...PRIMARY_SUBS, ...SECONDARY_SUBS.slice(0, 3)]; // Include MLOps, deeplearning, artificial
  const commentSearchTasks = commentSearchTerms.flatMap((term) =>
    commentSubs.map((sub) => async () => {
      const items: RawFeedback[] = [];
      try {
        const url = `https://api.pullpush.io/reddit/search/comment/?subreddit=${sub}&q=${encodeURIComponent(term)}&size=100&sort=score&order=desc`;
        let res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        // Retry once on 429
        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, 3000));
          res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        }
        if (!res.ok) return items;
        const data = await res.json();

        for (const comment of data?.data ?? []) {
          if (!comment.body || comment.body.length < 30) continue;
          const dateStr = new Date((comment.created_utc ?? 0) * 1000).toISOString();
          if (!isWithinWindow(dateStr)) continue;

          items.push({
            id: `reddit-comment-${comment.id}`,
            source: "reddit",
            text: comment.body.trim(),
            author: comment.author ?? "anonymous",
            url: `https://reddit.com${comment.permalink ?? `/r/${sub}/comments/${comment.link_id?.replace("t3_", "") ?? "unknown"}/-/${comment.id}`}`,
            score: comment.score ?? 0,
            date: dateStr,
            dateConfidence: "high",
            subreddit: comment.subreddit ?? sub,
          });
        }
      } catch {
        // skip
      }
      return items;
    })
  );

  // Wait before starting comment scraping (Pullpush rate limits after post queries)
  console.log("  Pausing 15s before comment scraping...");
  await new Promise((r) => setTimeout(r, 15000));

  // Run comment searches sequentially with 2s delay (Pullpush is strict)
  for (const task of commentSearchTasks) {
    const items = await task();
    results.push(...items);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`  Reddit total (posts+comments): ${results.length} raw items`);

  // Deduplicate
  const finalSeen = new Set<string>();
  return results.filter((r) => {
    if (finalSeen.has(r.id)) return false;
    finalSeen.add(r.id);
    return true;
  });
}

async function fetchWithRetry(url: string, ua: string, retries = 2): Promise<Response | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": ua } });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      if (!res.ok) return null;
      return res;
    } catch {
      if (i === retries) return null;
    }
  }
  return null;
}

// Process in batches of N concurrent requests
async function batchProcess<T>(items: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

export async function scrapeReddit(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const UA = "tinker-flywheel-research/1.0";

  // Primary subs × all terms, secondary subs × fewer terms
  const pairs: [string, string][] = [
    ...PRIMARY_SEARCH_TERMS.flatMap((term) => PRIMARY_SUBS.map((sub) => [term, sub] as [string, string])),
    ...SECONDARY_SEARCH_TERMS.flatMap((term) => SECONDARY_SUBS.map((sub) => [term, sub] as [string, string])),
  ];

  const tasks = pairs.map(([term, sub]) => async () => {
      const items: RawFeedback[] = [];
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(term)}&restrict_sr=1&sort=relevance&t=all&limit=25`;
      const res = await fetchWithRetry(url, UA);
      if (!res) return items;
      const data = await res.json();

      for (const post of data?.data?.children ?? []) {
        const d = post.data;
        if (!d.selftext && !d.title) continue;
        const dateStr = new Date((d.created_utc ?? 0) * 1000).toISOString();
        if (!isWithinWindow(dateStr)) continue;

        const text = `${d.title}\n\n${d.selftext ?? ""}`.trim();
        if (text.length < 30) continue;
        if (d.score < 2) continue;

        items.push({
          id: `reddit-${d.id}`,
          source: "reddit",
          text,
          author: d.author ?? "anonymous",
          url: `https://reddit.com${d.permalink}`,
          score: d.score ?? 0,
          date: dateStr,
          dateConfidence: "high",
          subreddit: sub,
        });
      }
      return items;
    });

  // Sequential with delay to avoid Reddit 429s
  for (const task of tasks) {
    const items = await task();
    results.push(...items);
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Scrape comments on high-value posts (batched)
  const topPosts = results
    .filter((r) => r.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);

  const commentTasks = topPosts.map((post) => async () => {
    const items: RawFeedback[] = [];
    const res = await fetchWithRetry(`${post.url}.json?limit=50`, UA);
    if (!res) return items;
    const data = await res.json();
    const comments = data?.[1]?.data?.children ?? [];
    for (const comment of comments) {
      const c = comment.data;
      if (!c?.body || c.body.length < 30) continue;
      const dateStr = new Date((c.created_utc ?? 0) * 1000).toISOString();
      if (!isWithinWindow(dateStr)) continue;

      items.push({
        id: `reddit-comment-${c.id}`,
        source: "reddit",
        text: c.body.trim(),
        author: c.author ?? "anonymous",
        url: `https://reddit.com${c.permalink}`,
        score: c.score ?? 0,
        date: dateStr,
        dateConfidence: "high",
        subreddit: c.subreddit ?? post.subreddit,
      });
    }
    return items;
  });

  const commentResults = await batchProcess(commentTasks, 5);
  for (const batch of commentResults) results.push(...batch);

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Hacker News scraper ──

const HN_QUERIES = [
  "fine-tuning", "fine-tune", "finetune", "finetuning",
  "LoRA training", "model evaluation",
  "retraining model", "model drift",
  "Tinker API", "thinking machines lab",
  "training pipeline", "ML lifecycle",
  "catastrophic forgetting",
  "model versioning", "model comparison",
];

export async function scrapeHackerNews(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const cutoffTimestamp = Math.floor(Date.now() / 1000) - 18 * 30 * 24 * 60 * 60;

  for (const query of HN_QUERIES) {
    try {
      // Stories
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=30&numericFilters=created_at_i>${cutoffTimestamp}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const hit of data.hits ?? []) {
        const text = hit.title ?? "";
        if (text.length < 10) continue;
        results.push({
          id: `hn-${hit.objectID}`,
          source: "hackernews",
          text,
          author: hit.author ?? "anonymous",
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          score: hit.points ?? 0,
          date: hit.created_at ?? new Date().toISOString(),
          dateConfidence: "high",
        });
      }

      // Comments (richer signal)
      const commentUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=50&numericFilters=created_at_i>${cutoffTimestamp}`;
      const commentRes = await fetch(commentUrl);
      if (commentRes.ok) {
        const commentData = await commentRes.json();
        for (const hit of commentData.hits ?? []) {
          if (!hit.comment_text) continue;
          const text = hit.comment_text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          if (text.length < 30) continue;
          results.push({
            id: `hn-comment-${hit.objectID}`,
            source: "hackernews",
            text,
            author: hit.author ?? "anonymous",
            url: `https://news.ycombinator.com/item?id=${hit.story_id ?? hit.objectID}`,
            score: hit.points ?? 0,
            date: hit.created_at ?? new Date().toISOString(),
            dateConfidence: "high",
          });
        }
      }
    } catch {
      // skip
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── GitHub Issues scraper ──

const GITHUB_REPOS = [
  "thinking-machines-lab/tinker",
  "huggingface/transformers",
  "axolotl-ai-cloud/axolotl",
  "unslothai/unsloth",
];

const GITHUB_SEARCH_TERMS = [
  "evaluate", "evaluation", "benchmark",
  "retrain", "drift", "regression",
  "version", "compare", "rollback",
  "data quality", "catastrophic forgetting",
  "fine-tune", "fine-tuning", "lora",
];

export async function scrapeGitHubIssues(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];

  for (const repo of GITHUB_REPOS) {
    for (const term of GITHUB_SEARCH_TERMS) {
      try {
        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(term)}+repo:${repo}+is:issue&per_page=30&sort=created&order=desc`;
        const res = await fetch(url, {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "tinker-flywheel-research/1.0",
            ...(process.env.GITHUB_TOKEN ? { "Authorization": `token ${process.env.GITHUB_TOKEN}` } : {}),
          },
        });
        if (!res.ok) continue;
        const data = await res.json();

        for (const issue of data.items ?? []) {
          const dateStr = issue.created_at ?? new Date().toISOString();
          if (!isWithinWindow(dateStr)) continue;

          const text = `${issue.title}\n\n${(issue.body ?? "").slice(0, 500)}`.trim();
          if (text.length < 30) continue;

          results.push({
            id: `gh-${repo.replace("/", "-")}-${issue.number}`,
            source: "github-issues",
            text,
            author: issue.user?.login ?? "anonymous",
            url: issue.html_url ?? "",
            score: (issue.comments ?? 0) + (issue.reactions?.total_count ?? 0),
            date: dateStr,
            dateConfidence: "high",
          });
        }
      } catch {
        // skip
      }
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Stack Overflow scraper ──

export async function scrapeStackOverflow(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const queries = [
    "fine+tuning+evaluation", "fine+tuning+quality",
    "model+retraining", "model+drift+detection",
    "LoRA+fine+tuning", "catastrophic+forgetting",
    "model+versioning+ML", "fine+tuning+benchmark",
    "training+data+quality+LLM",
    "fine+tune+LLM", "model+comparison+fine+tune",
    "evaluate+fine+tuned+model", "LLM+training+cost",
    "model+checkpoint+comparison", "adapter+training",
    "instruction+tuning+evaluation", "RLHF+evaluation",
    "DPO+training", "model+regression+fine+tune",
  ];

  for (const query of queries) {
    try {
      const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${query}&site=stackoverflow&pagesize=30&filter=withbody`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of data.items ?? []) {
        const text = (item.title ?? "") + "\n\n" + ((item.body ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
        if (text.length < 30) continue;
        const dateStr = new Date((item.creation_date ?? 0) * 1000).toISOString();
        if (!isWithinWindow(dateStr)) continue;

        results.push({
          id: `so-${item.question_id}`,
          source: "stackoverflow",
          text: text.slice(0, 500),
          author: item.owner?.display_name ?? "anonymous",
          url: item.link ?? `https://stackoverflow.com/q/${item.question_id}`,
          score: item.score ?? 0,
          date: dateStr,
          dateConfidence: "high",
        });
      }
    } catch {
      // skip
    }
  }

  // Also datascience.stackexchange.com and ai.stackexchange.com
  const secondarySites = ["datascience", "ai"];
  for (const site of secondarySites) for (const query of ["fine+tuning", "model+evaluation", "retraining", "LoRA", "fine+tune+LLM", "model+drift", "training+pipeline"]) {
    try {
      const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${query}&site=${site}&pagesize=30&filter=withbody`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of data.items ?? []) {
        const text = (item.title ?? "") + "\n\n" + ((item.body ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
        if (text.length < 30) continue;
        const dateStr = new Date((item.creation_date ?? 0) * 1000).toISOString();
        if (!isWithinWindow(dateStr)) continue;

        results.push({
          id: `so-${site}-${item.question_id}`,
          source: "stackoverflow",
          text: text.slice(0, 500),
          author: item.owner?.display_name ?? "anonymous",
          url: item.link ?? `https://${site}.stackexchange.com/q/${item.question_id}`,
          score: item.score ?? 0,
          date: dateStr,
          dateConfidence: "high",
        });
      }
    } catch {
      // skip
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Hugging Face Forums scraper ──

export async function scrapeHuggingFace(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const searchTerms = [
    "fine-tuning evaluation", "fine-tune quality",
    "LoRA training", "catastrophic forgetting",
    "retrain", "model drift",
    "training data quality", "benchmark fine-tune",
    "model comparison", "fine-tune regression",
    "adapter merge", "incremental training",
  ];

  for (const term of searchTerms) {
    try {
      const url = `https://discuss.huggingface.co/search.json?q=${encodeURIComponent(term)}&order=latest`;
      const res = await fetch(url, {
        headers: { "User-Agent": "tinker-flywheel-research/1.0" },
      });
      if (!res.ok) continue;
      const data = await res.json();

      // Process topics
      for (const topic of data.topics ?? []) {
        const dateStr = topic.created_at ?? new Date().toISOString();
        if (!isWithinWindow(dateStr)) continue;

        const text = topic.title ?? "";
        if (text.length < 10) continue;

        results.push({
          id: `hf-topic-${topic.id}`,
          source: "huggingface",
          text: text + (topic.excerpt ? `\n\n${topic.excerpt}` : ""),
          author: topic.last_poster_username ?? "anonymous",
          url: `https://discuss.huggingface.co/t/${topic.slug ?? topic.id}/${topic.id}`,
          score: topic.like_count ?? 0,
          date: dateStr,
          dateConfidence: "high",
        });
      }

      // Process posts (comments)
      for (const post of data.posts ?? []) {
        if (!post.blurb) continue;
        const dateStr = post.created_at ?? new Date().toISOString();
        if (!isWithinWindow(dateStr)) continue;

        results.push({
          id: `hf-post-${post.id}`,
          source: "huggingface",
          text: post.blurb.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
          author: post.username ?? "anonymous",
          url: `https://discuss.huggingface.co/t/${post.topic_slug ?? "topic"}/${post.topic_id}/${post.post_number}`,
          score: post.like_count ?? 0,
          date: dateStr,
          dateConfidence: "high",
        });
      }
    } catch {
      // skip
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Twitter/X scraper (curated tweet IDs + syndication API) ──

// High-signal tweet IDs about fine-tuning pain points, sourced via Google X-Ray search
// Each batch covers a theme. Updated April 2026.
const CURATED_TWEET_IDS = [
  // Fine-tuning evaluation / benchmarks
  "1867884875300442257", // Rohan Paul - Ultimate Guide to Fine-Tuning LLMs
  "1824189326391197888", // YC - Empower auto fine-tuning with eval
  "1788251392555327965", // Hamel Husain - fine-tuning course w/ Axolotl/HF speakers
  "1910497498826989831", // Hyperbolic - Comparing fine-tuning frameworks
  "1773633987212120500", // Maxime Labonne - Starling-LM benchmark analysis
  "1954907702762578074", // Maryam Miradi - LLM training lifecycle steps
  // Catastrophic forgetting / regression
  "1964381652106563591", // Stone Tao - catastrophic forgetting in RL
  "2017336111010382066", // LLM Papers - FIT: Defying Catastrophic Forgetting
  "1791745016261456006", // Philipp Schmid - LoRA Learns Less and Forgets Less
  "2023291162480582834", // Tech with Mak - dirty secret of fine-tuning (forgetting)
  "1791604389678907501", // Lewis Tunstall - LoRA as regularizer vs forgetting
  "1791810329812369767", // Sebastian Raschka - LoRA forgetting analysis
  // Training cost / overhead
  "1723055765076697546", // Harper Carroll - How much does it cost to train LLM
  "1983347317341057373", // Branko - $450 to fine-tune Llama 2 on SageMaker
  "2003098731852488864", // Unsloth AI - NVIDIA fine-tuning guide
  "1995865616087908624", // QVAC - edge inference and fine-tuning
  "2042740307306123504", // AlphaSignal - fine-tune for free with Unsloth
  // LoRA / adapters / incremental
  "1712816975083155496", // Sebastian Raschka - hundreds of LoRA experiments
  "1791466251748811026", // Philipp Schmid - SFT tips for new LLM projects
  "1840780989607329807", // Philipp Schmid - fine-tune open multimodal LLMs
  "1934981020475892190", // Gökdeniz - MLX-LM-LORA with OnlineDPO
];

export async function scrapeTwitter(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];

  for (const tweetId of CURATED_TWEET_IDS) {
    try {
      const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();

      const text = data.text ?? "";
      if (text.length < 20) continue;

      const dateStr = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
      const author = data.user?.screen_name ?? "unknown";

      results.push({
        id: `twitter-${tweetId}`,
        source: "twitter",
        text,
        author,
        url: `https://x.com/${author}/status/${tweetId}`,
        score: data.favorite_count ?? 0,
        date: dateStr,
        dateConfidence: data.created_at ? "high" : "low",
      });

      await new Promise((r) => setTimeout(r, 300));
    } catch {
      // skip
    }
  }

  return results;
}

// ── Theme definitions ──

export function getDefaultThemes(): FlywheelTheme[] {
  return [
    // Phase 2: Evaluate & Verify
    {
      id: "evaluation",
      name: "Did it actually get better?",
      description: "Developers asking how to evaluate fine-tuned models — benchmarks, baseline comparison, measuring improvement",
      phase: "evaluate",
      severity: 5,
      frequency: 0,
      quotes: [],
    },
    {
      id: "data-quality",
      name: "Is my data clean?",
      description: "Training data quality issues — duplicates, mislabeling, bias, data prep friction",
      phase: "evaluate",
      severity: 4,
      frequency: 0,
      quotes: [],
    },
    {
      id: "catastrophic-forgetting",
      name: "Did fine-tuning break something?",
      description: "Catastrophic forgetting, capability regression, safety degradation after training",
      phase: "evaluate",
      severity: 5,
      frequency: 0,
      quotes: [],
    },
    // Phase 3: Iterate & Retrain
    {
      id: "retraining-triggers",
      name: "When should I retrain?",
      description: "Drift detection, staleness signals, retraining frequency decisions",
      phase: "iterate",
      severity: 4,
      frequency: 0,
      quotes: [],
    },
    {
      id: "incremental-training",
      name: "How do I update without starting over?",
      description: "Incremental training, LoRA composition, adding new data to existing model",
      phase: "iterate",
      severity: 4,
      frequency: 0,
      quotes: [],
    },
    {
      id: "version-comparison",
      name: "Which version is best?",
      description: "Model versioning, A/B comparison, rollback, experiment tracking",
      phase: "iterate",
      severity: 3,
      frequency: 0,
      quotes: [],
    },
    {
      id: "iteration-overhead",
      name: "The overhead of another training run",
      description: "Cost, pipeline complexity, data refresh pain, time-to-retrain",
      phase: "iterate",
      severity: 4,
      frequency: 0,
      quotes: [],
    },
  ];
}

// ── Theme keyword matching ──

export const THEME_KEYWORDS: Record<string, string[]> = {
  evaluation: [
    "evaluate", "evaluation", "benchmark", "eval", "how to measure",
    "baseline comparison", "perplexity", "accuracy after", "did it improve",
    "eval framework", "compare models", "quality check", "mmlu", "hellaswag",
    "rouge score", "bleu score", "human eval", "eval harness", "lm-eval",
    "how good is", "test the model", "measure quality", "eval metric",
    "validation set", "holdout", "test set performance",
  ],
  "data-quality": [
    "data quality", "mislabeled", "duplicate", "noisy data", "clean data",
    "data verification", "bad data", "label quality", "data audit",
    "data curation", "data cleaning", "dataset quality", "garbage in",
    "annotation", "labeling", "training data issue", "contamination",
    "data format", "data preparation", "data pipeline",
  ],
  "catastrophic-forgetting": [
    "catastrophic forgetting", "forgot how to", "lost capability",
    "regression", "broke", "worse at", "degraded", "forgetting",
    "worse than base", "lost ability", "capabilities reduced",
    "base model better", "ruined", "destroyed", "unlearned",
    "general capability", "instruction following worse",
  ],
  "retraining-triggers": [
    "when to retrain", "retrain frequency", "how often retrain",
    "stale model", "drift", "performance dropped", "model decay",
    "retraining schedule", "when should i", "model outdated",
    "data freshness", "concept drift", "distribution shift",
    "monitoring", "production performance", "degraded over time",
  ],
  "incremental-training": [
    "incremental", "continue training", "add data", "update model",
    "without starting over", "lora merge", "adapter composition",
    "continual learning", "resume training", "extend training",
    "add new data", "curriculum", "multi-stage", "progressive",
    "warm start", "from checkpoint",
  ],
  "version-comparison": [
    "compare versions", "a/b test", "rollback", "which model is better",
    "v1 vs v2", "model registry", "track experiments", "experiment tracking",
    "wandb", "mlflow", "model selection", "which checkpoint",
    "best checkpoint", "model comparison", "side by side",
    "previous version", "model management",
  ],
  "iteration-overhead": [
    "cost of retraining", "too expensive", "pipeline setup",
    "how long does training take", "compute cost", "data pipeline",
    "training time", "gpu hours", "training budget", "cost per run",
    "infrastructure", "overhead", "setup time", "reproduce",
    "expensive to train", "compute budget", "gpu cost",
  ],
};

// ── Analysis ──

// Posts that look like announcements/releases rather than pain points.
// Used to deboost them in quote ranking (not filter them out entirely).
const ANNOUNCEMENT_MARKERS = [
  "releases", "introducing", "launched", "announcing", "announce",
  "just shipped", "we're excited to", "im excited to", "i'm excited to",
  "happy to share", "happy to announce", "proud to announce",
  "we built", "i built", "i made", "check it out",
  "available now", "now available", "just released",
  "we compress", "we shrunk", "we reduced",
  "hey y'all", "hey everyone",
  "gguf", "are up now", "is up now",
  "week in medical ai", "week in ai",
  "i benchmarked", "we benchmarked",
];

function isAnnouncement(lower: string): boolean {
  // Only check the first 200 chars (titles/openings)
  const opening = lower.slice(0, 200);
  return ANNOUNCEMENT_MARKERS.some((m) => opening.includes(m));
}

// Posts that look like real pain points / questions.
const PAIN_POINT_MARKERS = [
  "how do i", "how do you", "how to", "why does", "why is",
  "anyone know", "anyone else", "has anyone",
  "struggling", "stuck on", "can't figure", "cannot figure",
  "having trouble", "problem with", "issue with",
  "worse than", "broke", "doesn't work", "not working",
  "advice", "seeking", "question about", "help with",
  "?", "wondering",
];

function isPainPoint(lower: string): boolean {
  const opening = lower.slice(0, 300);
  return PAIN_POINT_MARKERS.some((m) => opening.includes(m));
}

// Proximity check: theme keyword and a fine-tuning context word appear within
// `window` chars of each other. Prevents off-topic posts from matching on
// words scattered across the text.
function hasProximityMatch(lower: string, themeKws: string[], window = 150): boolean {
  // Find all positions of theme keywords and context words
  const allContextWords = [...STRONG_CONTEXT, ...WEAK_CONTEXT];

  for (const themeKw of themeKws) {
    let idx = lower.indexOf(themeKw);
    while (idx !== -1) {
      // Check if any context word appears within `window` chars
      const start = Math.max(0, idx - window);
      const end = Math.min(lower.length, idx + themeKw.length + window);
      const nearby = lower.slice(start, end);
      if (allContextWords.some((ctx) => nearby.includes(ctx))) {
        return true;
      }
      idx = lower.indexOf(themeKw, idx + 1);
    }
  }
  return false;
}

export function analyzeFeedback(raw: RawFeedback[], themes: FlywheelTheme[]): FlywheelTheme[] {
  // Collect all candidates per theme, then pick top 5 by score
  const candidatesByTheme = new Map<string, FlywheelTheme["quotes"]>();

  const updated = themes.map((t) => {
    candidatesByTheme.set(t.id, []);
    return { ...t, quotes: [] as FlywheelTheme["quotes"], frequency: 0 };
  });

  for (const feedback of raw) {
    const lower = feedback.text.toLowerCase();

    // Double-gate: must have fine-tuning context
    if (!hasFineTuneContext(lower)) continue;

    for (const theme of updated) {
      const keywords = THEME_KEYWORDS[theme.id] ?? [];
      const matches = keywords.some((kw) => lower.includes(kw));
      if (!matches) continue;

      // Proximity check: theme keyword must appear near a context word
      if (!hasProximityMatch(lower, keywords)) continue;

      theme.frequency++;
      feedback.phase = theme.phase;
      candidatesByTheme.get(theme.id)!.push({
        text: feedback.text.slice(0, 300) + (feedback.text.length > 300 ? "..." : ""),
        source: feedback.source,
        url: feedback.url,
        author: feedback.author,
        date: feedback.date,
        score: feedback.score,
      });
    }
  }

  // Pick top 5 quotes per theme — favor pain points, deboost announcements.
  // Rank = score × (2 if pain point) × (0.1 if announcement)
  for (const theme of updated) {
    const candidates = candidatesByTheme.get(theme.id) ?? [];
    const ranked = candidates.map((q) => {
      const lower = q.text.toLowerCase();
      let rank = q.score;
      if (isPainPoint(lower)) rank *= 2;
      if (isAnnouncement(lower)) rank *= 0.1;
      return { q, rank };
    });
    theme.quotes = ranked.sort((a, b) => b.rank - a.rank).slice(0, 5).map((r) => r.q);
  }

  return updated.sort((a, b) => b.severity * b.frequency - a.severity * a.frequency);
}

// ── Deduplication ──

export function deduplicateFeedback(items: RawFeedback[]): RawFeedback[] {
  const seen = new Set<string>();
  const seenText = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    // Also dedup by normalized text
    const normalizedText = item.text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 200);
    if (seenText.has(normalizedText)) return false;
    seen.add(item.id);
    seenText.add(normalizedText);
    return true;
  });
}

// ── Build full snapshot ──

export async function buildSnapshot(): Promise<AnalysisSnapshot> {
  const withTimeout = <T>(p: Promise<T>, ms: number, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

  // Scrape all sources in parallel
  // Try Pullpush first for Reddit, fall back to original Reddit API
  const [redditPullpush, hn, github, stackoverflow, huggingface, twitter] = await Promise.all([
    withTimeout(scrapeRedditPullpush(), 600000, []),
    withTimeout(scrapeHackerNews(), 60000, []),
    withTimeout(scrapeGitHubIssues(), 60000, []),
    withTimeout(scrapeStackOverflow(), 60000, []),
    withTimeout(scrapeHuggingFace(), 60000, []),
    withTimeout(scrapeTwitter(), 60000, []),
  ]);

  // If Pullpush returned 0 (rate limited), try original Reddit API
  let reddit = redditPullpush;
  if (reddit.length === 0) {
    console.log("  Pullpush returned 0, trying original Reddit API...");
    reddit = await withTimeout(scrapeReddit(), 280000, []);
  }

  const allRaw = [...reddit, ...hn, ...github, ...stackoverflow, ...huggingface, ...twitter];
  const allFeedback = deduplicateFeedback(allRaw);

  // Analyze
  const themes = analyzeFeedback(allFeedback, getDefaultThemes());

  // Phase breakdown
  let evaluateCount = 0;
  let iterateCount = 0;
  for (const theme of themes) {
    if (theme.phase === "evaluate") evaluateCount += theme.frequency;
    else iterateCount += theme.frequency;
  }

  const evalTheme = themes.find((t) => t.id === "evaluation");
  const denom = evaluateCount + iterateCount;
  const evalPct = evalTheme && denom > 0 ? Math.round((evalTheme.frequency / denom) * 100) : 0;
  const thesis =
    `Across ${allFeedback.length.toLocaleString()} public signals from fine-tuning developers, ` +
    `${evalPct}% of theme-matched feedback is about one question \u2014 \u201cdid it actually get better?\u201d ` +
    `Developers can\u2019t answer it after a fine-tuning run, so they retrain less often than they want to, ` +
    `and the flywheel stalls.`;

  const snapshot: AnalysisSnapshot = {
    lastUpdated: new Date().toISOString(),
    totalFeedback: allFeedback.length,
    sources: {
      reddit: reddit.length,
      hackernews: hn.length,
      "github-issues": github.length,
      stackoverflow: stackoverflow.length,
      huggingface: huggingface.length,
      twitter: twitter.length,
    },
    themes,
    phaseBreakdown: { evaluate: evaluateCount, iterate: iterateCount },
    thesis,
  };

  await saveRawFeedback(allFeedback);
  await saveSnapshot(snapshot);

  return snapshot;
}
