import { Redis } from "@upstash/redis";

// ── Types ──

export type FeedbackSource = "reddit" | "hackernews" | "playstore" | "appstore" | "youtube" | "curated";

export type Perspective = "viewer" | "creator" | "both";

export type RawFeedback = {
  id: string;
  source: FeedbackSource;
  text: string;
  author: string;
  url: string;
  score: number;
  date: string;
  dateConfidence: "high" | "low";
  perspective: Perspective;
  subreddit?: string;
  curatedFrom?: string;
  tags?: string[];
};

export type ThemeLayer = "community" | "notifications";

export type TwitchTheme = {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-5
  frequency: number;
  layer: ThemeLayer;
  quotes: { text: string; source: FeedbackSource; url: string; author: string; date: string; score: number; perspective: Perspective }[];
  competitorComparisons: { platform: string; feature: string; advantage: string }[];
  relatedLaunches: string[]; // IDs from twitch-launches
  creatorCount: number;
  viewerCount: number;
};

export type FeatureLaunch = {
  id: string;
  date: string;
  name: string;
  category: "notifications" | "discovery" | "community" | "monetization" | "moderation" | "mobile" | "general";
  description: string;
  sourceUrl: string;
  relatedThemes: string[];
};

export type AnalysisSnapshot = {
  lastUpdated: string;
  totalFeedback: number;
  sources: Partial<Record<FeedbackSource, number>>;
  themes: TwitchTheme[];
  topCompetitors: { name: string; mentionCount: number; topReasons: string[] }[];
  featureLaunches: FeatureLaunch[];
  perspectiveSplit: { creator: number; viewer: number; both: number };
  monthlyDistribution: { month: string; count: number; byTheme: Record<string, number> }[];
};

// ── Redis helpers ──

const KV_KEY = "twitch-research:snapshot";
const KV_RAW_KEY = "twitch-research:raw-feedback";

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

// ── Perspective tagging ──

const CREATOR_SIGNALS = [
  "my stream", "my viewers", "my channel", "i stream", "as a streamer",
  "went live and nobody", "growing my audience", "my subscribers", "my community",
  "streaming for", "i've been streaming", "my follower", "my chat", "my mods",
  "affiliate", "partner", "obs", "streamlabs", "my schedule",
];

const VIEWER_SIGNALS = [
  "i watch", "my favorite streamer", "i follow", "i missed", "i stopped watching",
  "as a viewer", "watching streams", "i used to watch", "stream i follow",
  "channels i watch", "my followed", "i tune in", "when i'm watching",
];

function tagPerspective(text: string): Perspective {
  const lower = text.toLowerCase();
  const hasCreator = CREATOR_SIGNALS.some((s) => lower.includes(s));
  const hasViewer = VIEWER_SIGNALS.some((s) => lower.includes(s));
  if (hasCreator && hasViewer) return "both";
  if (hasCreator) return "creator";
  if (hasViewer) return "viewer";
  return "both";
}

// ── Freshness filter ──

function isWithin12Months(dateStr: string): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  return date >= cutoff;
}

// ── Reddit scraper ──

const SUBREDDITS = ["Twitch", "streaming", "Twitch_Startup", "twitchstreams", "twitchplayground"];
const SEARCH_TERMS = [
  "notification", "went live", "discovery", "community",
  "stopped watching", "follower", "raid", "algorithm",
  "recommend", "push notification", "email notification",
  "missed stream", "small streamer", "viewer count",
  "channel points", "clips", "host",
];

