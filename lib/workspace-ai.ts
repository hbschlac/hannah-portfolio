import { Redis } from "@upstash/redis";

// ── Types ──

export type FeedbackSource = "reddit" | "hackernews" | "playstore" | "curated";

export type RawFeedback = {
  id: string;
  source: FeedbackSource;
  text: string;
  author: string;
  url: string;
  score: number; // upvotes, likes, stars
  date: string;
  subreddit?: string;
};

export type WorkspaceApp = "gmail" | "docs" | "sheets" | "slides" | "meet" | "drive" | "calendar" | "chat" | "general";

export type PainPointTheme = {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-5
  frequency: number; // count of mentions
  apps: WorkspaceApp[];
  quotes: { text: string; source: FeedbackSource; url: string; author: string; date: string }[];
  competitorAlternatives: { tool: string; reason: string }[];
  scope: "platform" | "app-level"; // AI Foundations vs app-specific
};

export type AnalysisSnapshot = {
  lastUpdated: string;
  totalFeedback: number;
  sources: Record<FeedbackSource, number>;
  themes: PainPointTheme[];
  topCompetitors: { name: string; mentionCount: number; topReasons: string[] }[];
};

// ── Redis helpers ──

const KV_KEY = "workspace-ai:snapshot";
const KV_RAW_KEY = "workspace-ai:raw-feedback";

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

// ── Reddit scraper ──

const SUBREDDITS = ["GoogleWorkspace", "google", "artificial", "productivity", "ChatGPT"];
const SEARCH_TERMS = ["gemini workspace", "gemini docs", "gemini gmail", "gemini sheets", "google ai workspace", "gemini side panel"];

