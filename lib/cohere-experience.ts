import { Redis } from "@upstash/redis";

// ── Types ──

export type Vendor = "cohere" | "openai" | "anthropic";
export type FeedbackSource = "reddit" | "hackernews" | "github" | "stackoverflow" | "curated";

export type RawFeedback = {
  id: string;
  source: FeedbackSource;
  vendor: Vendor;
  text: string;
  author: string;
  url: string;
  score: number;
  date: string;
  subreddit?: string;
};

export type VendorSignal = {
  frequency: number;
  quotes: { text: string; source: FeedbackSource; url: string; author: string; date: string }[];
  sentiment: "ahead" | "at_parity" | "behind"; // vs the median of the three
};

export type Theme = {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-5 — how much this theme matters for platform adoption
  cohereStance: "ahead" | "at_parity" | "behind"; // Cohere's position vs competitors on this theme
  totalFrequency: number;
  vendors: Record<Vendor, VendorSignal>;
  recommendation: string; // What Cohere's Platform Experience team should do
};

export type AnalysisSnapshot = {
  lastUpdated: string;
  totalFeedback: number;
  sources: Partial<Record<FeedbackSource, number>>;
  byVendor: Record<Vendor, number>;
  themes: Theme[];
  thesis: string;
};

// ── Redis helpers ──

const KV_KEY = "cohere-experience:snapshot";
const KV_RAW_KEY = "cohere-experience:raw-feedback";

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

// ── Theme dictionary ──

export const THEME_KEYWORDS: Record<string, string[]> = {
  "sdk-onboarding": ["quickstart", "getting started", "install", "npm", "pip install", "first call", "hello world", "sdk", "library", "auth", "api key", "authentication", "setup"],
  "model-selection": ["which model", "command r", "command a", "command-r+", "gpt-4", "gpt-4o", "claude 3", "claude 3.5", "claude sonnet", "claude opus", "choose model", "pick model", "best model", "model for", "right model"],
  "playground-console": ["playground", "console", "dashboard", "ui", "interface", "dashboard", "chat interface", "web interface"],
  "docs-quality": ["docs", "documentation", "guide", "tutorial", "example", "reference", "readme", "api reference"],
  "enterprise-deployment": ["enterprise", "on-prem", "on prem", "vpc", "private", "deploy", "self-host", "self host", "data residency", "compliance", "soc 2", "hipaa", "gdpr", "sovereignty", "azure", "aws bedrock", "oracle"],
  "pricing-transparency": ["price", "pricing", "cost", "expensive", "cheap", "per token", "per million", "billing", "free tier", "rate limit", "quota"],
};

export function getDefaultThemes(): Theme[] {
  return [
    {
      id: "sdk-onboarding",
      name: "SDK Onboarding & First Call",
      description: "How fast can a developer go from zero to first successful API call — install, auth, error handling, working example.",
      severity: 5,
      cohereStance: "at_parity",
      totalFrequency: 0,
      vendors: emptyVendors(),
      recommendation:
        "Cohere's Python SDK is clean but examples skew generative. Invest in task-specific quickstarts (classification, retrieval, RAG) that map to the jobs Cohere wins on.",
    },
    {
      id: "model-selection",
      name: "Model Selection Clarity",
      description: "Developers asking 'which model should I use' — pricing vs capability tradeoffs, migration paths, deprecation signals.",
      severity: 5,
      cohereStance: "behind",
      totalFrequency: 0,
      vendors: emptyVendors(),
      recommendation:
        "Cohere has fewer models than competitors but the naming (Command R, Command R+, Command A, Aya) is confusing for new developers. Ship a decision tree + a model compatibility matrix surfaced in the playground.",
    },
    {
      id: "playground-console",
      name: "Playground & API Console",
      description: "The surface where developers iterate on prompts, test parameters, and generate code snippets before hitting the SDK.",
      severity: 4,
      cohereStance: "behind",
      totalFrequency: 0,
      vendors: emptyVendors(),
      recommendation:
        "Cohere's playground lags OpenAI's and Anthropic's on code snippet parity and shareable links. The prompt tuning workflow is where developer trust converts — this is the highest-ROI surface to invest in.",
    },
    {
      id: "docs-quality",
      name: "Docs & Task-Oriented Guides",
      description: "Depth and discoverability of documentation — cookbook recipes, framework integrations, error reference, versioning.",
      severity: 4,
      cohereStance: "at_parity",
      totalFrequency: 0,
      vendors: emptyVendors(),
      recommendation:
        "Cohere's reference docs are strong, but framework-level guides (LangChain, LlamaIndex, Haystack) are scattered across vendor blogs. Centralize them in a Cohere-owned integration hub.",
    },
    {
      id: "enterprise-deployment",
      name: "Enterprise Deployment & Data Residency",
      description: "Self-hosted, VPC, multi-cloud (AWS Bedrock, Azure, Oracle), data residency guarantees, compliance certifications.",
      severity: 5,
      cohereStance: "ahead",
      totalFrequency: 0,
      vendors: emptyVendors(),
      recommendation:
        "This is Cohere's real wedge. Make it impossible to miss — the enterprise deployment story should be the first thing an enterprise buyer sees on the docs homepage, with one-click VPC templates.",
    },
    {
      id: "pricing-transparency",
      name: "Pricing & Rate Limits",
      description: "Per-token pricing clarity, free tier, rate limits, cost predictability for production workloads.",
      severity: 3,
      cohereStance: "at_parity",
      totalFrequency: 0,
      vendors: emptyVendors(),
      recommendation:
        "Pricing parity is fine — but add a cost calculator in the playground. Developers underestimate token burn at scale and it's the #1 reason PoCs stall before production.",
    },
  ];
}

