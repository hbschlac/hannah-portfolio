"use client";

import type { AnalysisSnapshot, PainPointTheme, WorkspaceApp } from "@/lib/workspace-ai";
import { useState } from "react";

const SCOPE_COLORS = {
  platform: "#4285F4",
  "app-level": "#9AA0A6",
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  hackernews: "#FF6600",
  stackoverflow: "#F48024",
  appstore: "#007AFF",
  youtube: "#FF0000",
  playstore: "#34A853",
  curated: "#9AA0A6",
};

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  stackoverflow: "Stack Overflow",
  appstore: "App Store",
  youtube: "YouTube",
  playstore: "Play Store",
  curated: "Industry Reports",
};

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

// ── Bubble Chart (pure SVG) ──

function BubbleChart({ themes }: { themes: PainPointTheme[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxFreq = Math.max(...themes.map((t) => t.frequency), 1);
  const W = 600, H = 320, PAD = 50;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Severity vs. Frequency</h3>
      <p className="text-xs text-gray-400 mb-3">Bubble size = mention count. Blue = platform-level.</p>
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map((y) => (
            <line
              key={`h-${y}`}
              x1={PAD} y1={H - PAD - ((y / 5) * (H - 2 * PAD))}
              x2={W - PAD} y2={H - PAD - ((y / 5) * (H - 2 * PAD))}
              stroke="#f0f0f0" strokeDasharray="4 4"
            />
          ))}
          {/* Axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#ddd" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#ddd" />
          {/* Y labels */}
          {[1, 2, 3, 4, 5].map((y) => (
            <text key={`yl-${y}`} x={PAD - 8} y={H - PAD - ((y / 5) * (H - 2 * PAD)) + 4} textAnchor="end" fontSize={10} fill="#9AA0A6">{y}</text>
          ))}
          <text x={14} y={H / 2} textAnchor="middle" fontSize={10} fill="#9AA0A6" transform={`rotate(-90, 14, ${H / 2})`}>Severity</text>
          <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="#9AA0A6">Mentions</text>
          {/* Bubbles */}
          {themes.map((t) => {
            const x = PAD + (t.frequency / maxFreq) * (W - 2 * PAD);
            const y = H - PAD - ((t.severity / 5) * (H - 2 * PAD));
            const r = 12 + (t.frequency / maxFreq) * 30;
            const isHov = hovered === t.id;
            return (
              <g key={t.id} onMouseEnter={() => setHovered(t.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                <circle cx={x} cy={y} r={r} fill={SCOPE_COLORS[t.scope]} fillOpacity={isHov ? 0.9 : 0.55} stroke={SCOPE_COLORS[t.scope]} strokeWidth={isHov ? 2 : 1} />
                <text x={x} y={y + 3} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={600}>{t.frequency}</text>
              </g>
            );
          })}
        </svg>
        {/* Tooltip */}
        {hovered && (() => {
          const t = themes.find((th) => th.id === hovered);
          if (!t) return null;
          return (
            <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs z-10">
              <p className="font-semibold text-sm text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500 mt-1">{t.description}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-600">
                <span>Severity: <strong>{t.severity}/5</strong></span>
                <span>Mentions: <strong>{t.frequency}</strong></span>
              </div>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${t.scope === "platform" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {t.scope === "platform" ? "AI Foundations" : "App-Level"}
              </span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Source Donut (pure CSS) ──

function SourceDonut({ sources }: { sources: AnalysisSnapshot["sources"] }) {
  const data = Object.entries(sources)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([key, value]) => ({
      key,
      label: SOURCE_LABELS[key] ?? key,
      value: value ?? 0,
      color: SOURCE_COLORS[key] ?? "#ccc",
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  // Build conic gradient segments
  let cumPercent = 0;
  const gradientStops = data.map((d) => {
    const start = cumPercent;
    cumPercent += (d.value / total) * 100;
    return `${d.color} ${start}% ${cumPercent}%`;
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Data Sources</h3>
      <p className="text-xs text-gray-400 mb-4">{total.toLocaleString()} data points across {data.length} sources</p>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0">
          <div
            className="w-32 h-32 rounded-full"
            style={{
              background: `conic-gradient(${gradientStops.join(", ")})`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{data.length}</div>
                <div className="text-[10px] text-gray-400">sources</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 flex-1">
          {data.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-gray-600 flex-1">{d.label}</span>
              <span className="text-gray-400 font-mono tabular-nums">{d.value}</span>
              <span className="text-gray-300 w-8 text-right">{((d.value / total) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App Pain Bar Chart (pure CSS) ──

function AppPainBars({
  themes,
  onAppClick,
}: {
  themes: PainPointTheme[];
  onAppClick: (app: WorkspaceApp) => void;
}) {
  const apps: WorkspaceApp[] = ["gmail", "docs", "sheets", "slides", "meet", "drive", "calendar", "chat", "general"];

  const data = apps.map((app) => {
    const relevant = themes.filter((t) => t.apps.includes(app));
    const platform = relevant.filter((t) => t.scope === "platform").reduce((s, t) => s + t.frequency, 0);
    const appLevel = relevant.filter((t) => t.scope === "app-level").reduce((s, t) => s + t.frequency, 0);
    return { app, label: APP_LABELS[app], platform, appLevel, total: platform + appLevel };
  }).filter((d) => d.total > 0).sort((a, b) => b.total - a.total);

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Pain by App Surface</h3>
      <p className="text-xs text-gray-400 mb-4">Click a bar to filter the explorer below. Blue = platform, gray = app-level.</p>
      <div className="space-y-2">
        {data.map((d) => (
          <button
            key={d.app}
            onClick={() => onAppClick(d.app)}
            className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-1.5 transition-colors group"
          >
            <span className="text-xs text-gray-600 w-16 shrink-0">{d.label}</span>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-500 transition-all group-hover:bg-blue-600"
                style={{ width: `${(d.platform / max) * 100}%` }}
              />
              <div
                className="h-full bg-gray-300 transition-all group-hover:bg-gray-400"
                style={{ width: `${(d.appLevel / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">{d.total}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Platform</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> App-Level</span>
      </div>
    </div>
  );
}

// ── Impact Score Bars ──

function ImpactBars({ themes }: { themes: PainPointTheme[] }) {
  const data = themes
    .map((t) => ({ ...t, impact: t.severity * t.frequency }))
    .sort((a, b) => b.impact - a.impact);
  const maxImpact = Math.max(...data.map((d) => d.impact), 1);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Impact Score (Severity x Frequency)</h3>
      <p className="text-xs text-gray-400 mb-4">Combined urgency ranking — higher = more critical for the team</p>
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-36 shrink-0 truncate" title={d.name}>{d.name}</span>
            <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(d.impact / maxImpact) * 100}%`,
                  background: d.scope === "platform"
                    ? "linear-gradient(90deg, #4285F4, #1a73e8)"
                    : "linear-gradient(90deg, #DADCE0, #BDC1C6)",
                }}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-xs font-medium" style={{ color: d.scope === "platform" ? "#1a73e8" : "#5F6368" }}>
                {d.impact.toLocaleString()}
              </span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${d.scope === "platform" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
              {d.scope === "platform" ? "Platform" : "App"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Charts Section ──

export function ChartsSection({
  snapshot,
  onAppFilter,
}: {
  snapshot: AnalysisSnapshot;
  onAppFilter: (app: WorkspaceApp | "all") => void;
}) {
  const [activeChart, setActiveChart] = useState<"bubble" | "apps" | "impact">("bubble");

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Interactive Analysis</h2>
          <p className="text-sm text-gray-500 mt-0.5">Explore the data visually</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source donut — always visible */}
        <div className="border rounded-xl p-5 bg-white" style={{ borderColor: "#E8EAED" }}>
          <SourceDonut sources={snapshot.sources} />
        </div>

        {/* Switchable chart area */}
        <div className="lg:col-span-2 border rounded-xl p-5 bg-white" style={{ borderColor: "#E8EAED" }}>
          <div className="flex gap-1 mb-4">
            {(["bubble", "apps", "impact"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveChart(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeChart === tab
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab === "bubble" ? "Severity vs Frequency" : tab === "apps" ? "By App" : "Impact Score"}
              </button>
            ))}
          </div>

          {activeChart === "bubble" && <BubbleChart themes={snapshot.themes} />}
          {activeChart === "apps" && <AppPainBars themes={snapshot.themes} onAppClick={(app) => onAppFilter(app)} />}
          {activeChart === "impact" && <ImpactBars themes={snapshot.themes} />}
        </div>
      </div>
    </section>
  );
}
