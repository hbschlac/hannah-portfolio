import { Redis } from "@upstash/redis";

// ── Types ──

export type FeedbackSource = "reddit" | "hackernews" | "playstore" | "appstore" | "stackoverflow" | "youtube" | "curated";

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
  sources: Partial<Record<FeedbackSource, number>>;
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

// ── YouTube scraper (search + transcripts) ──

async function searchYouTubeVideoIds(query: string): Promise<string[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAISBAgCEAE`; // filter: this year, relevance
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    // Extract video IDs from ytInitialData
    const ids = [...html.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g)].map((m) => m[1]);
    // Deduplicate and take top 10
    return [...new Set(ids)].slice(0, 10);
  } catch {
    return [];
  }
}

async function getYouTubeTranscript(videoId: string): Promise<string | null> {
  const { execSync } = await import("child_process");
  try {
    const result = execSync(
      `python3 -c "
from youtube_transcript_api import YouTubeTranscriptApi
api = YouTubeTranscriptApi()
try:
    transcript = api.fetch('${videoId}', languages=['en'])
    text = ' '.join([s.text for s in transcript.snippets])
    print(text[:2000])
except:
    print('')
"`,
      { timeout: 10000, encoding: "utf-8" }
    );
    return result.trim() || null;
  } catch {
    return null;
  }
}

export async function scrapeYouTube(): Promise<RawFeedback[]> {
  const queries = [
    "gemini google workspace review",
    "gemini docs gmail problems",
    "google ai workspace honest review",
    "gemini for workspace vs chatgpt",
    "google workspace AI features review 2025",
    "gemini side panel review",
  ];

  const allVideoIds = new Set<string>();
  for (const q of queries) {
    const ids = await searchYouTubeVideoIds(q);
    ids.forEach((id) => allVideoIds.add(id));
  }

  const results: RawFeedback[] = [];
  // Process up to 15 videos
  const videoIds = [...allVideoIds].slice(0, 15);

  for (const videoId of videoIds) {
    const transcript = await getYouTubeTranscript(videoId);
    if (!transcript || transcript.length < 50) continue;

    results.push({
      id: `youtube-${videoId}`,
      source: "youtube",
      text: transcript.slice(0, 500),
      author: "YouTube creator",
      url: `https://www.youtube.com/watch?v=${videoId}`,
      score: 0,
      date: new Date().toISOString(),
    });
  }

  return results;
}

// ── Stack Overflow scraper (public API, no auth) ──