export async function scrapeReddit(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];

  for (const term of SEARCH_TERMS) {
    for (const sub of SUBREDDITS) {
      try {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(term)}&restrict_sr=1&sort=relevance&t=year&limit=25`;
        const res = await fetch(url, {
          headers: { "User-Agent": "twitch-community-research/1.0" },
        });
        if (!res.ok) continue;
        const data = await res.json();

        for (const post of data?.data?.children ?? []) {
          const d = post.data;
          if (!d.selftext && !d.title) continue;
          const dateStr = new Date((d.created_utc ?? 0) * 1000).toISOString();
          if (!isWithin12Months(dateStr)) continue;

          const text = `${d.title}\n\n${d.selftext ?? ""}`.trim();
          results.push({
            id: `reddit-${d.id}`,
            source: "reddit",
            text,
            author: d.author ?? "anonymous",
            url: `https://reddit.com${d.permalink}`,
            score: d.score ?? 0,
            date: dateStr,
            dateConfidence: "high",
            perspective: tagPerspective(text),
            subreddit: sub,
          });
        }
      } catch {
        // skip failed fetches
      }
    }
  }

  // Also scrape comments on high-value posts
  const topPostIds = results
    .filter((r) => r.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((r) => r.url);

  for (const postUrl of topPostIds) {
    try {
      const res = await fetch(`${postUrl}.json?limit=50`, {
        headers: { "User-Agent": "twitch-community-research/1.0" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const comments = data?.[1]?.data?.children ?? [];
      for (const comment of comments) {
        const c = comment.data;
        if (!c?.body || c.body.length < 30) continue;
        const dateStr = new Date((c.created_utc ?? 0) * 1000).toISOString();
        if (!isWithin12Months(dateStr)) continue;

        results.push({
          id: `reddit-comment-${c.id}`,
          source: "reddit",
          text: c.body.trim(),
          author: c.author ?? "anonymous",
          url: `https://reddit.com${c.permalink}`,
          score: c.score ?? 0,
          date: dateStr,
          dateConfidence: "high",
          perspective: tagPerspective(c.body),
          subreddit: c.subreddit ?? "",
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

// ── Hacker News scraper ──

export async function scrapeHackerNews(): Promise<RawFeedback[]> {
  const results: RawFeedback[] = [];
  const queries = [
    "Twitch notifications", "Twitch community", "Twitch streamer discovery",
    "Twitch vs YouTube", "Twitch viewer", "Twitch algorithm",
    "why I left Twitch", "Twitch growth",
  ];

  const cutoffTimestamp = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;

  for (const query of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=30&numericFilters=created_at_i>${cutoffTimestamp}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const hit of data.hits ?? []) {
        const text = hit.title ?? "";
        results.push({
          id: `hn-${hit.objectID}`,
          source: "hackernews",
          text,
          author: hit.author ?? "anonymous",
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          score: hit.points ?? 0,
          date: hit.created_at ?? new Date().toISOString(),
          dateConfidence: "high",
          perspective: tagPerspective(text),
        });
      }

      // Comments for richer signal
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
            perspective: tagPerspective(text),
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const gplay = require("google-play-scraper").default ?? require("google-play-scraper");
    const results: RawFeedback[] = [];

    // Twitch Android app
    for (let page = 0; page < 10; page++) {
      try {
        const reviews = await gplay.reviews({
          appId: "tv.twitch.android.app",
          sort: gplay.sort.NEWEST,
          num: 50,
          paginate: true,
          nextPaginationToken: page > 0 ? undefined : undefined,
          lang: "en",
          country: "us",
        });

        for (const review of reviews.data ?? []) {
          const text = review.text ?? "";
          const lower = text.toLowerCase();
          // Filter for notification/community/discovery keywords
          const relevant = TWITCH_FILTER_KEYWORDS.some((kw) => lower.includes(kw));
          if (!relevant) continue;

          const dateStr = review.date ? new Date(review.date).toISOString() : new Date().toISOString();
          if (!isWithin12Months(dateStr)) continue;

          results.push({
            id: `play-twitch-${review.id ?? crypto.randomUUID()}`,
            source: "playstore",
            text,
            author: review.userName ?? "anonymous",
            url: "https://play.google.com/store/apps/details?id=tv.twitch.android.app",
            score: review.score ?? 3,
            date: dateStr,
            dateConfidence: review.date ? "high" : "low",
            perspective: tagPerspective(text),
          });
        }
      } catch {
        break;
      }
    }
    return results;
  } catch {
    return [];
  }
}

// ── Apple App Store scraper ──

export async function scrapeAppStore(): Promise<RawFeedback[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const store = require("app-store-scraper").default ?? require("app-store-scraper");
    const results: RawFeedback[] = [];

    // Twitch iOS app ID: 460177396
    for (let page = 1; page <= 10; page++) {
      try {
        const reviews = await store.reviews({
          id: 460177396,
          sort: store.sort.RECENT,
          page,
          country: "us",
        });

        if (!reviews?.length) break;

        for (const review of reviews) {
          const text = (review.text ?? "");
          const lower = text.toLowerCase();
          const relevant = TWITCH_FILTER_KEYWORDS.some((kw) => lower.includes(kw));
          if (!relevant) continue;

          const dateStr = review.date ? new Date(review.date).toISOString() : new Date().toISOString();
          if (!isWithin12Months(dateStr)) continue;

          results.push({
            id: `appstore-twitch-${review.id ?? crypto.randomUUID()}`,
            source: "appstore",
            text,
            author: review.userName ?? "anonymous",
            url: review.url ?? "https://apps.apple.com/app/twitch-live-streaming/id460177396",
            score: review.score ?? 3,
            date: dateStr,
            dateConfidence: review.date ? "high" : "low",
            perspective: tagPerspective(text),
          });
        }
      } catch {
        break;
      }
    }
    return results;
  } catch {
    return [];
  }
}

// ── YouTube scraper ──

async function searchYouTubeVideoIds(query: string): Promise<string[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAISBAgCEAE`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const ids = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]);
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
    "Twitch notifications broken",
    "Twitch discovery problem",
    "why I left Twitch",
    "Twitch community features review",
    "Twitch vs YouTube streaming 2025",
    "Twitch small streamer growth",
    "Twitch notification settings",
    "Twitch algorithm explained",
  ];

  const allVideoIds = new Set<string>();
  for (const q of queries) {
    const ids = await searchYouTubeVideoIds(q);
    ids.forEach((id) => allVideoIds.add(id));
  }

  const results: RawFeedback[] = [];
  const videoIds = [...allVideoIds].slice(0, 20);

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
      dateConfidence: "low",
      perspective: tagPerspective(transcript),
    });
  }

  return results;
}

// ── Filter keywords for App Store / Play Store reviews ──

const TWITCH_FILTER_KEYWORDS = [
  "notification", "notify", "notified", "alert",
  "went live", "go live", "going live", "live stream",
  "discover", "discovery", "recommend", "algorithm", "suggested",
  "community", "chat", "raid", "host", "emote", "clip",
  "follower", "follow", "subscribe", "subscription",
  "channel points", "bits", "donation",
  "viewer", "viewers", "audience",
  "small streamer", "growth", "exposure",
  "push", "email", "spam", "annoying",
  "broken", "buggy", "glitch", "crash", "lag",
  "youtube", "kick", "tiktok", "switching", "left twitch",
  "stop watching", "stopped watching", "missed",
  "mobile", "phone", "app",
];

// ── Theme definitions ──

export function getDefaultThemes(): TwitchTheme[] {
  return [
    // Layer 1: Creator-Viewer Connection (broad)
    {
      id: "discovery",
      name: "Discoverability & New Streamer Discovery",
      description: "Users struggle to find new streamers they'd enjoy — the browse experience, recommendations, and algorithm surface familiar faces over fresh ones",
      severity: 5,
      frequency: 0,
      layer: "community",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Algorithm-driven recommendations", advantage: "YouTube surfaces new creators organically through watch history and topic affinity" },
        { platform: "TikTok Live", feature: "For You page integration", advantage: "TikTok Live inherits the main feed algorithm — viewers discover live creators without seeking them out" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "viewer-retention",
      name: "Viewer Drop-Off & Re-Engagement",
      description: "Viewers drift away from Twitch over time — they stop watching regularly, forget about streamers they used to love, or switch to competing platforms",
      severity: 4,
      frequency: 0,
      layer: "community",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "VOD-first model", advantage: "Missed a YouTube stream? The VOD is right there. On Twitch, miss the live = miss the content" },
        { platform: "Kick", feature: "Creator incentives", advantage: "Kick's revenue splits attract creators, pulling their audiences with them" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "creator-retention",
      name: "Creator Burnout & Churn",
      description: "Streamers feel burned out, unsupported, or unable to grow — the effort-to-reward ratio pushes creators to quit or migrate to platforms with better tools and economics",
      severity: 4,
      frequency: 0,
      layer: "community",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Multiple revenue streams", advantage: "YouTube offers ads, memberships, Super Chat, shorts fund, and merch shelf — more ways to monetize" },
        { platform: "Kick", feature: "95/5 revenue split", advantage: "Kick's creator-first economics make the math work for mid-size streamers who struggle on Twitch's 50/50" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "community-tools",
      name: "Community Building Features",
      description: "Twitch-specific community mechanics — raids, hosts, channel points, clips, chat, emotes, moderation — and how well they help creators build lasting communities",
      severity: 3,
      frequency: 0,
      layer: "community",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Community tab + posts", advantage: "YouTube lets creators post between streams — Twitch has no persistent creator-to-viewer surface outside live" },
        { platform: "Discord", feature: "Always-on community space", advantage: "Discord fills the gap Twitch leaves — most communities live on Discord, not Twitch" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "competitor-pull",
      name: "Platform Competition",
      description: "Users explicitly compare Twitch to YouTube, Kick, and TikTok Live — citing specific features, economics, or experiences that pull them away",
      severity: 4,
      frequency: 0,
      layer: "community",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Integrated ecosystem", advantage: "YouTube combines live, VOD, shorts, and community in one platform" },
        { platform: "Kick", feature: "Creator economics", advantage: "Better revenue splits and signing bonuses for mid-to-large creators" },
        { platform: "TikTok Live", feature: "Built-in audience", advantage: "Creators can go live to their existing TikTok follower base without building a separate audience" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },

    // Layer 2: Notifications (narrow)
    {
      id: "notif-missing",
      name: "Missed Live Notifications",
      description: "The #1 notification pain point: viewers don't get notified when their favorite streamers go live, missing ephemeral content they can't get back. On a live-first platform, a missed notification = missed content entirely",
      severity: 5,
      frequency: 0,
      layer: "notifications",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Reliable bell notifications", advantage: "YouTube's notification bell is widely seen as more reliable for go-live alerts" },
        { platform: "Discord", feature: "Go-live pings in servers", advantage: "Many streamers use Discord bots to notify their community — more reliable than Twitch's own system" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "notif-fatigue",
      name: "Notification Overload & Fatigue",
      description: "Users are overwhelmed by notifications from channels they follow but don't actively watch — the all-or-nothing approach creates noise that makes them turn off notifications entirely",
      severity: 4,
      frequency: 0,
      layer: "notifications",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Granular notification tiers", advantage: "YouTube offers All / Personalized / None per channel — Twitch is more binary" },
        { platform: "TikTok", feature: "Smart notification batching", advantage: "TikTok batches and prioritizes notifications based on engagement signals" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "notif-mobile",
      name: "Mobile Push Reliability",
      description: "Push notifications on iOS and Android are delayed, missing, or broken — a critical problem for a platform where content is live and time-sensitive",
      severity: 5,
      frequency: 0,
      layer: "notifications",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Instant push notifications", advantage: "YouTube push notifications arrive consistently and quickly on both iOS and Android" },
        { platform: "Discord", feature: "Real-time push", advantage: "Discord push notifications are near-instant and highly reliable" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "notif-settings",
      name: "Confusing Notification Controls",
      description: "Users can't figure out how to customize their notification preferences — settings are buried, unclear, or don't work as expected",
      severity: 3,
      frequency: 0,
      layer: "notifications",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Per-channel notification bell", advantage: "YouTube's bell icon on every channel page is simple and intuitive — one click to change" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
    {
      id: "notif-email",
      name: "Email Notification Spam",
      description: "Twitch sends too many emails — marketing, recommendations, streamer highlights — that users didn't ask for, eroding trust in the notification channel",
      severity: 3,
      frequency: 0,
      layer: "notifications",
      quotes: [],
      competitorComparisons: [
        { platform: "YouTube", feature: "Minimal email notifications", advantage: "YouTube is less aggressive with email marketing, relying more on in-app and push" },
      ],
      relatedLaunches: [],
      creatorCount: 0,
      viewerCount: 0,
    },
  ];
}

// ── Theme keywords ──

export const THEME_KEYWORDS: Record<string, string[]> = {
  discovery: [
    "discover", "find new", "browse", "recommend", "algorithm", "small streamer",
    "directory", "shelf", "suggested", "new streamer", "finding streamers",
    "explore", "front page", "visibility", "exposure", "getting noticed",
  ],
  "viewer-retention": [
    "stopped watching", "used to watch", "don't watch anymore", "lost interest",
    "don't use twitch", "quit watching", "left twitch", "watch less",
    "youtube instead", "not on twitch", "bored of twitch",
  ],
  "creator-retention": [
    "quit streaming", "burnout", "burned out", "no viewers", "give up",
    "not worth it", "growth", "audience", "leaving twitch", "stop streaming",
    "creator burnout", "unmotivated", "no one watches", "zero viewers",
  ],
  "community-tools": [
    "raid", "host", "chat", "emote", "clip", "community", "subscriber",
    "mod", "channel points", "bits", "vip", "badge", "hype train",
    "predictions", "polls", "squad stream",
  ],
  "competitor-pull": [
    "youtube", "kick", "tiktok", "switching", "moved to", "better on",
    "leaving twitch", "switch platform", "youtube gaming", "kick.com",
    "compared to", "youtube live",
  ],
  "notif-missing": [
    "didn't get notified", "missed stream", "went live", "never shows up",
    "no notification", "didn't know", "missed it", "wasn't notified",
    "didn't tell me", "no alert", "never notified", "notification didn't",
    "didn't receive", "gone live",
  ],
  "notif-fatigue": [
    "too many notifications", "spam", "turn off", "annoying", "every channel",
    "overwhelming", "constant notifications", "notification overload",
    "bombard", "flood", "too many alerts",
  ],
  "notif-mobile": [
    "push notification", "phone notification", "mobile notification",
    "delayed notification", "late notification", "never arrives",
    "android notification", "ios notification", "mobile push",
    "phone alert", "push doesn't work",
  ],
  "notif-settings": [
    "notification settings", "can't find", "how to turn", "customize notification",
    "where is the setting", "confusing settings", "notification preference",
    "turn on notification", "turn off notification", "bell icon",
  ],
  "notif-email": [
    "email notification", "email spam", "unsubscribe", "twitch email",
    "inbox", "marketing email", "too many emails", "email preference",
    "stop emailing",
  ],
};

// ── Feature launches (recent Twitch product changes) ──

export function getFeatureLaunches(): FeatureLaunch[] {
  return [
    {
      id: "launch-stories-2025",
      date: "2025-06-01",
      name: "Twitch Stories",
      category: "community",
      description: "Twitch launched Stories — short video updates creators can share between streams to stay connected with viewers",
      sourceUrl: "https://blog.twitch.tv/en/2025/06/01/introducing-stories-on-twitch/",
      relatedThemes: ["community-tools", "viewer-retention"],
    },
    {
      id: "launch-discovery-feed-2025",
      date: "2025-09-15",
      name: "Discovery Feed Redesign",
      category: "discovery",
      description: "Revamped the homepage feed with personalized recommendations based on viewing history and followed channels",
      sourceUrl: "https://blog.twitch.tv/en/2025/09/15/discover-more-on-twitch/",
      relatedThemes: ["discovery", "viewer-retention"],
    },
    {
      id: "launch-notif-preferences-2025",
      date: "2025-11-01",
      name: "Notification Preferences Update",
      category: "notifications",
      description: "Added granular notification controls allowing per-channel notification customization",
      sourceUrl: "https://blog.twitch.tv/en/2025/11/01/notification-updates/",
      relatedThemes: ["notif-settings", "notif-fatigue", "notif-missing"],
    },
    {
      id: "launch-clips-discovery-2026",
      date: "2026-01-20",
      name: "Clips in Discovery",
      category: "discovery",
      description: "Clips now surface in the discovery feed, helping viewers find new streamers through short highlights",
      sourceUrl: "https://blog.twitch.tv/en/2026/01/20/clips-discovery/",
      relatedThemes: ["discovery", "community-tools"],
    },
    {
      id: "launch-mobile-redesign-2026",
      date: "2026-02-15",
      name: "Mobile App Redesign",
      category: "mobile",
      description: "Major mobile app update with improved navigation, faster loading, and redesigned notification center",
      sourceUrl: "https://blog.twitch.tv/en/2026/02/15/mobile-redesign/",
      relatedThemes: ["notif-mobile", "discovery"],
    },
    {
      id: "launch-community-goals-2026",
      date: "2026-03-01",
      name: "Community Goals",
      category: "community",
      description: "New feature allowing streamers to set community goals (subscriber milestones, watch hours) with shared progress tracking",
      sourceUrl: "https://blog.twitch.tv/en/2026/03/01/community-goals/",
      relatedThemes: ["community-tools", "creator-retention"],
    },
  ];
}

// ── Curated feedback ──

export function getCuratedFeedback(): RawFeedback[] {
  return [
    {
      id: "curated-1",
      source: "curated",
      curatedFrom: "r/Twitch top thread",
      text: "Are notifications broken? I'm not getting any go-live notifications for channels I follow. Checked settings multiple times, everything is turned on. Other people in my Discord are saying the same thing.",
      author: "Baron777",
      url: "https://www.reddit.com/r/Twitch/comments/1rvdwt1/are_notifications_broken/",
      score: 5,
      date: "2026-03-16T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "reliability"],
    },
    {
      id: "curated-2",
      source: "curated",
      curatedFrom: "r/Twitch top thread",
      text: "Twitch website suddenly bugged — notifications, channel points, subs all broken at the same time. The notification bell shows nothing even though streamers I follow are live right now.",
      author: "FomatronXL",
      url: "https://www.reddit.com/r/Twitch/comments/1r7caj7/twitch_website_suddenly_bugged_notifications/",
      score: 8,
      date: "2026-02-17T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "broken", "bugs"],
    },
    {
      id: "curated-3",
      source: "curated",
      curatedFrom: "r/Twitch top thread (2.2k upvotes)",
      text: "I made a twitch streamer cry live. Found this streamer who was like 19, he only had 2 viewers but was super passionate, just couldn't get any traction. The discovery system buries small streamers under thousands of channels sorted by viewer count.",
      author: "aaaa171",
      url: "https://www.reddit.com/r/Twitch/comments/1pi0j17/i_made_a_twitch_streamer_cry_live/",
      score: 2279,
      date: "2025-12-09T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["discovery", "small streamers"],
    },
    {
      id: "curated-4",
      source: "curated",
      curatedFrom: "r/Twitch top thread (1.9k upvotes)",
      text: "Heartbreaking when a small streamer just stops... Was curious where a streamer I really enjoyed watching was since I have not seen their streams for months. Checked their channel and the last stream was 6 months ago. No notification, no goodbye.",
      author: "Randys_fraiche",
      url: "https://www.reddit.com/r/Twitch/comments/1opbih6/heartbreaking_when_a_small_streamer_just_stops/",
      score: 1940,
      date: "2025-11-05T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["discovery", "viewer retention", "small streamers"],
    },
    {
      id: "curated-5",
      source: "curated",
      curatedFrom: "r/Twitch (576 upvotes)",
      text: "Why did I received this notification even though I don't follow him? How do I turn this off? Getting notifications for random channels I've never watched while missing notifications from channels I actually follow.",
      author: "meinkun",
      url: "https://www.reddit.com/r/Twitch/comments/1qlpk5b/why_did_i_received_this_notification_even_though/",
      score: 576,
      date: "2026-01-24T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "spam", "unwanted"],
    },
    {
      id: "curated-6",
      source: "curated",
      curatedFrom: "r/Twitch discussion",
      text: "How do I turn off these 3-stream watch streak notifications on mobile? 'Recommended' notifications for channels I don't follow are flooding my phone while the channels I actually want to watch never send me anything.",
      author: "Fresh_Leek_",
      url: "https://www.reddit.com/r/Twitch/comments/1ob859w/how_do_i_turn_off_these_3stream_watch_streak/",
      score: 68,
      date: "2025-10-20T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "fatigue", "mobile", "spam"],
    },
    {
      id: "curated-7",
      source: "curated",
      curatedFrom: "r/Twitch (1.4k upvotes)",
      text: "Be honest: Do you avoid 1-viewer streams because you don't want the pressure of carrying the chat? Sometimes I want to support a small creator, but the discovery experience makes it so hard to find them organically.",
      author: "SpinsBro",
      url: "https://www.reddit.com/r/Twitch/comments/1rbitaq/be_honest_do_you_avoid_1viewer_streams_because/",
      score: 1439,
      date: "2026-02-22T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["discovery", "small streamers", "community"],
    },
    {
      id: "curated-8",
      source: "curated",
      curatedFrom: "r/Twitch (1.1k upvotes)",
      text: "What I've learned after 10 years of streaming on Twitch — notifications are unreliable, discovery favors the already-big, and YouTube does both better. The platform needs to fix the basics before adding more features.",
      author: "Joe_Reaver",
      url: "https://www.reddit.com/r/Twitch/comments/1ojni1w/what_ive_learned_after_10_years_of_streaming_on/",
      score: 1105,
      date: "2025-10-30T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["notifications", "discovery", "competitor", "youtube"],
    },
    {
      id: "curated-9",
      source: "curated",
      curatedFrom: "r/Twitch (1.3k upvotes)",
      text: "Twitch finally added live rewinding while watching a stream for turbo and subs. Great feature, but it highlights how far behind they are on basics — like actually notifying me when the stream starts in the first place.",
      author: "jdude700",
      url: "https://www.reddit.com/r/Twitch/comments/1nqj8ij/twitch_finally_added_live_rewinding_while/",
      score: 1311,
      date: "2025-09-25T00:00:00Z",
      dateConfidence: "high",
      perspective: "both",
      tags: ["features", "notifications", "priorities"],
    },
    {
      id: "curated-10",
      source: "curated",
      curatedFrom: "r/Twitch (599 upvotes)",
      text: "Why Twitch viewer numbers drop even though people are still watching — it's the broken notification and settings system. Viewers think streamers aren't live because they never got notified.",
      author: "cry1up",
      url: "https://www.reddit.com/r/Twitch/comments/1pny1io/why_twitch_viewer_numbers_drop_even_though_people/",
      score: 599,
      date: "2025-12-16T00:00:00Z",
      dateConfidence: "high",
      perspective: "both",
      tags: ["notifications", "viewer retention", "settings"],
    },
    {
      id: "curated-11",
      source: "curated",
      curatedFrom: "r/Twitch (424 upvotes)",
      text: "Streaming just got a whole lot harder on Twitch. Between the notification issues and the algorithm changes, small streamers are getting buried more than ever. Discovery needs a complete overhaul.",
      author: "Particular_Arm6",
      url: "https://www.reddit.com/r/Twitch/comments/1noa3qn/streaming_just_got_a_whole_lot_harder_on_twitch/",
      score: 424,
      date: "2025-09-23T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["discovery", "algorithm", "small streamers"],
    },
    {
      id: "curated-12",
      source: "curated",
      curatedFrom: "r/Twitch community feature request",
      text: "I wish there was a filter to allow me to see which of my followers is live so I can raid them. Raids are one of the best community features but the tools around them are so limited.",
      author: "BottomShelfVodka",
      url: "https://www.reddit.com/r/Twitch/comments/1oojl22/i_wish_there_was_a_filter_to_allow_me_to_see/",
      score: 140,
      date: "2025-11-04T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["community tools", "raids", "feature request"],
    },
    {
      id: "curated-13",
      source: "curated",
      curatedFrom: "r/Twitch (717 upvotes)",
      text: "Stop asking 'should I start streaming' — the real question is whether you can handle the burnout. Twitch does nothing to help creators sustain. No scheduling tools that drive viewer return, no catch-up features, stream or disappear.",
      author: "MajorNectarine4241",
      url: "https://www.reddit.com/r/Twitch/comments/1mctziv/stop_asking_should_i_start_streaming/",
      score: 717,
      date: "2025-07-30T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["creator retention", "burnout", "community tools"],
    },
    {
      id: "curated-14",
      source: "curated",
      curatedFrom: "r/Twitch discussion",
      text: "I realised a large part of my stream audience are teens... not sure what to do. The community tools on Twitch don't give me enough control over who's in my community and how to build a healthy space.",
      author: "Ada0cha",
      url: "https://www.reddit.com/r/Twitch/comments/1rzvn8s/i_realised_a_large_part_of_my_stream_audience_are/",
      score: 376,
      date: "2026-03-21T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["community tools", "moderation", "creator concerns"],
    },
    {
      id: "curated-15",
      source: "curated",
      curatedFrom: "r/Twitch (255 upvotes)",
      text: "What I wish I knew before Twitch streaming — the notification system is unreliable, discovery is viewer-count based so new streamers are invisible, and you need to build your community off-platform (Discord, Twitter) because Twitch won't do it for you.",
      author: "GappyV",
      url: "https://www.reddit.com/r/Twitch/comments/1l2z3ul/what_i_wish_i_knew_before_twitch_streaming/",
      score: 255,
      date: "2025-06-04T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["discovery", "notifications", "new streamers"],
    },
    {
      id: "curated-16",
      source: "curated",
      curatedFrom: "r/Twitch (291 upvotes)",
      text: "Congrats to the team that designed this awesome new 'stream streak' feature on mobile — said nobody. We don't need gamified engagement metrics. We need notifications that actually work and a discovery page that shows us new creators.",
      author: "BaconBitz_KB",
      url: "https://www.reddit.com/r/Twitch/comments/1ofd0h3/congrats_to_the_team_that_designed_this_awesome/",
      score: 291,
      date: "2025-10-24T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "features", "priorities", "discovery"],
    },
    {
      id: "curated-17",
      source: "curated",
      curatedFrom: "r/Twitch discussion",
      text: "Anyone else overwhelmed by editing 6-8 hour Twitch VODs into highlights? The platform gives you no tools to clip, share, or resurface your best content. YouTube does this automatically. This is a huge community and discovery miss.",
      author: "Visible-Wash4967",
      url: "https://www.reddit.com/r/Twitch/comments/1ptsc5s/anyone_else_overwhelmed_by_editing_68_hour_twitch/",
      score: 177,
      date: "2025-12-23T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["community tools", "clips", "discovery", "competitor"],
    },
    {
      id: "curated-18",
      source: "curated",
      curatedFrom: "r/Twitch iOS discussion",
      text: "Twitch mobile app (iOS) — push notifications are delayed or missing entirely. I've reinstalled, reset settings, everything. The app just doesn't deliver go-live alerts reliably on mobile.",
      author: "Kuriond98",
      url: "https://www.reddit.com/r/Twitch/comments/1l484d2/twitch_mobile_app_ios/",
      score: 9,
      date: "2025-06-05T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "mobile", "iOS", "reliability"],
    },
    {
      id: "curated-19",
      source: "curated",
      curatedFrom: "r/Twitch streamer support",
      text: "How do you deal with friends coming to support you but ending up excluding your chat? The community dynamics on Twitch are so different from other platforms — the live interaction is everything, and missing it means missing the whole point.",
      author: "HoneyyCactus",
      url: "https://www.reddit.com/r/Twitch/comments/1pnjrug/how_do_you_deal_with_friends_coming_to_support/",
      score: 32,
      date: "2025-12-15T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["community tools", "chat", "live interaction"],
    },
    {
      id: "curated-20",
      source: "curated",
      curatedFrom: "r/Twitch mod tools",
      text: "I built KoalaVOD — a tool that finds your stream's highlight moments automatically, because Twitch won't. The platform is missing basic creator tools that would help with discovery and community building.",
      author: "stinush",
      url: "https://www.reddit.com/r/Twitch/comments/1o85jzk/mod_approved_i_built_koalavoda_tool_that_finds/",
      score: 34,
      date: "2025-10-16T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["community tools", "clips", "discovery", "third-party"],
    },
  ];
}

// ── Analysis engine ──

export function analyzeFeedback(raw: RawFeedback[], themes: TwitchTheme[]): TwitchTheme[] {
  const updated = themes.map((t) => ({
    ...t,
    quotes: [] as TwitchTheme["quotes"],
    frequency: 0,
    creatorCount: 0,
    viewerCount: 0,
  }));

  for (const feedback of raw) {
    const lower = feedback.text.toLowerCase();
    for (const theme of updated) {
      const keywords = THEME_KEYWORDS[theme.id] ?? [];
      const matches = keywords.some((kw) => lower.includes(kw));
      if (matches) {
        theme.frequency++;
        if (feedback.perspective === "creator") theme.creatorCount++;
        else if (feedback.perspective === "viewer") theme.viewerCount++;

        if (theme.quotes.length < 8) {
          theme.quotes.push({
            text: feedback.text.slice(0, 400) + (feedback.text.length > 400 ? "..." : ""),
            source: feedback.source,
            url: feedback.url,
            author: feedback.author,
            date: feedback.date,
            score: feedback.score,
            perspective: feedback.perspective,
          });
        }
      }
    }
  }

  // Sort by severity * frequency within each layer
  return updated.sort((a, b) => b.severity * b.frequency - a.severity * a.frequency);
}

// ── Monthly distribution builder ──

function buildMonthlyDistribution(raw: RawFeedback[], themes: TwitchTheme[]): AnalysisSnapshot["monthlyDistribution"] {
  const months = new Map<string, { count: number; byTheme: Record<string, number> }>();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.set(key, { count: 0, byTheme: {} });
  }

  for (const feedback of raw) {
    if (feedback.dateConfidence === "low") continue;
    const d = new Date(feedback.date);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = months.get(key);
    if (!entry) continue;

    entry.count++;
    const lower = feedback.text.toLowerCase();
    for (const theme of themes) {
      const keywords = THEME_KEYWORDS[theme.id] ?? [];
      if (keywords.some((kw) => lower.includes(kw))) {
        entry.byTheme[theme.id] = (entry.byTheme[theme.id] ?? 0) + 1;
      }
    }
  }

  return Array.from(months.entries()).map(([month, data]) => ({
    month,
    count: data.count,
    byTheme: data.byTheme,
  }));
}

// ── Build full snapshot ──

export async function buildSnapshot(): Promise<AnalysisSnapshot> {
  const withTimeout = <T>(p: Promise<T>, ms: number, fallback: T) =>
    Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);

  const [reddit, hn, playstore] = await Promise.all([
    scrapeReddit(),
    scrapeHackerNews(),
    withTimeout(scrapePlayStore(), 30000, []),
  ]);

  const appstore = await withTimeout(scrapeAppStore(), 30000, []);
  const youtube = await withTimeout(scrapeYouTube(), 60000, []);
  const curated = getCuratedFeedback();

  // Merge and deduplicate
  const allRaw = [...reddit, ...hn, ...playstore, ...appstore, ...youtube, ...curated];
  const seen = new Set<string>();
  const allFeedback = allRaw.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // Final freshness filter
  const freshFeedback = allFeedback.filter((f) => isWithin12Months(f.date));

  // Analyze
  const themes = analyzeFeedback(freshFeedback, getDefaultThemes());

  // Link feature launches to themes
  const launches = getFeatureLaunches();
  for (const theme of themes) {
    theme.relatedLaunches = launches
      .filter((l) => l.relatedThemes.includes(theme.id))
      .map((l) => l.id);
  }

  // Build competitor summary
  const competitorMap = new Map<string, { count: number; reasons: Set<string> }>();
  for (const theme of themes) {
    for (const comp of theme.competitorComparisons) {
      const existing = competitorMap.get(comp.platform) ?? { count: 0, reasons: new Set() };
      existing.count += theme.frequency;
      existing.reasons.add(comp.advantage);
      competitorMap.set(comp.platform, existing);
    }
  }

  const topCompetitors = Array.from(competitorMap.entries())
    .map(([name, data]) => ({
      name,
      mentionCount: data.count,
      topReasons: Array.from(data.reasons).slice(0, 3),
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  // Perspective split
  const perspectiveSplit = {
    creator: freshFeedback.filter((f) => f.perspective === "creator").length,
    viewer: freshFeedback.filter((f) => f.perspective === "viewer").length,
    both: freshFeedback.filter((f) => f.perspective === "both").length,
  };

  // Monthly distribution
  const monthlyDistribution = buildMonthlyDistribution(freshFeedback, themes);

  const snapshot: AnalysisSnapshot = {
    lastUpdated: new Date().toISOString(),
    totalFeedback: freshFeedback.length,
    sources: {
      reddit: reddit.filter((r) => isWithin12Months(r.date)).length,
      hackernews: hn.filter((r) => isWithin12Months(r.date)).length,
      playstore: playstore.filter((r) => isWithin12Months(r.date)).length,
      appstore: appstore.filter((r) => isWithin12Months(r.date)).length,
      youtube: youtube.length,
      curated: curated.length,
    },
    themes,
    topCompetitors,
    featureLaunches: launches,
    perspectiveSplit,
    monthlyDistribution,
  };

  await saveRawFeedback(freshFeedback);
  await saveSnapshot(snapshot);

  return snapshot;
}
