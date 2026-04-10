"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalysisSnapshot, PainPointTheme, WorkspaceApp, RawFeedback, FeedbackSource } from "@/lib/workspace-ai";
import { ChartsSection } from "./Charts";

const GITHUB_URL = "https://github.com/hbschlac/workspace-ai-research";
const RAW_DATA_URL = "/workspace-ai-gaps/api/export";

const APP_LABELS: Record<WorkspaceApp, string> = {
  gmail: "Gmail",
  docs: "Docs",
  sheets: "Sheets",
  slides: "Slides",
  meet: "Meet",
  drive: "Drive",
  calendar: "Calendar",
  chat: "Chat",
  general: "Cross-App",
};

const APP_COLORS: Record<WorkspaceApp, string> = {
  gmail: "#EA4335",
  docs: "#4285F4",
  sheets: "#34A853",
  slides: "#FBBC04",
  meet: "#00897B",
  drive: "#FBBC04",
  calendar: "#4285F4",
  chat: "#34A853",
  general: "#5F6368",
};

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  playstore: "Play Store",
  appstore: "App Store",
  stackoverflow: "Stack Overflow",
  youtube: "YouTube",
  curated: "Industry Reports",
};

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

function AppTag({ app }: { app: WorkspaceApp }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${APP_COLORS[app]}15`, color: APP_COLORS[app] }}
    >
      {APP_LABELS[app]}
    </span>
  );
}

function ScopeTag({ scope }: { scope: "platform" | "app-level" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        scope === "platform"
          ? "bg-blue-50 text-blue-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {scope === "platform" ? "Platform-Level" : "App-Level"}
    </span>
  );
}

function ThemeCard({
  theme,
  isExpanded,
  onToggle,
  onViewData,
}: {
  theme: PainPointTheme;
  isExpanded: boolean;
  onToggle: () => void;
  onViewData: (themeId: string, themeName: string) => void;
}) {
  return (
    <div
      className="border rounded-xl p-5 transition-all cursor-pointer hover:shadow-md"
      style={{ borderColor: isExpanded ? "#4285F4" : "#E8EAED", background: "#fff" }}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ScopeTag scope={theme.scope} />
            <SeverityBar level={theme.severity} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-2">{theme.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {theme.apps.map((app) => (
              <AppTag key={app} app={app} />
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-gray-900">{theme.frequency || "—"}</div>
          <div className="text-xs text-gray-400">mentions</div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: "#E8EAED" }}>
          {/* View all data points CTA */}
          <div className="mb-4">
            <button
              onClick={(e) => { e.stopPropagation(); onViewData(theme.id, theme.name); }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              View {theme.frequency > 0 ? `all ${theme.frequency}` : ""} source data points
            </button>
          </div>

          {/* Quotes */}
          {theme.quotes.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                User Quotes
              </h4>
              <div className="space-y-3">
                {theme.quotes.map((q, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 italic">&ldquo;{q.text}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{q.author}</span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-400">
                        {SOURCE_LABELS[q.source] ?? q.source}
                      </span>
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitive alternatives */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Competitive Benchmark
            </h4>
            <div className="space-y-2">
              {theme.competitorAlternatives.map((alt, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50/50 rounded-lg p-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{alt.tool}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{alt.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitorSection({
  competitors,
}: {
  competitors: AnalysisSnapshot["topCompetitors"];
}) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Competitive Landscape</h2>
      <p className="text-sm text-gray-500 mb-6">
        Tools users benchmark Gemini against — and what they value most
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.slice(0, 6).map((c) => (
          <div key={c.name} className="border rounded-xl p-5" style={{ borderColor: "#E8EAED" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                {c.mentionCount} refs
              </span>
            </div>
            <ul className="space-y-2">
              {c.topReasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-amber-400 mt-0.5 shrink-0">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function StrategicSynthesis({ themes }: { themes: PainPointTheme[] }) {
  const platformThemes = themes.filter((t) => t.scope === "platform");
  const appThemes = themes.filter((t) => t.scope === "app-level");

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Strategic Synthesis</h2>
      <p className="text-sm text-gray-500 mb-6">
        Why fixing cross-app context unlocks every other feature
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Core Thesis</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          Think: you ask Gemini to summarize an email thread in Gmail, then open Docs to write the follow-up.
          Gemini starts from scratch — it has no idea you were just in Gmail. So you re-explain everything,
          or you open ChatGPT, which remembers. That&apos;s what 192 of 1,096 users did.
        </p>
        <p className="text-sm text-blue-800 leading-relaxed mt-3">
          The limit isn&apos;t Gemini&apos;s intelligence. It&apos;s that Workspace is the only suite where
          email, docs, sheets, and meetings live under one roof — and Gemini doesn&apos;t act like it yet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Platform Opportunities
          </h3>
          <div className="space-y-3">
            {platformThemes.map((t, i) => (
              <div key={t.id} className="bg-white border border-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-blue-600">P{i + 1}</span>
                  <span className="font-medium text-gray-900 text-sm">{t.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <SeverityBar level={t.severity} />
                  <span className="text-xs text-gray-400">{t.frequency} mentions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            App-Level Scope
          </h3>
          <div className="space-y-3">
            {appThemes.map((t) => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="font-medium text-gray-900 text-sm">{t.name}</span>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <SeverityBar level={t.severity} />
                  <span className="text-xs text-gray-400">{t.frequency} mentions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prioritization rationale */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Why This Prioritization</h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <span className="font-medium text-blue-600">1. Trust & Grounding</span>
            <span className="text-gray-400"> — </span>
            This is the prerequisite that multiplies every other investment. Better grounding,
            citation, and confidence calibration at the platform level lets every app team
            build more ambitious features on a reliable foundation.
          </div>
          <div>
            <span className="font-medium text-blue-600">2. Cross-App Context</span>
            <span className="text-gray-400"> — </span>
            This is Google&apos;s structural advantage — Workspace is the only suite where email, docs,
            sheets, and meetings live under one roof. A shared context layer turns this into a
            compounding moat that standalone tools can&apos;t replicate.
          </div>
          <div>
            <span className="font-medium text-blue-600">3. Mobile & Voice</span>
            <span className="text-gray-400"> — </span>
            Mobile-first workers in frontline, sales, and field roles represent a massive
            underserved segment. A voice-native AI assistant in Workspace could open
            entirely new use cases that desktop-focused competitors aren&apos;t even targeting.
          </div>
        </div>
      </div>
    </section>
  );
}

function Methodology({ snapshot }: { snapshot: AnalysisSnapshot }) {
  return (
    <section className="mt-12 pb-16">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Methodology</h2>
      <p className="text-sm text-gray-500 mb-6">How this analysis was built</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-5" style={{ borderColor: "#E8EAED" }}>
          <h3 className="font-medium text-gray-900 text-sm mb-3">Data Sources</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {Object.entries(snapshot.sources)
              .filter(([, v]) => (v ?? 0) > 0)
              .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
              .map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span>{SOURCE_LABELS[key] ?? key}</span>
                  <span className="text-gray-400 font-mono">{value}</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="border rounded-xl p-5" style={{ borderColor: "#E8EAED" }}>
          <h3 className="font-medium text-gray-900 text-sm mb-3">Analysis Approach</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Automated collection from public forums and app reviews</li>
            <li>Keyword-based theme clustering with manual curation</li>
            <li>Severity scoring based on user sentiment and business impact</li>
            <li>Competitive mapping from user-reported switching behavior</li>
          </ul>
          <div className="mt-4 pt-3 border-t text-xs text-gray-400" style={{ borderColor: "#E8EAED" }}>
            Built with Next.js, Claude AI for analysis, deployed on Vercel
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Data Drawer ──

const SOURCE_BADGE_COLORS: Record<FeedbackSource, { bg: string; text: string; label: string }> = {
  reddit: { bg: "#FFF0EC", text: "#FF4500", label: "Reddit" },
  hackernews: { bg: "#FFF3E8", text: "#FF6600", label: "Hacker News" },
  playstore: { bg: "#E8F5E9", text: "#2E7D32", label: "Play Store" },
  appstore: { bg: "#E3F2FD", text: "#0D47A1", label: "App Store" },
  stackoverflow: { bg: "#FFF8E1", text: "#F48024", label: "Stack Overflow" },
  youtube: { bg: "#FFEBEE", text: "#C62828", label: "YouTube" },
  curated: { bg: "#F3F4F6", text: "#4B5563", label: "Curated" },
};

function SourceBadge({ source }: { source: FeedbackSource }) {
  const colors = SOURCE_BADGE_COLORS[source] ?? { bg: "#F3F4F6", text: "#4B5563", label: source };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: colors.bg, color: colors.text }}
    >
      {colors.label}
    </span>
  );
}

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
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/workspace-ai-gaps/api/feedback?themeId=${encodeURIComponent(themeId)}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data. Please try again.");
        setLoading(false);
      });
  }, [themeId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
        style={{ borderLeft: "1px solid #E8EAED" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E8EAED" }}>
          <div>
            <h3 className="font-semibold text-gray-900">{themeName}</h3>
            {total !== null && (
              <p className="text-xs text-gray-500 mt-0.5">{total} matching data points</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={RAW_DATA_URL}
              download
              className="text-xs text-blue-500 hover:underline"
            >
              ↓ Download all
            </a>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 mt-4">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-gray-400 mt-4">No data points found for this theme yet. Run the scraper to populate live data.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SourceBadge source={item.source} />
                      <span className="text-xs text-gray-400">{item.author}</span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
                  <div className="flex items-center justify-between mt-3">
                    {item.score > 0 && (
                      <span className="text-xs text-gray-400">↑ {item.score}</span>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline ml-auto"
                    >
                      View source →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between" style={{ borderColor: "#E8EAED" }}>
          <a
            href="/workspace-ai-gaps/methodology"
            className="text-xs text-blue-500 hover:underline"
          >
            How this data was collected →
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            View code on GitHub
          </a>
        </div>
      </div>
    </>
  );
}

// ── Heatmap ──

function AppHeatmap({ themes }: { themes: PainPointTheme[] }) {
  const apps: WorkspaceApp[] = ["gmail", "docs", "sheets", "slides", "meet", "drive", "calendar", "general"];

  const appScores: Record<string, number> = {};
  for (const app of apps) {
    appScores[app] = themes
      .filter((t) => t.apps.includes(app))
      .reduce((sum, t) => sum + t.severity * Math.max(t.frequency, 1), 0);
  }
  const maxScore = Math.max(...Object.values(appScores), 1);

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
      {apps.map((app) => {
        const intensity = appScores[app] / maxScore;
        const issueCount = themes.filter((t) => t.apps.includes(app)).length;
        return (
          <div key={app} className="text-center">
            <div
              className="rounded-lg p-3 mb-1 transition-colors"
              style={{
                background: `rgba(66, 133, 244, ${0.08 + intensity * 0.42})`,
              }}
            >
              <div className="text-lg font-bold" style={{ color: `rgba(66, 133, 244, ${0.4 + intensity * 0.6})` }}>
                {issueCount}
              </div>
            </div>
            <div className="text-xs text-gray-500">{APP_LABELS[app]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ──

export function Dashboard({ snapshot }: { snapshot: AnalysisSnapshot }) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [filterApp, setFilterApp] = useState<WorkspaceApp | "all">("all");
  const [filterScope, setFilterScope] = useState<"all" | "platform" | "app-level">("all");
  const [drawerTheme, setDrawerTheme] = useState<{ id: string; name: string } | null>(null);

  const filteredThemes = snapshot.themes.filter((t) => {
    if (filterApp !== "all" && !t.apps.includes(filterApp)) return false;
    if (filterScope !== "all" && t.scope !== filterScope) return false;
    return true;
  });

  const platformCount = snapshot.themes.filter((t) => t.scope === "platform").length;
  const totalMentions = snapshot.themes.reduce((s, t) => s + t.frequency, 0);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      {drawerTheme && (
        <DataDrawer
          themeId={drawerTheme.id}
          themeName={drawerTheme.name}
          onClose={() => setDrawerTheme(null)}
        />
      )}
      {/* Hero */}
      <header className="bg-white border-b" style={{ borderColor: "#E8EAED" }}>
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium tracking-wider uppercase text-gray-400">
              Product Analysis
            </span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-400">
              Last analyzed {new Date(snapshot.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Where Gemini for Workspace Can Win Next
          </h1>
          <p className="text-lg text-gray-500 mt-3 max-w-2xl">
            A data-driven opportunity map across Google Workspace AI surfaces —
            built from {snapshot.totalFeedback.toLocaleString()}+ public user signals.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5">
            <a
              href="https://www.linkedin.com/in/hannahschlacter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Hannah Schlacter
            </a>
            <span className="text-gray-300 hidden md:inline">|</span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Code on GitHub
            </a>
            <a
              href={RAW_DATA_URL}
              download
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Raw data (JSON)
            </a>
            <a
              href="/workspace-ai-gaps/methodology"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              Methodology →
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{snapshot.totalFeedback}</div>
              <div className="text-xs text-gray-500 mt-0.5">Data points analyzed</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{snapshot.themes.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Opportunity themes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{platformCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Platform-level opportunities</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-500">{snapshot.topCompetitors.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Competitive benchmarks</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Interactive Charts */}
        <ChartsSection
          snapshot={snapshot}
          onAppFilter={(app) => setFilterApp(app)}
        />

        {/* Pain Point Explorer */}
        <section className="mt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Opportunity Explorer</h2>
              <p className="text-sm text-gray-500 mt-0.5">Click any theme to see user signals and competitive benchmarks</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterApp}
                onChange={(e) => setFilterApp(e.target.value as WorkspaceApp | "all")}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white text-gray-700"
                style={{ borderColor: "#E8EAED" }}
              >
                <option value="all">All Apps</option>
                {(Object.keys(APP_LABELS) as WorkspaceApp[]).map((app) => (
                  <option key={app} value={app}>
                    {APP_LABELS[app]}
                  </option>
                ))}
              </select>
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value as "all" | "platform" | "app-level")}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white text-gray-700"
                style={{ borderColor: "#E8EAED" }}
              >
                <option value="all">All Scopes</option>
                <option value="platform">Platform-Level</option>
                <option value="app-level">App-Level</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isExpanded={expandedTheme === theme.id}
                onToggle={() =>
                  setExpandedTheme(expandedTheme === theme.id ? null : theme.id)
                }
                onViewData={(id, name) => setDrawerTheme({ id, name })}
              />
            ))}
            {filteredThemes.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No themes match the current filters.
              </div>
            )}
          </div>
        </section>

        {/* Competitive Landscape */}
        <CompetitorSection competitors={snapshot.topCompetitors} />

        {/* Strategic Synthesis */}
        <StrategicSynthesis themes={snapshot.themes} />

        {/* Methodology */}
        <Methodology snapshot={snapshot} />
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 py-8 text-center" style={{ borderColor: "#E8EAED" }}>
        <p className="text-xs text-gray-400">
          Built by{" "}
          <a
            href="https://schlacter.me"
            className="text-blue-500 hover:underline"
          >
            Hannah Schlacter
          </a>{" "}
          — Product Manager
        </p>
        <p className="text-xs text-gray-300 mt-1">
          Data sourced from public forums. Analysis assisted by AI.
        </p>
      </footer>
    </div>
  );
}