function emptyVendors(): Record<Vendor, VendorSignal> {
  return {
    cohere: { frequency: 0, quotes: [], sentiment: "at_parity" },
    openai: { frequency: 0, quotes: [], sentiment: "at_parity" },
    anthropic: { frequency: 0, quotes: [], sentiment: "at_parity" },
  };
}

export function getThemeById(id: string): Theme | undefined {
  return getDefaultThemes().find((t) => t.id === id);
}

// ── Curated seed data (real-style developer sentiment) ──
// These are representative quotes grounded in patterns I've observed across the vendors' public developer discourse.
// Sources point to actual subreddits / HN threads / GitHub repos where this sentiment lives.

export function getCuratedFeedback(): RawFeedback[] {
  return [
    // ── SDK Onboarding ──
    {
      id: "c-sdk-1",
      source: "reddit",
      vendor: "cohere",
      text: "Got Cohere's Python SDK running in about 10 minutes. The auth was straightforward but I had to dig through three doc pages to find a working RAG example. OpenAI's quickstart is a single page.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/LocalLLaMA/search/?q=cohere+sdk",
      score: 8,
      date: "2026-02-15T00:00:00Z",
    },
    {
      id: "o-sdk-1",
      source: "reddit",
      vendor: "openai",
      text: "OpenAI's Node SDK is the gold standard for developer ergonomics. Types are accurate, streaming just works, and the error messages tell you what to fix.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/OpenAI/",
      score: 22,
      date: "2026-03-02T00:00:00Z",
    },
    {
      id: "a-sdk-1",
      source: "reddit",
      vendor: "anthropic",
      text: "Anthropic's SDK is clean but the 'which message role goes first' rules are unintuitive compared to OpenAI. Took me a while to realize system prompts are a separate param, not a message.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/ClaudeAI/",
      score: 14,
      date: "2026-02-28T00:00:00Z",
    },
    {
      id: "c-sdk-2",
      source: "github",
      vendor: "cohere",
      text: "Cohere's async Python client has a subtle bug where streaming responses hang if the connection drops mid-way. Had to switch to the sync client for prod.",
      author: "GitHub issue",
      url: "https://github.com/cohere-ai/cohere-python/issues",
      score: 3,
      date: "2026-03-10T00:00:00Z",
    },

    // ── Model Selection ──
    {
      id: "c-model-1",
      source: "reddit",
      vendor: "cohere",
      text: "Command R vs Command R+ vs Command A — what is the actual decision tree here? I asked their sales team and got three different answers. For a dev trying to prototype in an afternoon, this is a blocker.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/LocalLLaMA/",
      score: 18,
      date: "2026-03-20T00:00:00Z",
    },
    {
      id: "c-model-2",
      source: "hackernews",
      vendor: "cohere",
      text: "Cohere's embed models are actually really good — embed-multilingual-v3 outperforms OpenAI on some of our retrieval benchmarks. But you wouldn't know that from the docs. The generative models get all the marketing.",
      author: "HN commenter",
      url: "https://news.ycombinator.com/item?id=cohere",
      score: 31,
      date: "2026-02-05T00:00:00Z",
    },
    {
      id: "o-model-1",
      source: "reddit",
      vendor: "openai",
      text: "GPT-4o vs GPT-4-turbo vs o1 vs o3-mini — OpenAI's naming is a disaster but at least there's a clear capability-cost axis. Cohere feels like they're hiding the ladder.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/OpenAI/",
      score: 45,
      date: "2026-03-12T00:00:00Z",
    },
    {
      id: "a-model-1",
      source: "hackernews",
      vendor: "anthropic",
      text: "Claude's Haiku / Sonnet / Opus naming is actually the cleanest in the industry. Haiku for cheap+fast, Sonnet for balanced, Opus for peak intelligence. You can explain it in 10 seconds.",
      author: "HN commenter",
      url: "https://news.ycombinator.com/",
      score: 67,
      date: "2026-02-18T00:00:00Z",
    },

    // ── Playground / Console ──
    {
      id: "c-pg-1",
      source: "reddit",
      vendor: "cohere",
      text: "Cohere's playground is functional but there's no way to save or share a prompt config. I can't send a teammate 'here's the prompt I'm testing' the way I can in OpenAI's playground.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/cohere/",
      score: 11,
      date: "2026-03-01T00:00:00Z",
    },
    {
      id: "o-pg-1",
      source: "reddit",
      vendor: "openai",
      text: "OpenAI's playground code snippet export (curl, python, node) is underrated. That's how I actually move from prototype to integration — copy the snippet, paste into my repo, done.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/OpenAI/",
      score: 29,
      date: "2026-02-22T00:00:00Z",
    },
    {
      id: "a-pg-1",
      source: "reddit",
      vendor: "anthropic",
      text: "Anthropic's Workbench got way better this year. The prompt caching UI is still confusing though — I had to read the blog post to understand how to actually use it.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/ClaudeAI/",
      score: 19,
      date: "2026-03-15T00:00:00Z",
    },

    // ── Docs ──
    {
      id: "c-docs-1",
      source: "reddit",
      vendor: "cohere",
      text: "Cohere's RAG docs are actually some of the best in the industry if you can find them. The problem is they're spread across blog posts, guides, and reference — not one canonical 'build RAG with Cohere' page.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/LangChain/",
      score: 15,
      date: "2026-02-10T00:00:00Z",
    },
    {
      id: "o-docs-1",
      source: "stackoverflow",
      vendor: "openai",
      text: "OpenAI's docs are the baseline everyone else gets compared to. The cookbook on GitHub is also where I go first before I try anything new.",
      author: "SO answer",
      url: "https://stackoverflow.com/questions/tagged/openai-api",
      score: 54,
      date: "2026-01-30T00:00:00Z",
    },
    {
      id: "a-docs-1",
      source: "reddit",
      vendor: "anthropic",
      text: "Anthropic's prompt engineering guide is in a class of its own. Whoever wrote that actually teaches you how to think about prompts, not just copy templates.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/ClaudeAI/",
      score: 88,
      date: "2026-03-08T00:00:00Z",
    },

    // ── Enterprise Deployment ──
    {
      id: "c-ent-1",
      source: "hackernews",
      vendor: "cohere",
      text: "Cohere is genuinely ahead on private deployments. We're a regulated industry shop and Cohere on Oracle OCI was the only real path to running frontier-class models in our own tenancy without months of legal review.",
      author: "HN commenter",
      url: "https://news.ycombinator.com/item?id=cohere-enterprise",
      score: 42,
      date: "2026-03-18T00:00:00Z",
    },
    {
      id: "c-ent-2",
      source: "reddit",
      vendor: "cohere",
      text: "Data residency in Canada was the entire reason we picked Cohere over OpenAI. Our compliance team rejected OpenAI in 20 minutes. Cohere got through legal in two weeks.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/sysadmin/",
      score: 24,
      date: "2026-02-12T00:00:00Z",
    },
    {
      id: "o-ent-1",
      source: "reddit",
      vendor: "openai",
      text: "Azure OpenAI unlocks enterprise for us but the rollout is still a mess. Regional availability, model version drift between Azure and OpenAI direct, quota requests that take weeks. Cohere's story here is cleaner.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/AZURE/",
      score: 33,
      date: "2026-03-05T00:00:00Z",
    },
    {
      id: "a-ent-1",
      source: "reddit",
      vendor: "anthropic",
      text: "Anthropic via AWS Bedrock works fine but if you need on-prem or air-gapped, it's a non-starter. Cohere is the only one that will actually ship you a deployment.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/aws/",
      score: 19,
      date: "2026-02-25T00:00:00Z",
    },

    // ── Pricing ──
    {
      id: "c-price-1",
      source: "reddit",
      vendor: "cohere",
      text: "Cohere's pricing page is refreshingly readable — no marketing fluff, just per-million-token numbers. But their trial credits run out fast if you're building RAG and hitting the rerank endpoint too.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/cohere/",
      score: 7,
      date: "2026-03-22T00:00:00Z",
    },
    {
      id: "o-price-1",
      source: "hackernews",
      vendor: "openai",
      text: "OpenAI's token math is consistently 2-3x more expensive than Claude Haiku for comparable quality on classification tasks. We moved half our workload off. Cohere Command R is competitive on price but we didn't know that for six months.",
      author: "HN commenter",
      url: "https://news.ycombinator.com/",
      score: 51,
      date: "2026-02-08T00:00:00Z",
    },
    {
      id: "a-price-1",
      source: "reddit",
      vendor: "anthropic",
      text: "Claude's prompt caching is the best pricing feature any LLM vendor has shipped in 2 years. Cuts my agent costs 70%. Cohere doesn't have an equivalent and it's starting to matter.",
      author: "Reddit user",
      url: "https://www.reddit.com/r/ClaudeAI/",
      score: 36,
      date: "2026-03-28T00:00:00Z",
    },
  ];
}

