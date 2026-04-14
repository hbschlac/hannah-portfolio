"use client";

import { useState, useCallback } from "react";
import type { AnalysisSnapshot, TwitchTheme, RawFeedback, FeedbackSource, Perspective, FeatureLaunch } from "@/lib/twitch-research";

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
  viewer: "#00897B",
  both: "#5F6368",
};

// ── Severity Bar ──

function SeverityBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-2 w-4 rounded-sm"
          style={{
            background: i <= level
              ? level >= 4 ? "#EA4335" : level >= 3 ? "#FBBC04" : "#34A853"
              : "#E8EAED",
          }}
        />
      ))}
    </div>
  );
}

// ── Perspective Mini Bar (inline in theme card header) ──

function PerspectiveMiniBar({ creator, viewer, total }: { creator: number; viewer: number; total: number }) {
  if (total === 0) return null;
  const cPct = Math.round((creator / total) * 100);
  const vPct = Math.round((viewer / total) * 100);
  const bPct = 100 - cPct - vPct;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 w-20 rounded-full overflow-hidden" title={`Creator: ${creator}, Viewer: ${viewer}, Both: ${total - creator - viewer}`}>
        <div style={{ width: `${cPct}%`, background: TWITCH_PURPLE }} />
        <div style={{ width: `${vPct}%`, background: "#00897B" }} />
        <div style={{ width: `${bPct}%`, background: "#D1D5DB" }} />
      </div>
      <span className="text-[10px]" style={{ color: "#999" }}>
        {cPct}% creator
      </span>
    </div>
  );
}