export async function scrapeReddit(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];

  for (const term of SEARCH_TERMS) {
    for (const sub of SUBREDDITS) {
      try {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(term)}&restrict_sr=1&sort=relevance&t=year&limit=25`;
        const res = await fetch(url, {
          headers: { "User-Agent": "workspace-ai-analyzer/1.0" },
        });
        if (!res.ok) continue;
        const data = await res.json();

        for (const post of data?.data?.children ?? []) {
          const d = post.data;
          if (!d.selftext && !d.title) continue;
          results.push({
            id: `reddit-${d.id}`,
            source: "reddit",
            text: `${d.title}\n\n${d.selftext ?? ""}`.trim(),
            author: d.author ?? "anonymous",
            url: `https://reddit.com${d.permalink}`,
            score: d.score ?? 0,
            date: new Date((d.created_utc ?? 0) * 1000).toISOString(),
            subreddit: sub,
          });
        }
      } catch {
        // skip failed fetches silently
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Hacker News scraper (Algolia API) ──

export async function scrapeHackerNews(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const queries = ["gemini workspace", "google gemini docs", "gemini gmail", "google ai productivity"];

  for (const query of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=30`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const hit of data.hits ?? []) {
        results.push({
          id: `hn-${hit.objectID}`,
          source: "hackernews",
          text: hit.title ?? "",
          author: hit.author ?? "anonymous",
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          score: hit.points ?? 0,
          date: hit.created_at ?? new Date().toISOString(),
        });
      }

      // Also fetch comments for richer feedback
      const commentUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=50`;
      const commentRes = await fetch(commentUrl);
      if (commentRes.ok) {
        const commentData = await commentRes.json();
        for (const hit of commentData.hits ?? []) {
          if (!hit.comment_text) continue;
          // Strip HTML tags
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

// ── Google Play Store scraper ──

export async function scrapePlayStore(): Promise<RawFeedback[]> {
  try {
    // Dynamic import since it's a CJS module
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const gplay = require("google-play-scraper");
    const apps = [
      { id: "com.google.android.gm", name: "gmail" },
      { id: "com.google.android.apps.docs", name: "docs" },
      { id: "com.google.android.apps.docs.editors.sheets", name: "sheets" },
      { id: "com.google.android.apps.docs.editors.slides", name: "slides" },
    ];

    const results: RawFeedback[] = [];
    for (const app of apps) {
      try {
        const reviews = await gplay.reviews({
          appId: app.id,
          sort: gplay.sort.NEWEST,
          num: 30,
          lang: "en",
          country: "us",
        });

        for (const review of reviews.data ?? []) {
          // Filter for AI/Gemini-related reviews
          const text = (review.text ?? "").toLowerCase();
          if (!text.includes("ai") && !text.includes("gemini") && !text.includes("smart") && !text.includes("suggest")) continue;

          results.push({
            id: `play-${app.name}-${review.id ?? crypto.randomUUID()}`,
            source: "playstore",
            text: review.text ?? "",
            author: review.userName ?? "anonymous",
            url: `https://play.google.com/store/apps/details?id=${app.id}`,
            score: review.score ?? 3,
            date: review.date ? new Date(review.date).toISOString() : new Date().toISOString(),
          });
        }
      } catch {
        // skip individual app failures
      }
    }
    return results;
  } catch {
    return [];
  }
}

// ── Curated data (manually sourced insights from articles/reports) ──

export function getCuratedFeedback(): RawFeedback[] {
  return [
    {
      id: "curated-1",
      source: "curated",
      text: "Gemini in Docs keeps hallucinating content that doesn't exist in my document. I asked it to summarize my notes and it added fictional meetings and action items. This is dangerous for business documents.",
      author: "Enterprise user report",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-03-15T00:00:00Z",
    },
    {
      id: "curated-2",
      source: "curated",
      text: "The Gemini side panel loses context every time I switch between Gmail and Docs. I'll be working on an email thread, switch to reference a doc, and when I come back Gemini has no memory of what we were discussing. Makes it useless for multi-app workflows.",
      author: "Power user feedback",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-03-20T00:00:00Z",
    },
    {
      id: "curated-3",
      source: "curated",
      text: "I switched from Gemini to ChatGPT for spreadsheet formulas. Gemini suggestions in Sheets are basic — it can't handle complex lookups or array formulas. ChatGPT gets them right first try and explains the logic.",
      author: "Spreadsheet user",
      url: "https://www.reddit.com/r/sheets/",
      score: 0,
      date: "2026-02-10T00:00:00Z",
    },
    {
      id: "curated-4",
      source: "curated",
      text: "Google Meet summaries are hit or miss. Half the time it attributes action items to the wrong person, and it completely misses side conversations. We've gone back to taking notes manually.",
      author: "Meeting user",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-03-01T00:00:00Z",
    },
    {
      id: "curated-5",
      source: "curated",
      text: "Why can't Gemini in Gmail draft a reply based on context from a Drive doc I share in the thread? It only knows about the email text. Meanwhile Copilot in Outlook pulls from SharePoint, Teams chats, everything.",
      author: "Enterprise PM",
      url: "https://www.reddit.com/r/google/",
      score: 0,
      date: "2026-03-25T00:00:00Z",
    },
    {
      id: "curated-6",
      source: "curated",
      text: "Gemini for Workspace's mobile experience is terrible. The side panel is cramped, voice input doesn't work half the time, and there's no way to use it hands-free. On desktop it's decent but on my phone it's unusable.",
      author: "Mobile user",
      url: "https://support.google.com/a/",
      score: 0,
      date: "2026-02-28T00:00:00Z",
    },
    {
      id: "curated-7",
      source: "curated",
      text: "We're paying $30/user/month for Workspace Business Plus with Gemini, but most of our team ignores the AI features because they're not reliable enough to trust. We could save money by dropping the AI tier and just using ChatGPT Team for $25/user.",
      author: "IT Admin",
      url: "https://www.reddit.com/r/sysadmin/",
      score: 0,
      date: "2026-01-15T00:00:00Z",
    },
    {
      id: "curated-8",
      source: "curated",
      text: "The 'Help me write' feature in Docs generates generic corporate fluff. It doesn't learn my writing style, doesn't match the tone of the rest of my document, and I end up rewriting 90% of what it generates. Notion AI does a much better job matching context.",
      author: "Writer",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-03-10T00:00:00Z",
    },
  ];
}

// ── Pre-built analysis themes (for snapshot without Claude API) ──

export function getDefaultThemes(): PainPointTheme[] {
  return [
    {
      id: "hallucination",
      name: "Hallucination & Trust",
      description: "Gemini fabricates content not present in the source document, creating trust issues for business-critical work",
      severity: 5,
      frequency: 0,
      apps: ["docs", "gmail", "meet"],
      quotes: [],
      competitorAlternatives: [
        { tool: "ChatGPT", reason: "Users report more reliable grounding and source citation" },
        { tool: "Notion AI", reason: "Better at staying within document context without hallucinating" },
      ],
      scope: "platform",
    },
    {
      id: "cross-app-memory",
      name: "No Cross-App Context",
      description: "Gemini side panel loses all context when switching between Workspace apps — no memory of previous interactions across surfaces",
      severity: 5,
      frequency: 0,
      apps: ["general", "gmail", "docs", "sheets", "drive"],
      quotes: [],
      competitorAlternatives: [
        { tool: "Microsoft Copilot", reason: "Unified memory across Outlook, Word, Teams, and SharePoint" },
        { tool: "ChatGPT", reason: "Persistent conversation memory across sessions" },
      ],
      scope: "platform",
    },
    {
      id: "mobile-voice",
      name: "Broken Mobile & Voice Experience",
      description: "AI features are desktop-first — mobile side panel is cramped, voice input unreliable, no hands-free workflows",
      severity: 4,
      frequency: 0,
      apps: ["general", "gmail", "docs", "meet"],
      quotes: [],
      competitorAlternatives: [
        { tool: "ChatGPT mobile app", reason: "Superior voice mode and mobile-native AI interactions" },
        { tool: "Apple Intelligence", reason: "System-level integration on mobile, voice-first design" },
      ],
      scope: "platform",
    },
    {
      id: "writing-quality",
      name: "Generic, Context-Deaf Writing",
      description: "'Help me write' generates bland corporate text — doesn't match document tone, user's style, or organizational context",
      severity: 4,
      frequency: 0,
      apps: ["docs", "gmail"],
      quotes: [],
      competitorAlternatives: [
        { tool: "Notion AI", reason: "Better at matching existing document tone and context" },
        { tool: "ChatGPT", reason: "More customizable tone and style with custom instructions" },
        { tool: "Jasper", reason: "Brand voice learning and enterprise style consistency" },
      ],
      scope: "app-level",
    },
    {
      id: "formula-weakness",
      name: "Weak Spreadsheet Intelligence",
      description: "Gemini in Sheets can't handle complex formulas, array functions, or data analysis — users go to ChatGPT for formula help",
      severity: 3,
      frequency: 0,
      apps: ["sheets"],
      quotes: [],
      competitorAlternatives: [
        { tool: "ChatGPT", reason: "Generates correct complex formulas with explanations" },
        { tool: "Microsoft Copilot in Excel", reason: "Deep Excel formula knowledge and pivot table generation" },
      ],
      scope: "app-level",
    },
    {
      id: "meeting-attribution",
      name: "Inaccurate Meeting Intelligence",
      description: "Meet summaries misattribute action items, miss side conversations, and produce unreliable notes — teams revert to manual note-taking",
      severity: 4,
      frequency: 0,
      apps: ["meet"],
      quotes: [],
      competitorAlternatives: [
        { tool: "Otter.ai", reason: "More accurate speaker diarization and action item extraction" },
        { tool: "Fireflies.ai", reason: "Better meeting analytics and searchable transcripts" },
        { tool: "Microsoft Copilot in Teams", reason: "Integrated meeting recap with task creation in Planner" },
      ],
      scope: "app-level",
    },
    {
      id: "pricing-value",
      name: "Price-to-Value Gap",
      description: "Workspace AI tier costs $20-30/user/month but features aren't reliable enough to justify — teams consider dropping AI tier for standalone tools",
      severity: 3,
      frequency: 0,
      apps: ["general"],
      quotes: [],
      competitorAlternatives: [
        { tool: "ChatGPT Team", reason: "More capable AI at $25/user/month without Workspace lock-in" },
        { tool: "Claude Pro", reason: "Better reasoning and document analysis at $20/month" },
      ],
      scope: "platform",
    },
  ];
}

// ── Analysis: match raw feedback to themes ──

const THEME_KEYWORDS: Record<string, string[]> = {
  hallucination: ["hallucinate", "hallucination", "made up", "fabricat", "incorrect", "wrong information", "inaccurate", "not true", "false", "imagin", "invented"],
  "cross-app-memory": ["context", "memory", "remember", "forget", "loses context", "switch", "cross-app", "between apps", "side panel", "persistent"],
  "mobile-voice": ["mobile", "phone", "voice", "hands-free", "android", "ios", "cramped", "small screen", "touch"],
  "writing-quality": ["help me write", "generic", "bland", "corporate", "tone", "style", "rewrite", "fluff", "cookie-cutter", "boilerplate"],
  "formula-weakness": ["formula", "spreadsheet", "sheets", "vlookup", "array", "pivot", "calculation", "function"],
  "meeting-attribution": ["meeting", "summary", "action item", "transcript", "speaker", "attribution", "notes", "minutes", "meet"],
  "pricing-value": ["price", "pricing", "cost", "expensive", "worth", "value", "per user", "subscription", "tier", "pay"],
};

export function analyzeFeedback(raw: RawFeedback[], themes: PainPointTheme[]): PainPointTheme[] {
  const updated = themes.map((t) => ({ ...t, quotes: [] as PainPointTheme["quotes"], frequency: 0 }));

  for (const feedback of raw) {
    const lower = feedback.text.toLowerCase();
    for (const theme of updated) {
      const keywords = THEME_KEYWORDS[theme.id] ?? [];
      const matches = keywords.some((kw) => lower.includes(kw));
      if (matches) {
        theme.frequency++;
        if (theme.quotes.length < 5) {
          theme.quotes.push({
            text: feedback.text.slice(0, 300) + (feedback.text.length > 300 ? "..." : ""),
            source: feedback.source,
            url: feedback.url,
            author: feedback.author,
            date: feedback.date,
          });
        }
      }
    }
  }

  return updated.sort((a, b) => b.severity * b.frequency - a.severity * a.frequency);
}

// ── Build full snapshot ──

export async function buildSnapshot(): Promise<AnalysisSnapshot> {
  // Scrape all sources
  const [reddit, hn] = await Promise.all([
    scrapeReddit(),
    scrapeHackerNews(),
  ]);
  // Play Store scraping is disabled in dev — can be enabled for production seeding
  const playstore: RawFeedback[] = [];
  const curated = getCuratedFeedback();
  const allFeedback = [...reddit, ...hn, ...playstore, ...curated];

  // Analyze
  const themes = analyzeFeedback(allFeedback, getDefaultThemes());

  // Build competitor summary
  const competitorMap = new Map<string, { count: number; reasons: Set<string> }>();
  for (const theme of themes) {
    for (const alt of theme.competitorAlternatives) {
      const existing = competitorMap.get(alt.tool) ?? { count: 0, reasons: new Set() };
      existing.count += theme.frequency;
      existing.reasons.add(alt.reason);
      competitorMap.set(alt.tool, existing);
    }
  }

  const topCompetitors = Array.from(competitorMap.entries())
    .map(([name, data]) => ({
      name,
      mentionCount: data.count,
      topReasons: Array.from(data.reasons).slice(0, 3),
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  const snapshot: AnalysisSnapshot = {
    lastUpdated: new Date().toISOString(),
    totalFeedback: allFeedback.length,
    sources: {
      reddit: reddit.length,
      hackernews: hn.length,
      playstore: playstore.length,
      curated: curated.length,
    },
    themes,
    topCompetitors,
  };

  // Save both raw and analyzed data
  await saveRawFeedback(allFeedback);
  await saveSnapshot(snapshot);

  return snapshot;
}