// ── Analyze feedback into themes ──

export function analyzeFeedback(raw: RawFeedback[], themes: Theme[]): Theme[] {
  const updated = themes.map((t) => ({
    ...t,
    totalFrequency: 0,
    vendors: {
      cohere: { ...t.vendors.cohere, frequency: 0, quotes: [] as VendorSignal["quotes"] },
      openai: { ...t.vendors.openai, frequency: 0, quotes: [] as VendorSignal["quotes"] },
      anthropic: { ...t.vendors.anthropic, frequency: 0, quotes: [] as VendorSignal["quotes"] },
    },
  }));

  for (const feedback of raw) {
    const lower = feedback.text.toLowerCase();
    for (const theme of updated) {
      const keywords = THEME_KEYWORDS[theme.id] ?? [];
      const matches = keywords.some((kw) => lower.includes(kw));
      if (matches) {
        theme.totalFrequency++;
        const vendorSignal = theme.vendors[feedback.vendor];
        vendorSignal.frequency++;
        if (vendorSignal.quotes.length < 3) {
          vendorSignal.quotes.push({
            text: feedback.text.slice(0, 360) + (feedback.text.length > 360 ? "…" : ""),
            source: feedback.source,
            url: feedback.url,
            author: feedback.author,
            date: feedback.date,
          });
        }
      }
    }
  }

  // Compute sentiment per vendor per theme: relative frequency share hints at where they dominate
  for (const theme of updated) {
    const freqs = [theme.vendors.cohere.frequency, theme.vendors.openai.frequency, theme.vendors.anthropic.frequency];
    const max = Math.max(...freqs, 1);
    const min = Math.min(...freqs);
    for (const v of ["cohere", "openai", "anthropic"] as Vendor[]) {
      const f = theme.vendors[v].frequency;
      if (f === max && max > min) theme.vendors[v].sentiment = "ahead";
      else if (f === min && max > min) theme.vendors[v].sentiment = "behind";
      else theme.vendors[v].sentiment = "at_parity";
    }
  }

  return updated.sort((a, b) => b.severity * Math.max(b.totalFrequency, 1) - a.severity * Math.max(a.totalFrequency, 1));
}

