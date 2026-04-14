"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AnalysisSnapshot,
  FeedbackSource,
  RawFeedback,
  Theme,
  Vendor,
} from "@/lib/cohere-experience";

const EXPORT_URL = "/cohere-developer-experience/api/export";

const VENDOR_META: Record<Vendor, { label: string; color: string; accent: string }> = {
  cohere: { label: "Cohere", color: "#D48A6A", accent: "#FBEEDC" },
  openai: { label: "OpenAI", color: "#10A37F", accent: "#E2F5EE" },
  anthropic: { label: "Anthropic", color: "#C15F3C", accent: "#F9E9DF" },
};

const SOURCE_META: Record<FeedbackSource, { label: string; bg: string; text: string }> = {
  reddit: { label: "Reddit", bg: "#FFF0EC", text: "#FF4500" },
  hackernews: { label: "HN", bg: "#FFF3E8", text: "#FF6600" },
  github: { label: "GitHub", bg: "#F3F4F6", text: "#111827" },
  stackoverflow: { label: "Stack Overflow", bg: "#FFF8E1", text: "#F48024" },
  curated: { label: "Curated", bg: "#F3F4F6", text: "#4B5563" },
};

const STANCE_META: Record<Theme["cohereStance"], { label: string; bg: string; text: string }> = {
  ahead: { label: "Cohere ahead", bg: "#E7F6EF", text: "#0C7A4D" },
  at_parity: { label: "Cohere at parity", bg: "#F3F4F6", text: "#4B5563" },
  behind: { label: "Cohere behind", bg: "#FDECEA", text: "#B42318" },
};

function SeverityBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-2 w-4 rounded-sm"
          style={{
            background:
              i <= level ? (level >= 4 ? "#D48A6A" : level >= 3 ? "#F4C27B" : "#8FC9A6") : "#E8EAED",
          }}
        />
      ))}
    </div>
  );
}

function StanceBadge({ stance }: { stance: Theme["cohereStance"] }) {
  const m = STANCE_META[stance];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: m.bg, color: m.text }}
    >
      {m.label}
    </span>
  );
}

function VendorBadge({ vendor, frequency, sentiment }: { vendor: Vendor; frequency: number; sentiment: "ahead" | "at_parity" | "behind" }) {
  const m = VENDOR_META[vendor];
  const arrow = sentiment === "ahead" ? "↑" : sentiment === "behind" ? "↓" : "·";
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium"
      style={{ background: m.accent, color: m.color }}
    >
      <span>{m.label}</span>
      <span className="text-[10px] opacity-70">{arrow} {frequency}</span>
    </div>
  );
}

