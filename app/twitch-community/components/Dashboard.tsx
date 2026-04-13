"use client";

import { useState, useCallback } from "react";
import type { AnalysisSnapshot, TwitchTheme, RawFeedback, FeedbackSource, Perspective, FeatureLaunch } from "@/lib/twitch-research";
import { SourceDistribution, PerspectiveSplit, ThemePerspectiveBar, FunnelChart, TimelineChart, SeverityBar } from "./Charts";

const TWITCH_PURPLE = "#9146FF";
const GITHUB_URL = "https://github.com/hbschlac/twitch-community-research";
const EXPORT_URL = "/twitch-community/api/export";

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  playstore: "Play Store",
  appstore: "App Store",
  youtube: "YouTube",
  curated: "Curated",
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  hackernews: "#FF6600",
  playstore: "#34A853",
  appstore: "#007AFF",
  youtube: "#FF0000",
  curated: "#9146FF",
};

const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  creator: "Creator",
  viewer: "Viewer",
  both: "Both",
};

const PERSPECTIVE_COLORS: Record<Perspective, string> = {
  creator: TWITCH_PURPLE,
  viewer: "#00C9A7",
  both: "#4A5568",
};

// ── Data Drawer (drill-down into individual data points) ──

function DataDrawer({
  themeId,
  themeName,
  onClose,
}: {
  themeId: string;
  themeName: string;
  onClose: () => void;
}) {
  const [items, setItems] = useState<RawFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [perspectiveFilter, setPerspectiveFilter] = useState<string>("all");

  const loadData = useCallback(async (perspective: string) => {
    setLoading(true);
    try {
      const url = `/twitch-community/api/feedback?themeId=${themeId}${perspective !== "all" ? `&perspective=${perspective}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [themeId]);

  useState(() => { loadData("all"); });

  const handlePerspectiveChange = (p: string) => {
    setPerspectiveFilter(p);
    loadData(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-gray-900 border-l border-gray-700 overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{themeName}</h3>
              <p className="text-sm text-gray-400">{total} data points — sorted by signal strength</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {["all", "creator", "viewer", "both"].map((p) => (
              <button
                key={p}
                onClick={() => handlePerspectiveChange(p)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  perspectiveFilter === p
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {p === "all" ? "All" : PERSPECTIVE_LABELS[p as Perspective]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data points found.</p>
          ) : (
            items.map((item, i) => (
              <a
                key={item.id ?? i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-purple-500/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 leading-relaxed">&ldquo;{item.text}&rdquo;</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${SOURCE_COLORS[item.source]}20`, color: SOURCE_COLORS[item.source] }}
                      >
                        {SOURCE_LABELS[item.source]}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${PERSPECTIVE_COLORS[item.perspective]}20`, color: PERSPECTIVE_COLORS[item.perspective] }}
                      >
                        {PERSPECTIVE_LABELS[item.perspective]}
                      </span>
                      {item.score > 0 && (
                        <span className="text-[10px] text-gray-500">▲ {item.score}</span>
                      )}
                      <span className="text-[10px] text-gray-500">{item.author}</span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Theme Card ──

function ThemeCard({
  theme,
  isExpanded,
  onToggle,
  onViewData,
  launches,
}: {
  theme: TwitchTheme;
  isExpanded: boolean;
  onToggle: () => void;
  onViewData: (themeId: string, themeName: string) => void;
  launches: FeatureLaunch[];
}) {
  const relatedLaunches = launches.filter((l) => theme.relatedLaunches.includes(l.id));

  return (
    <div
      className={`border rounded-xl p-4 md:p-5 transition-all cursor-pointer hover:shadow-lg ${
        isExpanded ? "border-purple-500/50 shadow-purple-500/10 shadow-lg" : "border-gray-700"
      }`}
      style={{ background: "#111827" }}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              theme.layer === "notifications"
                ? "bg-red-900/50 text-red-300"
                : "bg-purple-900/50 text-purple-300"
            }`}>
              {theme.layer === "notifications" ? "Notifications" : "Community"}
            </span>
            <SeverityBar level={theme.severity} />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-white mt-2">{theme.name}</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed">{theme.description}</p>
          <div className="mt-3 w-full max-w-[200px]">
            <ThemePerspectiveBar
              creator={theme.creatorCount}
              viewer={theme.viewerCount}
              total={theme.frequency}
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>Creator {theme.creatorCount}</span>
              <span>Viewer {theme.viewerCount}</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-white">{theme.frequency || "—"}</div>
          <div className="text-[10px] text-gray-500">mentions</div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
          {/* View all data CTA */}
          <button
            onClick={() => onViewData(theme.id, theme.name)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/50 px-3 py-1.5 rounded-lg transition-colors mb-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            View {theme.frequency > 0 ? `all ${theme.frequency}` : ""} source data points
          </button>

          {/* Quotes */}
          {theme.quotes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Top Quotes (by signal strength)
              </h4>
              <div className="space-y-2">
                {theme.quotes.slice(0, 5).map((q, i) => (
                  <a
                    key={i}
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${SOURCE_COLORS[q.source]}20`, color: SOURCE_COLORS[q.source] }}
                      >
                        {SOURCE_LABELS[q.source]}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${PERSPECTIVE_COLORS[q.perspective]}20`, color: PERSPECTIVE_COLORS[q.perspective] }}
                      >
                        {PERSPECTIVE_LABELS[q.perspective]}
                      </span>
                      {q.score > 0 && <span className="text-[10px] text-gray-500">▲ {q.score}</span>}
                      <span className="text-[10px] text-gray-500">{q.author}</span>
                      <svg className="w-3 h-3 text-gray-600 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Comparisons */}
          {theme.competitorComparisons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Competitive Benchmark
              </h4>
              <div className="space-y-1.5">
                {theme.competitorComparisons.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-purple-400 font-medium shrink-0">{c.platform}:</span>
                    <span className="text-gray-400">{c.advantage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Launches */}
          {relatedLaunches.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Related Feature Launches
              </h4>
              <div className="space-y-1.5">
                {relatedLaunches.map((l) => (
                  <a
                    key={l.id}
                    href={l.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-purple-300 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                    <span className="text-gray-500">{new Date(l.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    <span>{l.name}</span>
                    <svg className="w-3 h-3 ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── "What I'd Ship" Section ──

function WhatIdShip({ themes }: { themes: TwitchTheme[] }) {
  const notifThemes = themes.filter((t) => t.layer === "notifications").sort((a, b) => b.frequency - a.frequency);
  const topNotifTheme = notifThemes[0];
  const communityThemes = themes.filter((t) => t.layer === "community").sort((a, b) => b.frequency - a.frequency);
  const topCommunityTheme = communityThemes[0];

  return (
    <div className="space-y-4">
      {/* Quick Win */}
      <div className="border border-green-800/50 rounded-xl p-4 md:p-5 bg-green-900/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">QUICK WIN</span>
          <span className="text-xs text-gray-500">2-week experiment</span>
        </div>
        <h4 className="text-base font-semibold text-white">Smart Notification Priority</h4>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
          A/B test a &ldquo;priority notification&rdquo; tier: viewers mark up to 5 channels as &ldquo;never miss.&rdquo;
          These channels get guaranteed push delivery within 60 seconds of going live, while other followed channels
          use the existing notification system.
        </p>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p><span className="text-gray-400 font-medium">Hypothesis:</span> Viewers who set priority channels will have 2x higher live-stream attendance for those channels</p>
          <p><span className="text-gray-400 font-medium">Primary metric:</span> Live stream join rate within 5 minutes of go-live for priority vs. non-priority channels</p>
          <p><span className="text-gray-400 font-medium">Cohort:</span> 10% of users who follow 10+ channels (the fatigue-prone segment)</p>
          {topNotifTheme && (
            <p><span className="text-gray-400 font-medium">Data signal:</span> {topNotifTheme.frequency} mentions in &ldquo;{topNotifTheme.name}&rdquo; theme</p>
          )}
        </div>
      </div>

      {/* Medium Bet */}
      <div className="border border-yellow-800/50 rounded-xl p-4 md:p-5 bg-yellow-900/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded-full">MEDIUM BET</span>
          <span className="text-xs text-gray-500">1-quarter initiative</span>
        </div>
        <h4 className="text-base font-semibold text-white">&ldquo;Catch Up&rdquo; Digest Notifications</h4>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
          Build a daily/weekly digest notification that summarizes what a viewer missed — clips, highlights, and community
          moments from their followed channels. Addresses the ephemeral content problem: even when viewers miss the live,
          they stay connected to the community.
        </p>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p><span className="text-gray-400 font-medium">Hypothesis:</span> Digest notifications will increase weekly return rate by 15% among lapsed viewers (no visit in 7+ days)</p>
          <p><span className="text-gray-400 font-medium">Primary metric:</span> Weekly active viewer return rate for digest recipients vs. control</p>
          <p><span className="text-gray-400 font-medium">Why now:</span> Competitors (YouTube) retain viewers through persistent content; Twitch needs a re-engagement surface beyond live</p>
        </div>
      </div>

      {/* Strategic Bet */}
      <div className="border border-purple-800/50 rounded-xl p-4 md:p-5 bg-purple-900/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-purple-400 bg-purple-900/50 px-2 py-0.5 rounded-full">STRATEGIC BET</span>
          <span className="text-xs text-gray-500">2-3 quarter vision</span>
        </div>
        <h4 className="text-base font-semibold text-white">Interest-Based Discovery Engine</h4>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
          Replace viewer-count-sorted directories with an interest-graph recommendation engine.
          Surface small and mid-size streamers to viewers based on content affinity, not popularity.
          The directory&apos;s rich-get-richer dynamic is the #1 creator churn driver — this flips the model.
        </p>
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p><span className="text-gray-400 font-medium">Hypothesis:</span> Interest-based recommendations will increase new-channel follows by 30% and improve small-streamer viewer retention</p>
          <p><span className="text-gray-400 font-medium">Primary metric:</span> New unique channel follows per viewer per week; small-streamer ({"<"}100 avg) viewer growth rate</p>
          {topCommunityTheme && (
            <p><span className="text-gray-400 font-medium">Data signal:</span> {topCommunityTheme.frequency} mentions in &ldquo;{topCommunityTheme.name}&rdquo; — the highest-volume community theme</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Competitive Notification Audit ──

function CompetitiveAudit() {
  const platforms = [
    {
      name: "YouTube Live",
      color: "#FF0000",
      goLive: "Bell icon with 3 tiers (All / Personalized / None) per channel. Push notifications arrive within seconds of going live.",
      strength: "Reliable delivery, granular per-channel control, integrated with YouTube's notification infrastructure",
      weakness: "No batching intelligence — can still overwhelm users who subscribe to many channels",
    },
    {
      name: "Kick",
      color: "#53FC18",
      goLive: "Simple follow-based notifications. Creators report higher delivery rates than Twitch for go-live alerts.",
      strength: "Newer infrastructure, less scale means fewer delivery failures, creator-reported reliability",
      weakness: "Limited notification customization options, smaller user base means less data on at-scale performance",
    },
    {
      name: "TikTok Live",
      color: "#000000",
      goLive: "Go-live notifications integrated into TikTok's existing notification system. Leverages the For You algorithm to surface live content.",
      strength: "Live content appears in the main feed — discovery doesn't depend solely on notifications",
      weakness: "Notifications compete with TikTok's high-volume notification stream, easy to miss among likes/comments",
    },
    {
      name: "Discord",
      color: "#5865F2",
      goLive: "Many Twitch streamers use Discord bots (e.g., MEE6, Carl-bot) to send go-live alerts to their server. Near-instant delivery.",
      strength: "Streamers trust Discord notifications more than Twitch's own system — a signal that Twitch's infrastructure has a credibility gap",
      weakness: "Requires viewers to be in the creator's Discord server — not a platform-level solution",
    },
  ];

  return (
    <div className="space-y-3">
      {platforms.map((p) => (
        <div key={p.name} className="border border-gray-700 rounded-xl p-4 bg-gray-800/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
            <h4 className="text-sm font-semibold text-white">{p.name}</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <p><span className="text-gray-400 font-medium">Go-live alerts:</span> <span className="text-gray-300">{p.goLive}</span></p>
            <p><span className="text-green-400 font-medium">Strength:</span> <span className="text-gray-300">{p.strength}</span></p>
            <p><span className="text-red-400 font-medium">Gap:</span> <span className="text-gray-300">{p.weakness}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ──

export function Dashboard({ snapshot }: { snapshot: AnalysisSnapshot }) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [drawerTheme, setDrawerTheme] = useState<{ id: string; name: string } | null>(null);
  const [activeSection, setActiveSection] = useState<"community" | "notifications" | "all">("all");

  const communityThemes = snapshot.themes.filter((t) => t.layer === "community");
  const notifThemes = snapshot.themes.filter((t) => t.layer === "notifications");

  const displayThemes = activeSection === "community"
    ? communityThemes
    : activeSection === "notifications"
    ? notifThemes
    : snapshot.themes;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Header */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📡</span>
            <span className="text-xs font-medium text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full">COMMUNITY INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            What Twitch Viewers &amp; Creators Are Actually Saying
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-3 max-w-2xl leading-relaxed">
            {snapshot.totalFeedback.toLocaleString()}+ data points scraped from Reddit, App Store, Play Store, YouTube, and Hacker News.
            Every quote links to its exact source. Structured as a funnel: broad creator-viewer connection signal narrowing
            into notification-specific pain points.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-xl md:text-2xl font-bold" style={{ color: TWITCH_PURPLE }}>{snapshot.totalFeedback.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Data Points</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-white">{Object.keys(snapshot.sources).filter((k) => (snapshot.sources[k as FeedbackSource] ?? 0) > 0).length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Sources</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-white">{snapshot.themes.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Themes</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-xl md:text-2xl font-bold text-red-400">
                {notifThemes.reduce((s, t) => s + t.frequency, 0)}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Notification Mentions</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Overview Section */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Source Distribution</h2>
            <SourceDistribution sources={snapshot.sources} />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Who&apos;s Talking?</h2>
            <PerspectiveSplit split={snapshot.perspectiveSplit} />
            <div className="mt-4">
              <h3 className="text-xs text-gray-500 mb-2">Signal Funnel</h3>
              <FunnelChart themes={snapshot.themes} />
            </div>
          </div>
        </section>

        {/* Timeline */}
        {snapshot.monthlyDistribution.length > 0 && (
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-1">Feedback Timeline</h2>
            <p className="text-xs text-gray-500 mb-4">Monthly volume with feature launch markers — click any bar to see that month&apos;s data</p>
            <TimelineChart
              monthlyDistribution={snapshot.monthlyDistribution}
              featureLaunches={snapshot.featureLaunches}
              onMonthClick={(month) => {
                // Could filter to month — for now just scroll to themes
                const el = document.getElementById("themes");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </section>
        )}

        {/* Ephemeral Content Callout */}
        <div className="bg-gradient-to-r from-purple-900/20 to-red-900/20 border border-purple-800/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Why Notifications Matter More on Twitch</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Unlike YouTube (where the VOD persists forever), a missed Twitch notification = <span className="text-red-300 font-medium">missed content entirely</span>.
            Viewers don&apos;t just miss a video — they miss the chat, the community moment, the inside jokes.
            On a live-first platform, notification reliability isn&apos;t a convenience feature — it&apos;s existential.
          </p>
        </div>

        {/* Theme Section */}
        <section id="themes">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold text-white">Pain Point Themes</h2>
            <div className="flex gap-2">
              {(["all", "community", "notifications"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    activeSection === s
                      ? s === "notifications"
                        ? "bg-red-900/50 text-red-300"
                        : "bg-purple-900/50 text-purple-300"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {s === "all" ? "All Themes" : s === "community" ? "Community" : "Notifications"}
                </button>
              ))}
            </div>
          </div>

          {/* Community Layer */}
          {(activeSection === "all" || activeSection === "community") && (
            <div className="mb-6">
              {activeSection === "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: TWITCH_PURPLE }} />
                  <h3 className="text-sm font-semibold text-gray-300">Layer 1: Creator-Viewer Connection</h3>
                  <span className="text-xs text-gray-600">broad signal</span>
                </div>
              )}
              <div className="space-y-3">
                {(activeSection === "community" ? displayThemes : communityThemes).map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isExpanded={expandedTheme === theme.id}
                    onToggle={() => setExpandedTheme(expandedTheme === theme.id ? null : theme.id)}
                    onViewData={(id, name) => setDrawerTheme({ id, name })}
                    launches={snapshot.featureLaunches}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Funnel arrow between layers */}
          {activeSection === "all" && (
            <div className="flex justify-center my-4">
              <div className="flex flex-col items-center">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="none" stroke={TWITCH_PURPLE} strokeWidth="2">
                  <path d="M12 2v28M5 22l7 8 7-8" />
                </svg>
                <span className="text-[10px] text-gray-600 mt-1">narrows to</span>
              </div>
            </div>
          )}

          {/* Notification Layer */}
          {(activeSection === "all" || activeSection === "notifications") && (
            <div>
              {activeSection === "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <h3 className="text-sm font-semibold text-gray-300">Layer 2: Notifications</h3>
                  <span className="text-xs text-gray-600">the team&apos;s specific initiative</span>
                </div>
              )}
              <div className="space-y-3">
                {(activeSection === "notifications" ? displayThemes : notifThemes).map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isExpanded={expandedTheme === theme.id}
                    onToggle={() => setExpandedTheme(expandedTheme === theme.id ? null : theme.id)}
                    onViewData={(id, name) => setDrawerTheme({ id, name })}
                    launches={snapshot.featureLaunches}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Competitive Notification Audit */}
        <section>
          <h2 className="text-lg font-bold text-white mb-1">Competitive Notification Audit</h2>
          <p className="text-xs text-gray-500 mb-4">How YouTube, Kick, TikTok Live, and Discord handle go-live notifications</p>
          <CompetitiveAudit />
        </section>

        {/* What I'd Ship */}
        <section>
          <h2 className="text-lg font-bold text-white mb-1">What I&apos;d Ship</h2>
          <p className="text-xs text-gray-500 mb-4">A prioritized 3-item roadmap informed by the data above</p>
          <WhatIdShip themes={snapshot.themes} />
        </section>

        {/* Top Competitors Summary */}
        {snapshot.topCompetitors.length > 0 && (
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Most-Cited Competitors</h2>
            <div className="space-y-3">
              {snapshot.topCompetitors.slice(0, 4).map((c, i) => (
                <div key={c.name} className="flex items-start gap-3">
                  <span className="text-lg font-bold text-gray-600 w-6">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium text-white">{c.name}</span>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {c.topReasons.slice(0, 2).join(" · ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">
                Built by <a href="https://schlacter.me" className="text-purple-400 hover:text-purple-300">Hannah Schlacter</a> with{" "}
                <span className="text-purple-400">Claude Code</span>
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Last updated: {new Date(snapshot.lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                View on GitHub
              </a>
              <a
                href={EXPORT_URL}
                className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                Download Raw Data
              </a>
              <a
                href="/twitch-community/methodology"
                className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                Methodology
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Data Drawer */}
      {drawerTheme && (
        <DataDrawer
          themeId={drawerTheme.id}
          themeName={drawerTheme.name}
          onClose={() => setDrawerTheme(null)}
        />
      )}
    </div>
  );
}