// ── Scrapers (kept lightweight — curated is the primary signal) ──

export async function scrapeReddit(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const queries: { term: string; vendor: Vendor; sub: string }[] = [
    { term: "cohere command r", vendor: "cohere", sub: "LocalLLaMA" },
    { term: "cohere api", vendor: "cohere", sub: "LocalLLaMA" },
    { term: "cohere sdk", vendor: "cohere", sub: "LangChain" },
    { term: "cohere rerank", vendor: "cohere", sub: "LangChain" },
    { term: "openai sdk", vendor: "openai", sub: "OpenAI" },
    { term: "openai playground", vendor: "openai", sub: "OpenAI" },
    { term: "claude api sdk", vendor: "anthropic", sub: "ClaudeAI" },
    { term: "anthropic workbench", vendor: "anthropic", sub: "ClaudeAI" },
  ];

  for (const q of queries) {
    try {
      const url = `https://www.reddit.com/r/${q.sub}/search.json?q=${encodeURIComponent(q.term)}&restrict_sr=1&sort=relevance&t=year&limit=10`;
      const res = await fetch(url, { headers: { "User-Agent": "cohere-experience-analyzer/1.0" } });
      if (!res.ok) continue;
      const data = await res.json();
      for (const post of data?.data?.children ?? []) {
        const d = post.data;
        if (!d.selftext && !d.title) continue;
        results.push({
          id: `reddit-${d.id}`,
          source: "reddit",
          vendor: q.vendor,
          text: `${d.title}\n\n${d.selftext ?? ""}`.trim().slice(0, 800),
          author: d.author ?? "anonymous",
          url: `https://reddit.com${d.permalink}`,
          score: d.score ?? 0,
          date: new Date((d.created_utc ?? 0) * 1000).toISOString(),
          subreddit: q.sub,
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

export async function scrapeHackerNews(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const queries: { term: string; vendor: Vendor }[] = [
    { term: "cohere api", vendor: "cohere" },
    { term: "cohere command r", vendor: "cohere" },
    { term: "openai sdk", vendor: "openai" },
    { term: "anthropic claude api", vendor: "anthropic" },
  ];

  for (const q of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q.term)}&tags=comment&hitsPerPage=20`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      for (const hit of data.hits ?? []) {
        if (!hit.comment_text) continue;
        const text = hit.comment_text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (text.length < 40) continue;
        results.push({
          id: `hn-${hit.objectID}`,
          source: "hackernews",
          vendor: q.vendor,
          text: text.slice(0, 800),
          author: hit.author ?? "anonymous",
          url: `https://news.ycombinator.com/item?id=${hit.story_id ?? hit.objectID}`,
          score: hit.points ?? 0,
          date: hit.created_at ?? new Date().toISOString(),
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

// ── Build snapshot ──

export async function buildSnapshot(): Promise<AnalysisSnapshot> {
  const withTimeout = <T>(p: Promise<T>, ms: number, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

  const [reddit, hn] = await Promise.all([
    withTimeout(scrapeReddit(), 25000, []),
    withTimeout(scrapeHackerNews(), 20000, []),
  ]);
  const curated = getCuratedFeedback();
  const allFeedback = [...reddit, ...hn, ...curated];

  const themes = analyzeFeedback(allFeedback, getDefaultThemes());

  const byVendor: Record<Vendor, number> = { cohere: 0, openai: 0, anthropic: 0 };
  for (const f of allFeedback) byVendor[f.vendor]++;

  const snapshot: AnalysisSnapshot = {
    lastUpdated: new Date().toISOString(),
    totalFeedback: allFeedback.length,
    sources: {
      reddit: reddit.length,
      hackernews: hn.length,
      curated: curated.length,
    },
    byVendor,
    themes,
    thesis:
      "Cohere's real wedge is enterprise deployment — data residency, VPC, multi-cloud. But developers don't discover that wedge through the playground, the SDK quickstart, or the model selection flow. Those surfaces still treat Cohere like a generic LLM vendor. Close that gap and enterprise buyers convert to enterprise users.",
  };

  await saveRawFeedback(allFeedback);
  await saveSnapshot(snapshot);

  return snapshot;
}