function VendorColumn({
  vendor,
  signal,
}: {
  vendor: Vendor;
  signal: Theme["vendors"][Vendor];
}) {
  const m = VENDOR_META[vendor];
  return (
    <div className="border rounded-xl p-4 bg-white flex flex-col gap-3" style={{ borderColor: "#E8EAED" }}>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: m.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
          {m.label}
        </span>
        <span className="text-xs text-gray-400">{signal.frequency} signals</span>
      </div>
      {signal.quotes.length === 0 && (
        <p className="text-xs text-gray-400 italic">No matching signals yet.</p>
      )}
      {signal.quotes.slice(0, 2).map((q, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-700 leading-relaxed italic">&ldquo;{q.text}&rdquo;</p>
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-[10px] text-gray-400">{q.author}</span>
            <a
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-orange-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {SOURCE_META[q.source]?.label ?? q.source} →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function ThemeCard({
  theme,
  isExpanded,
  onToggle,
  onViewData,
}: {
  theme: Theme;
  isExpanded: boolean;
  onToggle: () => void;
  onViewData: (themeId: string, themeName: string) => void;
}) {
  return (
    <div
      className="border rounded-xl p-5 transition-all cursor-pointer hover:shadow-md"
      style={{ borderColor: isExpanded ? "#D48A6A" : "#E8EAED", background: "#fff" }}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StanceBadge stance={theme.cohereStance} />
            <SeverityBar level={theme.severity} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(["cohere", "openai", "anthropic"] as Vendor[]).map((v) => (
              <VendorBadge
                key={v}
                vendor={v}
                frequency={theme.vendors[v].frequency}
                sentiment={theme.vendors[v].sentiment}
              />
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-gray-900">{theme.totalFrequency || "—"}</div>
          <div className="text-xs text-gray-400">total signals</div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t space-y-5" style={{ borderColor: "#E8EAED" }}>
          {/* Three-way comparison */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              How developers talk about each vendor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["cohere", "openai", "anthropic"] as Vendor[]).map((v) => (
                <VendorColumn key={v} vendor={v} signal={theme.vendors[v]} />
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-2">
              What I&apos;d do on the Platform Experience team
            </h4>
            <p className="text-sm text-orange-900 leading-relaxed">{theme.recommendation}</p>
          </div>

          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewData(theme.id, theme.name);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              View {theme.totalFrequency > 0 ? `all ${theme.totalFrequency}` : ""} source signals
            </button>
          </div>
        </div>
      )}
    </div>
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
  const [vendorFilter, setVendorFilter] = useState<Vendor | "all">("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = `/cohere-developer-experience/api/feedback?themeId=${encodeURIComponent(themeId)}${
      vendorFilter !== "all" ? `&vendor=${vendorFilter}` : ""
    }`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data.");
        setLoading(false);
      });
  }, [themeId, vendorFilter]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
        style={{ borderLeft: "1px solid #E8EAED" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E8EAED" }}>
          <div>
            <h3 className="font-semibold text-gray-900">{themeName}</h3>
            {total !== null && (
              <p className="text-xs text-gray-500 mt-0.5">{total} matching signals</p>
            )}
          </div>
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

        <div className="px-6 py-3 border-b flex gap-2" style={{ borderColor: "#E8EAED" }}>
          {(["all", "cohere", "openai", "anthropic"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                vendorFilter === v ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {v === "all" ? "All vendors" : VENDOR_META[v].label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-gray-400 mt-4">No signals match this filter yet.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item) => {
                const m = VENDOR_META[item.vendor];
                const sm = SOURCE_META[item.source];
                return (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: m.accent, color: m.color }}
                        >
                          {m.label}
                        </span>
                        {sm && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: sm.bg, color: sm.text }}
                          >
                            {sm.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-300">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{item.text}</p>
                    <div className="flex items-center justify-between mt-3">
                      {item.score > 0 && <span className="text-xs text-gray-400">↑ {item.score}</span>}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-500 hover:underline ml-auto"
                      >
                        View source →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function Dashboard({ snapshot }: { snapshot: AnalysisSnapshot }) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [stanceFilter, setStanceFilter] = useState<"all" | Theme["cohereStance"]>("all");
  const [drawerTheme, setDrawerTheme] = useState<{ id: string; name: string } | null>(null);

  const filteredThemes = snapshot.themes.filter((t) => {
    if (stanceFilter !== "all" && t.cohereStance !== stanceFilter) return false;
    return true;
  });

  const aheadCount = snapshot.themes.filter((t) => t.cohereStance === "ahead").length;
  const behindCount = snapshot.themes.filter((t) => t.cohereStance === "behind").length;

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
              Developer Experience Audit
            </span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-400">
              Updated{" "}
              {new Date(snapshot.lastUpdated).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Where developers pick Cohere — and where they pick its competitors
          </h1>
          <p className="text-lg text-gray-500 mt-3 max-w-2xl">
            A three-way sentiment map comparing how developers actually talk about{" "}
            <span className="font-medium" style={{ color: VENDOR_META.cohere.color }}>Cohere</span>,{" "}
            <span className="font-medium" style={{ color: VENDOR_META.openai.color }}>OpenAI</span>, and{" "}
            <span className="font-medium" style={{ color: VENDOR_META.anthropic.color }}>Anthropic</span>{" "}
            across the six surfaces that drive platform adoption.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5">
            <a
              href="https://www.linkedin.com/in/hannahschlacter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:underline"
            >
              Hannah Schlacter
            </a>
            <span className="text-gray-300 hidden md:inline">|</span>
            <a
              href="/cohere"
              className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              View tailored resume →
            </a>
            <a
              href={EXPORT_URL}
              download
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Raw data (JSON)
            </a>
          </div>

          {/* Thesis */}
          <div className="mt-8 bg-orange-50 border border-orange-100 rounded-xl p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-2">
              Thesis
            </div>
            <p className="text-sm text-orange-900 leading-relaxed">{snapshot.thesis}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{snapshot.totalFeedback}</div>
              <div className="text-xs text-gray-500 mt-0.5">Developer signals</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{snapshot.themes.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Platform surfaces</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold" style={{ color: "#0C7A4D" }}>{aheadCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Where Cohere is ahead</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold" style={{ color: "#B42318" }}>{behindCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Where Cohere is behind</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* Vendor mix */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Signal mix</h2>
          <p className="text-sm text-gray-500 mb-5">
            Developer mentions captured per vendor in this snapshot.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["cohere", "openai", "anthropic"] as Vendor[]).map((v) => {
              const m = VENDOR_META[v];
              const count = snapshot.byVendor[v];
              return (
                <div key={v} className="border rounded-xl p-5 bg-white" style={{ borderColor: "#E8EAED" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                    <span className="font-semibold text-gray-900">{m.label}</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: m.color }}>
                    {count}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">signals</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Explorer */}
        <section className="mt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Surface-by-surface comparison</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Click any surface to see how developers talk about all three vendors side-by-side.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={stanceFilter}
                onChange={(e) => setStanceFilter(e.target.value as "all" | Theme["cohereStance"])}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white text-gray-700"
                style={{ borderColor: "#E8EAED" }}
              >
                <option value="all">All surfaces</option>
                <option value="ahead">Where Cohere is ahead</option>
                <option value="at_parity">At parity</option>
                <option value="behind">Where Cohere is behind</option>
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
                No surfaces match the current filter.
              </div>
            )}
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-12 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-1">How I built this</h2>
          <p className="text-sm text-gray-500 mb-6">
            Same architecture I&apos;ve used for two other PM applications — forked and pointed at Cohere.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5 bg-white" style={{ borderColor: "#E8EAED" }}>
              <h3 className="font-medium text-gray-900 text-sm mb-3">Sources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {Object.entries(snapshot.sources)
                  .filter(([, v]) => (v ?? 0) > 0)
                  .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                  .map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span>{SOURCE_META[key as FeedbackSource]?.label ?? key}</span>
                      <span className="text-gray-400 font-mono">{value}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="border rounded-xl p-5 bg-white" style={{ borderColor: "#E8EAED" }}>
              <h3 className="font-medium text-gray-900 text-sm mb-3">Approach</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Six surfaces scoped from Cohere&apos;s Platform Experience & Developer Product JD</li>
                <li>Public signals from Reddit, Hacker News, GitHub Issues, Stack Overflow</li>
                <li>Keyword-cluster matching to surface where each vendor dominates</li>
                <li>Cohere stance scored relative to OpenAI + Anthropic on each surface</li>
                <li>Refreshable via authenticated POST to <code className="text-xs bg-gray-100 px-1 rounded">/api/scrape</code></li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t mt-8 py-8 text-center" style={{ borderColor: "#E8EAED" }}>
        <p className="text-xs text-gray-400">
          Built by{" "}
          <a href="https://schlacter.me" className="text-orange-500 hover:underline">
            Hannah Schlacter
          </a>{" "}
          — for Cohere&apos;s Platform Experience & Developer Product team
        </p>
      </footer>
    </div>
  );
}