// ── Data Drawer ──

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
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl overflow-y-auto" style={{ borderLeft: "1px solid #E8EAED" }}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-4" style={{ borderBottom: "1px solid #E8EAED" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold" style={{ color: "#222" }}>{themeName}</h3>
              <p className="text-xs mt-0.5" style={{ color: "#999" }}>{total} data points — sorted by signal strength</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#666" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {["all", "creator", "viewer", "both"].map((p) => (
              <button
                key={p}
                onClick={() => handlePerspectiveChange(p)}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{
                  background: perspectiveFilter === p ? `${TWITCH_PURPLE}15` : "#F3F4F6",
                  color: perspectiveFilter === p ? TWITCH_PURPLE : "#666",
                  fontWeight: perspectiveFilter === p ? 500 : 400,
                }}
              >
                {p === "all" ? "All" : PERSPECTIVE_LABELS[p as Perspective]}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: `${TWITCH_PURPLE} transparent transparent transparent` }} />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "#999" }}>No data points found.</p>
          ) : (
            items.map((item, i) => (
              <a
                key={item.id ?? i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-4 transition-colors hover:shadow-md"
                style={{ background: "#F8F9FA", border: "1px solid #E8EAED" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "#333" }}>&ldquo;{item.text}&rdquo;</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${SOURCE_COLORS[item.source]}15`, color: SOURCE_COLORS[item.source] }}
                  >
                    {SOURCE_LABELS[item.source]}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${PERSPECTIVE_COLORS[item.perspective]}15`, color: PERSPECTIVE_COLORS[item.perspective] }}
                  >
                    {PERSPECTIVE_LABELS[item.perspective]}
                  </span>
                  {item.score > 0 && (
                    <span className="text-[10px]" style={{ color: "#999" }}>&#9650; {item.score}</span>
                  )}
                  <span className="text-[10px]" style={{ color: "#999" }}>{item.author}</span>
                  <span className="text-[10px]" style={{ color: "#BBB" }}>
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <svg className="w-3 h-3 ml-auto shrink-0" style={{ color: "#CCC" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 text-center" style={{ borderTop: "1px solid #E8EAED" }}>
          <div className="flex justify-center gap-3">
            <a href="/twitch-community/methodology" className="text-xs hover:underline" style={{ color: TWITCH_PURPLE }}>Methodology</a>
            <span style={{ color: "#E8EAED" }}>|</span>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: TWITCH_PURPLE }}>GitHub</a>
          </div>
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
}: {
  theme: TwitchTheme;
  isExpanded: boolean;
  onToggle: () => void;
  onViewData: (themeId: string, themeName: string) => void;
}) {
  return (
    <div
      className="bg-white rounded-xl p-5 transition-all cursor-pointer hover:shadow-md"
      style={{ border: `1px solid ${isExpanded ? TWITCH_PURPLE : "#E8EAED"}` }}
      onClick={onToggle}
    >
      {/* Collapsed content — always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold" style={{ color: "#222" }}>{theme.name}</h3>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#666" }}>{theme.description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl md:text-2xl font-bold" style={{ color: "#222" }}>{theme.frequency || "—"}</div>
          <div className="text-[10px]" style={{ color: "#999" }}>mentions</div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E8EAED" }} onClick={(e) => e.stopPropagation()}>
          {/* View all data CTA */}
          <button
            onClick={() => onViewData(theme.id, theme.name)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors mb-4"
            style={{ background: `${TWITCH_PURPLE}10`, color: TWITCH_PURPLE }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            View {theme.frequency > 0 ? `all ${theme.frequency}` : ""} source data points
          </button>

          {/* Quotes */}
          {theme.quotes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>
                Top Quotes
              </h4>
              <div className="space-y-2">
                {theme.quotes.slice(0, 3).map((q, i) => (
                  <a
                    key={i}
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg p-3 transition-colors hover:shadow-sm"
                    style={{ background: "#F8F9FA" }}
                  >
                    <p className="text-sm italic leading-relaxed" style={{ color: "#444" }}>&ldquo;{q.text}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${SOURCE_COLORS[q.source]}15`, color: SOURCE_COLORS[q.source] }}
                      >
                        {SOURCE_LABELS[q.source]}
                      </span>
                      {q.score > 0 && <span className="text-[10px]" style={{ color: "#999" }}>&#9650; {q.score}</span>}
                      <span className="text-[10px]" style={{ color: "#999" }}>{q.author}</span>
                      <svg className="w-3 h-3 ml-auto shrink-0" style={{ color: "#CCC" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>
                Competitive Benchmark
              </h4>
              <div className="space-y-1.5">
                {theme.competitorComparisons.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-2" style={{ background: "#FFF8E1" }}>
                    <span className="text-xs font-medium shrink-0" style={{ color: "#F59E0B" }}>&rarr;</span>
                    <span className="text-xs" style={{ color: "#666" }}>
                      <span className="font-medium" style={{ color: "#444" }}>{c.platform}:</span> {c.advantage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
  const notifMentions = notifThemes.reduce((s, t) => s + t.frequency, 0);

  const displayThemes = activeSection === "community"
    ? communityThemes
    : activeSection === "notifications"
    ? notifThemes
    : snapshot.themes;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      {/* Hero Header */}
      <header className="bg-white" style={{ borderBottom: "1px solid #E8EAED" }}>
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#999" }}>
            Community Research
            <span className="mx-2" style={{ color: "#E8EAED" }}>|</span>
            <span className="normal-case tracking-normal">Last analyzed {new Date(snapshot.lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </p>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight" style={{ color: "#222" }}>
            What Twitch Users Are Saying About Notifications
          </h1>

          <p className="text-base md:text-lg mt-3 max-w-2xl" style={{ color: "#666" }}>
            {snapshot.totalFeedback.toLocaleString()} data points scraped from Reddit, Hacker News, and app stores. Every quote links to its source.
          </p>

          {/* Pill links */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <a
              href="https://schlacter.me"
              className="text-xs hover:underline"
              style={{ color: TWITCH_PURPLE }}
            >
              Hannah Schlacter
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors hover:shadow-sm"
              style={{ background: "#F3F4F6", color: "#444" }}
            >
              GitHub repo
            </a>
            <a
              href={EXPORT_URL}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors hover:shadow-sm"
              style={{ background: "#F3F4F6", color: "#444" }}
            >
              Raw data
            </a>
            <a
              href="/twitch-community/methodology"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors hover:shadow-sm"
              style={{ background: "#F3F4F6", color: "#444" }}
            >
              Methodology
            </a>
            <a
              href="/twitch-community/verification"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors hover:shadow-sm"
              style={{ background: "#F3F4F6", color: "#444" }}
            >
              Verify data
            </a>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg p-4" style={{ background: "#F8F9FA" }}>
              <div className="text-2xl font-bold" style={{ color: "#222" }}>{snapshot.totalFeedback.toLocaleString()}</div>
              <div className="text-xs mt-0.5" style={{ color: "#999" }}>Data Points</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#F8F9FA" }}>
              <div className="text-2xl font-bold" style={{ color: "#222" }}>
                {Object.keys(snapshot.sources).filter((k) => (snapshot.sources[k as FeedbackSource] ?? 0) > 0).length}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#999" }}>Sources Scraped</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#F8F9FA" }}>
              <div className="text-2xl font-bold" style={{ color: "#222" }}>{snapshot.themes.length}</div>
              <div className="text-xs mt-0.5" style={{ color: "#999" }}>Themes Identified</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#F8F9FA" }}>
              <div className="text-2xl font-bold" style={{ color: "#222" }}>{notifMentions}</div>
              <div className="text-xs mt-0.5" style={{ color: "#999" }}>Notification Mentions</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Pain Point Themes */}
        <section id="themes" className="mt-4">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-xl font-bold" style={{ color: "#222" }}>Pain Points</h2>
            <div className="flex gap-2">
              {(["all", "community", "notifications"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    background: activeSection === s ? `${TWITCH_PURPLE}15` : "#F3F4F6",
                    color: activeSection === s ? TWITCH_PURPLE : "#666",
                    fontWeight: activeSection === s ? 500 : 400,
                  }}
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
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: TWITCH_PURPLE }} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#666" }}>Creator-Viewer Connection</h3>
                  <span className="text-xs" style={{ color: "#BBB" }}>broad signal</span>
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Funnel arrow */}
          {activeSection === "all" && (
            <div className="flex justify-center my-5">
              <div className="flex flex-col items-center">
                <svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                  <path d="M10 2v24M4 20l6 6 6-6" />
                </svg>
                <span className="text-[10px] mt-1" style={{ color: "#BBB" }}>narrows to</span>
              </div>
            </div>
          )}

          {/* Notification Layer */}
          {(activeSection === "all" || activeSection === "notifications") && (
            <div>
              {activeSection === "all" && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EA4335" }} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#666" }}>Notifications</h3>
                  <span className="text-xs" style={{ color: "#BBB" }}>the team&apos;s specific initiative</span>
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
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Strategic Thesis */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#222" }}>Strategic Synthesis</h2>

          <div className="rounded-xl p-6" style={{ background: "#F3E8FF", border: "1px solid #E9D5FF" }}>
            <h3 className="font-semibold mb-2" style={{ color: "#6B21A8" }}>Core Thesis</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#7C3AED" }}>
              Notifications aren&apos;t a settings problem — they&apos;re a retention lever.{" "}
              {notifThemes.find((t) => t.id === "notif-missing")
                ? `${Math.round((notifThemes.find((t) => t.id === "notif-missing")!.frequency / notifMentions) * 100)}% of notification feedback is about missing live alerts entirely.`
                : "The majority of notification feedback is about missing live alerts entirely."
              }{" "}
              Unlike YouTube, where a missed notification means watching a VOD later, a missed Twitch notification means missing the content, the chat, and the community moment altogether.{" "}
              The fix isn&apos;t better settings UI — it&apos;s a priority-based system that knows which streams each viewer actually cares about.
            </p>
          </div>

          {/* What I'd Explore */}
          <div className="mt-6 rounded-xl p-5 bg-white" style={{ border: "1px solid #E8EAED" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>
              Experiments I&apos;d Explore
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${TWITCH_PURPLE}15`, color: TWITCH_PURPLE }}>1</span>
                <div>
                  <p className="text-sm" style={{ color: "#444" }}>
                    <span className="font-medium" style={{ color: "#222" }}>Priority channel tier:</span>{" "}
                    Let viewers mark up to 5 channels as &ldquo;never miss&rdquo; with guaranteed push delivery within 60 seconds of go-live.{" "}
                    <span style={{ color: "#999" }}>({notifThemes.find((t) => t.id === "notif-missing")?.frequency ?? "—"} mentions in &ldquo;Missed Live Notifications&rdquo;)</span>
                  </p>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p><span className="font-medium" style={{ color: "#222" }}>Core metric:</span>{" "}<span style={{ color: "#666" }}>Live stream join rate within 5 min of go-live for priority vs. non-priority channels</span></p>
                    <p><span className="font-medium" style={{ color: "#222" }}>Guardrails:</span>{" "}<span style={{ color: "#666" }}>Overall notification opt-out rate stays flat; push delivery latency for non-priority channels doesn&apos;t regress</span></p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${TWITCH_PURPLE}15`, color: TWITCH_PURPLE }}>2</span>
                <div>
                  <p className="text-sm" style={{ color: "#444" }}>
                    <span className="font-medium" style={{ color: "#222" }}>Catch-up digest:</span>{" "}
                    Daily summary of what viewers missed — clips, highlights, community moments from followed channels — to re-engage lapsed viewers.{" "}
                    <span style={{ color: "#999" }}>({notifThemes.find((t) => t.id === "notif-fatigue")?.frequency ?? "—"} mentions in &ldquo;Notification Fatigue&rdquo;)</span>
                  </p>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p><span className="font-medium" style={{ color: "#222" }}>Core metric:</span>{" "}<span style={{ color: "#666" }}>Weekly return rate among lapsed viewers (no visit in 7+ days) who receive digest vs. control</span></p>
                    <p><span className="font-medium" style={{ color: "#222" }}>Guardrails:</span>{" "}<span style={{ color: "#666" }}>Notification unsubscribe rate doesn&apos;t increase; live viewership (concurrent viewers) doesn&apos;t cannibalize toward VOD/clips</span></p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${TWITCH_PURPLE}15`, color: TWITCH_PURPLE }}>3</span>
                <div>
                  <p className="text-sm" style={{ color: "#444" }}>
                    <span className="font-medium" style={{ color: "#222" }}>Interest-based discovery:</span>{" "}
                    Replace viewer-count-sorted directories with content-affinity recommendations to surface small and mid-size streamers.{" "}
                    <span style={{ color: "#999" }}>({communityThemes.find((t) => t.id === "discovery")?.frequency ?? "—"} mentions in &ldquo;Discoverability&rdquo;)</span>
                  </p>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p><span className="font-medium" style={{ color: "#222" }}>Core metric:</span>{" "}<span style={{ color: "#666" }}>New unique channel follows per viewer per week; small-streamer (&lt;100 avg) viewer growth rate</span></p>
                    <p><span className="font-medium" style={{ color: "#222" }}>Guardrails:</span>{" "}<span style={{ color: "#666" }}>Top-streamer concurrent viewership stays flat; overall browse-to-watch conversion rate doesn&apos;t drop</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Summary */}
        <section className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Data Sources</h3>
              <div className="space-y-1.5">
                {Object.entries(snapshot.sources)
                  .filter(([, count]) => (count ?? 0) > 0)
                  .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                  .map(([source, count]) => (
                    <div key={source} className="flex justify-between text-xs">
                      <span style={{ color: "#444" }}>{SOURCE_LABELS[source] ?? source}</span>
                      <span className="font-mono" style={{ color: "#999" }}>{count}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #E8EAED" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#999" }}>Analysis Approach</h3>
              <ul className="space-y-1.5 text-xs" style={{ color: "#444" }}>
                <li>Deterministic keyword matching — no LLMs in the data pipeline</li>
                <li>Severity manually assessed (1-5 scale) based on user impact</li>
                <li>Themes ranked by severity &times; frequency</li>
                <li>12-month freshness guardrail applied at scraper level</li>
                <li>Creator vs. viewer perspective tagging on every data point</li>
              </ul>
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid #E8EAED" }}>
                <p className="text-[10px]" style={{ color: "#BBB" }}>
                  Built with Next.js, Upstash Redis, Vercel &middot;{" "}
                  <a href="/twitch-community/methodology" className="hover:underline" style={{ color: TWITCH_PURPLE }}>Full methodology</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center" style={{ borderTop: "1px solid #E8EAED" }}>
        <p className="text-xs" style={{ color: "#999" }}>
          Built by{" "}
          <a href="https://schlacter.me" className="hover:underline" style={{ color: TWITCH_PURPLE }}>Hannah Schlacter</a>
          {" "}with{" "}
          <a href="https://claude.ai/claude-code" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: TWITCH_PURPLE }}>Claude Code</a>
        </p>
        <p className="text-[10px] mt-1" style={{ color: "#CCC" }}>
          {snapshot.totalFeedback.toLocaleString()} data points from public sources &middot; All quotes link to original source
        </p>
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
