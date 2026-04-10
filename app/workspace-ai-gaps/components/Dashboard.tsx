"use client";

import { useState } from "react";
import type { AnalysisSnapshot, PainPointTheme, WorkspaceApp } from "@/lib/workspace-ai";
import { ChartsSection } from "./Charts";

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
}: {
  theme: PainPointTheme;
  isExpanded: boolean;
  onToggle: () => void;
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

  const filteredThemes = snapshot.themes.filter((t) => {
    if (filterApp !== "all" && !t.apps.includes(filterApp)) return false;
    if (filterScope !== "all" && t.scope !== filterScope) return false;
    return true;
  });

  const platformCount = snapshot.themes.filter((t) => t.scope === "platform").length;
  const totalMentions = snapshot.themes.reduce((s, t) => s + t.frequency, 0);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
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
          <div className="flex items-center gap-2 mt-5">
            <a
              href="https://www.linkedin.com/in/hannahschlacter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Hannah Schlacter
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400">PM who ships</span>
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
