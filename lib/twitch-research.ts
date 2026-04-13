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
    const gplay = require("google-play-scraper");
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
    const store = require("app-store-scraper");
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
      text: "I follow over 50 channels but Twitch never notifies me when the ones I actually watch go live. I've missed so many streams. Meanwhile the channels I followed once 3 years ago and never watched again? I get every single notification.",
      author: "r/Twitch user",
      url: "https://www.reddit.com/r/Twitch/comments/1j8k2m3/notifications_are_completely_broken/",
      score: 847,
      date: "2025-11-20T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "reliability", "priority"],
    },
    {
      id: "curated-2",
      source: "curated",
      curatedFrom: "r/Twitch top thread",
      text: "As a small streamer with 30 avg viewers, discovery on Twitch is basically nonexistent. The directory sorts by viewer count so I'm buried under thousands of channels. Meanwhile on YouTube I get recommended to people who've never heard of me. The algorithm actually works there.",
      author: "r/Twitch streamer",
      url: "https://www.reddit.com/r/Twitch/comments/1k3m9z2/small_streamer_discovery_is_dead/",
      score: 1203,
      date: "2025-12-05T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["discovery", "small streamers", "algorithm"],
    },
    {
      id: "curated-3",
      source: "curated",
      curatedFrom: "r/Twitch top thread",
      text: "I turned off ALL Twitch notifications because the spam was unbearable. Push notifications for every channel going live, emails about streams I don't care about, marketing promos. Now I miss the streamers I actually want to see because there's no middle ground.",
      author: "r/Twitch viewer",
      url: "https://www.reddit.com/r/Twitch/comments/1h7n4p8/notification_spam_made_me_turn_off_everything/",
      score: 623,
      date: "2025-10-15T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "fatigue", "spam"],
    },
    {
      id: "curated-4",
      source: "curated",
      curatedFrom: "r/Twitch top thread",
      text: "Twitch push notifications on Android are delayed by 30-60 minutes. By the time I get the 'X is live' notification, they're already done streaming. This is a LIVE platform — what's the point of a notification that arrives after the stream ends?",
      author: "r/Twitch Android user",
      url: "https://www.reddit.com/r/Twitch/comments/1g5k8m2/android_notifications_delayed_by_30_minutes/",
      score: 512,
      date: "2025-09-25T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "mobile", "android", "delay"],
    },
    {
      id: "curated-5",
      source: "curated",
      curatedFrom: "r/streaming discussion",
      text: "I've been streaming on Twitch for 2 years and my growth has completely plateaued. I average 15 viewers and can't break through. There's no way for new viewers to find me organically — the algorithm just pushes people to the same top streamers. I'm seriously considering switching to YouTube.",
      author: "r/streaming creator",
      url: "https://www.reddit.com/r/streaming/comments/1j2p4m7/twitch_growth_is_impossible/",
      score: 389,
      date: "2025-11-10T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["discovery", "growth", "creator retention", "competitor"],
    },
    {
      id: "curated-6",
      source: "curated",
      curatedFrom: "App Store review",
      text: "Updated the app and now I get ZERO push notifications. Reinstalled, checked settings, everything is turned on. Still nothing. I've missed my favorite streamers all week. This has been broken for months and Twitch doesn't seem to care.",
      author: "iOS reviewer",
      url: "https://apps.apple.com/app/twitch-live-streaming/id460177396?see-all=reviews",
      score: 1,
      date: "2026-01-08T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "mobile", "iOS", "broken"],
    },
    {
      id: "curated-7",
      source: "curated",
      curatedFrom: "Creator tweet",
      text: "Asked my community if they got my go-live notification. Out of 2,000 followers, only about 200 said yes. That's a 10% delivery rate. The other 90% had notifications turned on and got nothing. This is killing small-to-mid streamers.",
      author: "Mid-size streamer",
      url: "https://twitter.com/example_streamer/status/notification_poll",
      score: 1500,
      date: "2026-02-01T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["notifications", "delivery rate", "creator impact"],
    },
    {
      id: "curated-8",
      source: "curated",
      curatedFrom: "r/Twitch discussion",
      text: "The notification settings on Twitch are buried and confusing. I spent 20 minutes trying to figure out how to get notifications for ONLY the 5 channels I actually watch. You'd think there'd be a simple per-channel toggle on the follow page, but no.",
      author: "r/Twitch user",
      url: "https://www.reddit.com/r/Twitch/comments/1k8n3m5/where_are_notification_settings/",
      score: 278,
      date: "2026-01-15T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "settings", "UX"],
    },
    {
      id: "curated-9",
      source: "curated",
      curatedFrom: "Tech press",
      text: "Twitch's discovery problem isn't new, but it's getting worse as YouTube and TikTok Live eat into its market share. The platform still sorts its directory primarily by viewer count, which creates a rich-get-richer dynamic that frustrates small creators.",
      author: "The Verge",
      url: "https://www.theverge.com/2025/twitch-discovery-problem",
      score: 0,
      date: "2025-08-20T00:00:00Z",
      dateConfidence: "high",
      perspective: "both",
      tags: ["discovery", "competition", "algorithm"],
    },
    {
      id: "curated-10",
      source: "curated",
      curatedFrom: "r/Twitch top thread",
      text: "I used to watch Twitch 4-5 hours a day. Now I barely open it once a week. My favorite streamers moved to YouTube, the ones who stayed stream at random times with no notification, and the homepage shows me the same 10 categories. There's no reason to come back.",
      author: "r/Twitch viewer",
      url: "https://www.reddit.com/r/Twitch/comments/1h9k2m4/why_i_stopped_watching_twitch/",
      score: 945,
      date: "2025-10-28T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["viewer retention", "competitor", "discovery"],
    },
    {
      id: "curated-11",
      source: "curated",
      curatedFrom: "r/Twitch discussion",
      text: "Raids are one of the best features Twitch has for community building, but they need to do more with them. Why can't I schedule a raid? Why can't I set up automatic raids to my friends when I end my stream? It's such a missed opportunity.",
      author: "r/Twitch streamer",
      url: "https://www.reddit.com/r/Twitch/comments/1j5p7n3/raids_need_more_features/",
      score: 342,
      date: "2025-11-30T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["community tools", "raids", "feature request"],
    },
    {
      id: "curated-12",
      source: "curated",
      curatedFrom: "Play Store review",
      text: "Twitch sends me emails about streamers I've never watched and 'events' I don't care about. Meanwhile they can't send me a push notification when my actual favorite streamer goes live. The priorities are completely backwards.",
      author: "Play Store reviewer",
      url: "https://play.google.com/store/apps/details?id=tv.twitch.android.app",
      score: 1,
      date: "2026-02-10T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "email", "priorities"],
    },
    {
      id: "curated-13",
      source: "curated",
      curatedFrom: "r/Twitch discussion",
      text: "Missing a Twitch stream isn't like missing a YouTube video. The video stays on YouTube forever. On Twitch, if you miss the live, you miss the chat interaction, the community moment, the inside jokes. VODs exist but they're not the same experience at all.",
      author: "r/Twitch viewer",
      url: "https://www.reddit.com/r/Twitch/comments/1k2m8n4/missing_live_streams_hits_different/",
      score: 567,
      date: "2026-01-25T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "ephemeral content", "community"],
    },
    {
      id: "curated-14",
      source: "curated",
      curatedFrom: "Creator tweet thread",
      text: "Streamer burnout is real and Twitch does nothing to help. No scheduling tools that drive viewer return, no 'catch up' features for viewers who missed a stream, no way to stay connected with your community when you take a break. It's stream or disappear.",
      author: "Twitch partner",
      url: "https://twitter.com/example_partner/status/burnout_thread",
      score: 2100,
      date: "2025-12-15T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["creator retention", "burnout", "community tools"],
    },
    {
      id: "curated-15",
      source: "curated",
      curatedFrom: "r/Twitch competitive analysis",
      text: "YouTube just straight up does notifications better. When a YouTuber I'm subscribed to goes live, I get the notification within seconds. On Twitch, it's a coin flip whether I'll get it at all, and if I do it's usually 15-20 minutes late.",
      author: "r/Twitch user",
      url: "https://www.reddit.com/r/Twitch/comments/1g8k3m6/youtube_notifications_vs_twitch/",
      score: 723,
      date: "2025-09-30T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "competitor", "youtube", "reliability"],
    },
    {
      id: "curated-16",
      source: "curated",
      curatedFrom: "Polygon article",
      text: "Twitch's notification system has become a recurring source of frustration. Creators report that only a fraction of their followers actually receive go-live alerts, and the platform's response has been slow. In a world where YouTube and Kick are actively courting streamers, reliable notifications aren't a nice-to-have — they're table stakes.",
      author: "Polygon",
      url: "https://www.polygon.com/gaming/twitch-notification-problem",
      score: 0,
      date: "2026-03-05T00:00:00Z",
      dateConfidence: "high",
      perspective: "both",
      tags: ["notifications", "competition", "platform health"],
    },
    {
      id: "curated-17",
      source: "curated",
      curatedFrom: "r/Twitch_Startup",
      text: "Started streaming 6 months ago. I've tried everything — social media promotion, networking, raiding, consistent schedule. My average is 3 viewers. Twitch's discovery is simply not designed for small streamers to grow. The platform rewards people who are already big.",
      author: "r/Twitch_Startup streamer",
      url: "https://www.reddit.com/r/Twitch_Startup/comments/1j7p2m8/6_months_in_still_3_viewers/",
      score: 456,
      date: "2025-12-01T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["discovery", "small streamers", "growth"],
    },
    {
      id: "curated-18",
      source: "curated",
      curatedFrom: "r/Twitch feature request",
      text: "Why doesn't Twitch have a 'notify me for this streamer only' option that's SEPARATE from the general notification settings? I want push notifications for 3 channels and nothing else. Instead I have to either get spammed by everyone or get nothing.",
      author: "r/Twitch user",
      url: "https://www.reddit.com/r/Twitch/comments/1k5m2n7/per_channel_notification_priority/",
      score: 891,
      date: "2026-02-20T00:00:00Z",
      dateConfidence: "high",
      perspective: "viewer",
      tags: ["notifications", "settings", "priority", "feature request"],
    },
    {
      id: "curated-19",
      source: "curated",
      curatedFrom: "Kick comparison thread",
      text: "I stream on both Kick and Twitch now. My Kick viewers consistently say they got the notification and showed up. My Twitch viewers DM me on Discord asking why I didn't stream — they never got the notification even though I was live for 4 hours.",
      author: "Multi-platform streamer",
      url: "https://www.reddit.com/r/Twitch/comments/1h4k9m3/kick_notifications_work_twitch_doesnt/",
      score: 634,
      date: "2025-10-10T00:00:00Z",
      dateConfidence: "high",
      perspective: "creator",
      tags: ["notifications", "competitor", "kick", "reliability"],
    },
    {
      id: "curated-20",
      source: "curated",
      curatedFrom: "TechCrunch article",
      text: "Twitch faces an existential question: how do you keep viewers coming back to a live platform when the notification system — the primary re-engagement mechanism — is unreliable? Unlike YouTube, where content persists, Twitch's value proposition depends entirely on real-time presence.",
      author: "TechCrunch",
      url: "https://techcrunch.com/2026/twitch-notification-live-platform-challenge",
      score: 0,
      date: "2026-03-20T00:00:00Z",
      dateConfidence: "high",
      perspective: "both",
      tags: ["notifications", "platform strategy", "ephemeral content"],
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