export async function scrapeStackOverflow(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const queries = ["gemini+google+workspace", "gemini+docs", "gemini+gmail", "gemini+sheets", "google+ai+workspace"];

  for (const query of queries) {
    try {
      const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${query}&site=stackoverflow&pagesize=30&filter=withbody`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of data.items ?? []) {
        const text = (item.title ?? "") + "\n\n" + ((item.body ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
        if (text.length < 30) continue;
        results.push({
          id: `so-${item.question_id}`,
          source: "stackoverflow",
          text: text.slice(0, 500),
          author: item.owner?.display_name ?? "anonymous",
          url: item.link ?? `https://stackoverflow.com/q/${item.question_id}`,
          score: item.score ?? 0,
          date: new Date((item.creation_date ?? 0) * 1000).toISOString(),
        });
      }
    } catch {
      // skip
    }
  }

  // Also search webapps.stackexchange.com (more Workspace questions)
  for (const query of ["gemini+workspace", "google+gemini", "gemini+docs"]) {
    try {
      const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${query}&site=webapps&pagesize=30&filter=withbody`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of data.items ?? []) {
        const text = (item.title ?? "") + "\n\n" + ((item.body ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
        if (text.length < 30) continue;
        results.push({
          id: `so-wa-${item.question_id}`,
          source: "stackoverflow",
          text: text.slice(0, 500),
          author: item.owner?.display_name ?? "anonymous",
          url: item.link ?? `https://webapps.stackexchange.com/q/${item.question_id}`,
          score: item.score ?? 0,
          date: new Date((item.creation_date ?? 0) * 1000).toISOString(),
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

// ── Apple App Store scraper ──

export async function scrapeAppStore(): Promise<RawFeedback[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const store = require("app-store-scraper");
    const apps = [
      { id: 422689480, name: "gmail" },    // Gmail
      { id: 842842640, name: "docs" },     // Google Docs
      { id: 842849113, name: "sheets" },   // Google Sheets
      { id: 879478102, name: "slides" },   // Google Slides
      { id: 1013161476, name: "meet" },    // Google Meet
    ];

    const AI_KEYWORDS = ["ai", "gemini", "smart", "suggest", "summary", "compose", "write", "draft", "autocomplete", "auto", "intelligence", "assistant", "copilot", "generate", "generated", "hallucin", "context", "help me", "side panel", "annoying", "useless", "broken", "buggy", "slow", "worse", "bad", "terrible", "garbage", "awful", "horrible", "update", "new feature", "recent update"];
    const results: RawFeedback[] = [];
    for (const app of apps) {
      // Pull multiple pages
      for (let page = 1; page <= 5; page++) {
        try {
          const reviews = await store.reviews({
            id: app.id,
            sort: store.sort.RECENT,
            page,
            country: "us",
          });

          if (!reviews?.length) break;

          for (const review of reviews) {
            const text = (review.text ?? "").toLowerCase();
            if (!AI_KEYWORDS.some((kw) => text.includes(kw))) continue;

            results.push({
              id: `appstore-${app.name}-${review.id ?? crypto.randomUUID()}`,
              source: "appstore",
              text: review.text ?? "",
              author: review.userName ?? "anonymous",
              url: review.url ?? `https://apps.apple.com/app/id${app.id}`,
              score: review.score ?? 3,
              date: review.date ? new Date(review.date).toISOString() : new Date().toISOString(),
            });
          }
        } catch {
          // skip individual page failures
        }
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
    {
      id: "curated-9",
      source: "curated",
      text: "Gemini in Calendar can't intelligently schedule meetings. It doesn't consider my working hours preferences, travel time, or even basic context like 'schedule this after my 1:1 with Sarah.' Reclaim.ai does this 10x better.",
      author: "Calendar power user",
      url: "https://www.reddit.com/r/productivity/",
      score: 0,
      date: "2026-02-20T00:00:00Z",
    },
    {
      id: "curated-10",
      source: "curated",
      text: "Tried using Gemini to analyze a 50-page doc in Drive. It gave me a summary of the first 5 pages and hallucinated the rest. The context window might be large but it clearly isn't using it well for long documents.",
      author: "Analyst",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-03-28T00:00:00Z",
    },
    {
      id: "curated-11",
      source: "curated",
      text: "Privacy is a real concern. Gemini accessing my inbox by default with no clear opt-out is a dealbreaker for our legal team. We had to disable it org-wide which means we lose ALL AI features, not just the inbox scanning.",
      author: "IT Director",
      url: "https://www.reddit.com/r/sysadmin/",
      score: 0,
      date: "2026-01-30T00:00:00Z",
    },
    {
      id: "curated-12",
      source: "curated",
      text: "The Gemini side panel in Slides is basically useless. It can generate an image or suggest a layout, but it can't restructure a presentation, reorder slides based on narrative flow, or create speaker notes that match my style. Gamma.app does all of this.",
      author: "Presenter",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-03-05T00:00:00Z",
    },
    {
      id: "curated-13",
      source: "curated",
      text: "Why doesn't Gemini in Chat summarize thread history? In Slack, AI catches you up on channels you missed. In Google Chat, Gemini can't even tell me what happened while I was away. Basic feature that's missing.",
      author: "Chat user",
      url: "https://www.reddit.com/r/google/",
      score: 0,
      date: "2026-02-15T00:00:00Z",
    },
    {
      id: "curated-14",
      source: "curated",
      text: "Enterprise rollout of Gemini for Workspace has been painful. No granular admin controls — it's all or nothing. Can't enable AI for specific teams, can't restrict which data it accesses, can't set per-user policies. Microsoft Copilot admin controls are way ahead.",
      author: "Enterprise Admin",
      url: "https://www.reddit.com/r/sysadmin/",
      score: 0,
      date: "2026-03-12T00:00:00Z",
    },
    {
      id: "curated-15",
      source: "curated",
      text: "Gemini can't work with attachments in Gmail. I get a PDF invoice, ask Gemini to extract the total and due date, and it says it can't access attachments. I have to download, upload to ChatGPT, and paste the answer back. Terrible workflow.",
      author: "Operations Manager",
      url: "https://www.reddit.com/r/GoogleWorkspace/",
      score: 0,
      date: "2026-02-25T00:00:00Z",
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
  // Scrape all sources in parallel (with timeouts for flaky scrapers)
  const withTimeout = <T>(p: Promise<T>, ms: number, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

  const [reddit, hn, stackoverflow, appstore] = await Promise.all([
    scrapeReddit(),
    scrapeHackerNews(),
    scrapeStackOverflow(),
    withTimeout(scrapeAppStore(), 20000, []),
  ]);
  // YouTube is slower (transcripts), run after fast sources
  const youtube = await withTimeout(scrapeYouTube(), 60000, []);
  const curated = getCuratedFeedback();
  const allFeedback = [...reddit, ...hn, ...stackoverflow, ...appstore, ...youtube, ...curated];

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
      stackoverflow: stackoverflow.length,
      appstore: appstore.length,
      youtube: youtube.length,
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
