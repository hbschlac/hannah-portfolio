import type { Metadata } from "next";
import Link from "next/link";
import statsJson from "../../public/vibe-check-stats.json";

export const metadata: Metadata = {
  title: "Vibe Check — schlacter.me",
  description:
    "Hours coded ≠ good code. An honest, self-graded report card of my vibe coding.",
};

type Example = Record<string, unknown>;
type Metric = {
  value: string;
  score: number;
  caption: string;
  examples?: Example[];
  examples_label?: string;
  how_to_improve?: string;
  raw?: Record<string, unknown>;
};
type Theme = {
  label: string;
  blurb: string;
  emoji: string;
  metric_keys: string[];
  score: number;
  weakest_metric?: string;
  weakest_score?: number;
};
type Stats = {
  generated_at: string;
  window_days: number;
  vibe_score: number;
  verdict: string;
  biggest_lever?: string;
  themes: Record<string, Theme>;
  metrics: Record<string, Metric>;
  repos_scanned: number;
};

const stats = statsJson as Stats;

const METRIC_LABELS: Record<string, string> = {
  broken_in_prod: "Broken in prod",
  uptime: "Live site latency",
  mttf: "Mean time to fix",
  fix_to_feature: "Fix-to-feature ratio",
  reverts: "Revert / oops count",
  debug_spiral: "Longest debug spiral",
  test_coverage: "Test coverage",
  todos: "TODOs left in code",
  secrets_blocked: "Secret protection",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTs(ts: number | undefined): string {
  if (!ts) return "";
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(score: number): string {
  if (score >= 75) return "#2E7D32";
  if (score >= 60) return "#558B2F";
  if (score >= 40) return "#F57C00";
  return "#C62828";
}

function scoreBigColor(score: number): string {
  if (score >= 60) return "#2E7D32";
  if (score >= 35) return "#F57C00";
  return "#C62828";
}

function renderExample(metricKey: string, ex: Example, i: number) {
  const dateStr =
    typeof ex.ts === "number"
      ? fmtTs(ex.ts)
      : typeof ex.date === "string"
      ? ex.date
      : "";

  if (metricKey === "broken_in_prod") {
    return (
      <li key={i} className="text-xs leading-relaxed">
        <span className="font-mono" style={{ color: "#C62828" }}>
          {String(ex.sha)}
        </span>{" "}
        <span style={{ color: "#1A1A1A" }}>{String(ex.msg)}</span>
        <div className="mt-0.5" style={{ color: "#8A8A8A" }}>
          patched{" "}
          <span className="font-mono">{String(ex.broke_sha)}</span> &quot;
          {String(ex.broke)}&quot; after {String(ex.gap_hours)}h
          {ex.repo ? ` · ${ex.repo}` : ""}
          {dateStr ? ` · ${dateStr}` : ""}
        </div>
      </li>
    );
  }

  if (metricKey === "uptime") {
    return (
      <li key={i} className="text-xs flex justify-between gap-3">
        <span style={{ color: "#1A1A1A" }}>{String(ex.url)}</span>
        <span style={{ color: "#5C5C5C" }}>
          {String(ex.status)} · {String(ex.ttfb_ms)}ms
        </span>
      </li>
    );
  }

  if (metricKey === "debug_spiral") {
    return (
      <li key={i} className="text-xs leading-relaxed">
        <span style={{ color: "#1A1A1A" }}>
          {String(ex.hours)}h in {String(ex.project)}
        </span>
        <span style={{ color: "#8A8A8A" }}>
          {" "}
          · session {String(ex.session)} · {String(ex.date)}
        </span>
      </li>
    );
  }

  if (metricKey === "test_coverage" || metricKey === "secrets_blocked") {
    return (
      <li key={i} className="text-xs">
        <span style={{ color: "#1A1A1A" }}>{String(ex.repo)}</span>
        {ex.patterns ? (
          <span style={{ color: "#5C5C5C" }}>
            {" — "}
            {(ex.patterns as string[]).join(", ")}
          </span>
        ) : ex.reason ? (
          <span style={{ color: "#8A8A8A" }}> — {String(ex.reason)}</span>
        ) : null}
      </li>
    );
  }

  if (metricKey === "todos") {
    return (
      <li key={i} className="text-xs leading-relaxed">
        <span className="font-mono" style={{ color: "#5C5C5C" }}>
          {String(ex.repo)}/{String(ex.file)}:{String(ex.line)}
        </span>
        <div style={{ color: "#1A1A1A" }} className="mt-0.5 font-mono">
          {String(ex.snippet)}
        </div>
      </li>
    );
  }

  if (metricKey === "mttf") {
    return (
      <li key={i} className="text-xs leading-relaxed">
        <span style={{ color: "#1A1A1A" }}>{String(ex.hours)}h</span>{" "}
        <span className="font-mono" style={{ color: "#8A8A8A" }}>
          {String(ex.sha)}
        </span>{" "}
        <span style={{ color: "#1A1A1A" }}>{String(ex.msg)}</span>
        <div style={{ color: "#8A8A8A" }}>
          {String(ex.repo)} · {dateStr}
        </div>
      </li>
    );
  }

  // default: commit-like
  return (
    <li key={i} className="text-xs leading-relaxed">
      <span className="font-mono" style={{ color: "#8A8A8A" }}>
        {String(ex.sha)}
      </span>{" "}
      <span style={{ color: "#1A1A1A" }}>{String(ex.msg)}</span>
      <div style={{ color: "#8A8A8A" }}>
        {String(ex.repo)}
        {dateStr ? ` · ${dateStr}` : ""}
      </div>
    </li>
  );
}

function MetricCard({
  metricKey,
  metric,
}: {
  metricKey: string;
  metric: Metric;
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-4 py-2 transition-opacity group-hover:opacity-70">
          <div className="min-w-0">
            <p className="text-sm">
              {METRIC_LABELS[metricKey] ?? metricKey}
              <span
                className="ml-2 text-xs"
                style={{ color: "#8A8A8A" }}
              >
                ⌄
              </span>
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "#8A8A8A" }}>
              {metric.caption}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base" style={{ color: "#1A1A1A" }}>
              {metric.value}
            </p>
            <p className="text-xs" style={{ color: scoreColor(metric.score) }}>
              {metric.score}/100
            </p>
          </div>
        </div>
      </summary>
      <div
        className="mt-3 mb-2 pl-3 ml-1 space-y-3"
        style={{ borderLeft: "2px solid #E8E4DC" }}
      >
        {metric.examples && metric.examples.length > 0 && (
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: "#8A8A8A" }}
            >
              {metric.examples_label ?? "Examples"}
            </p>
            <ul className="space-y-2">
              {metric.examples.map((ex, i) => renderExample(metricKey, ex, i))}
            </ul>
          </div>
        )}
        {metric.how_to_improve && (
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: "#8A8A8A" }}
            >
              How to fix it
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "#1A1A1A" }}
            >
              {metric.how_to_improve}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

export default function VibeCheckPage() {
  const {
    vibe_score,
    verdict,
    biggest_lever,
    themes,
    metrics,
    generated_at,
    window_days,
    repos_scanned,
  } = stats;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F8F6F2", color: "#1A1A1A" }}
    >
      <main className="max-w-3xl mx-auto w-full px-6 pt-16 pb-16">
        <Link
          href="/"
          className="text-xs transition-opacity hover:opacity-50"
          style={{ color: "#8A8A8A" }}
        >
          ← schlacter.me
        </Link>

        <p
          className="text-xs tracking-widest uppercase mt-10"
          style={{ color: "#1A1A1A" }}
        >
          Vibe Check
        </p>
        <h1 className="text-2xl mt-2">am i any good at this?</h1>
        <p
          className="text-sm mt-4 leading-relaxed"
          style={{ color: "#5C5C5C" }}
        >
          Anyone can hold down a camera shutter. Doesn&apos;t make them a
          photographer. Anyone can vibe code. Doesn&apos;t make them a software
          engineer. This page is an honest, self-graded report card of how much
          my vibe coding actually holds up.
        </p>

        {/* Vibe Score — clickable */}
        <details
          className="mt-12 rounded-2xl p-10 group"
          style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
        >
          <summary className="cursor-pointer list-none text-center">
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: "#8A8A8A" }}
            >
              Vibe Score
            </p>
            <div
              className="text-7xl font-light mt-3"
              style={{ color: scoreBigColor(vibe_score) }}
            >
              {vibe_score}
            </div>
            <p className="text-base mt-2" style={{ color: "#1A1A1A" }}>
              {verdict}
            </p>
            <p className="text-xs mt-3" style={{ color: "#8A8A8A" }}>
              click for how this number gets made →
            </p>
          </summary>
          <div className="mt-6 pt-6 text-left" style={{ borderTop: "1px solid #E8E4DC" }}>
            <p
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: "#8A8A8A" }}
            >
              How {vibe_score} gets calculated
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#1A1A1A" }}>
              Average of three theme scores below. Each theme = average of 3
              sub-metrics. Each metric scored 0–100 (higher = better) against a
              clear threshold (e.g. 0 fix commits = 100, 80% fix commits = 0).
            </p>
            <div
              className="mt-4 grid grid-cols-3 gap-3 text-center text-xs"
              style={{ color: "#5C5C5C" }}
            >
              {Object.entries(themes).map(([k, t]) => (
                <div
                  key={k}
                  className="rounded p-3"
                  style={{ background: "#F8F6F2" }}
                >
                  <div
                    className="text-2xl font-light"
                    style={{ color: scoreColor(t.score) }}
                  >
                    {t.score}
                  </div>
                  <div className="mt-1">{t.emoji}</div>
                </div>
              ))}
            </div>
            <p
              className="text-xs mt-4 leading-relaxed"
              style={{ color: "#5C5C5C" }}
            >
              ({themes.does_it_work.score} +{" "}
              {themes.do_i_know.score} +{" "}
              {themes.any_mess.score}) ÷ 3 = {vibe_score}
            </p>
            {biggest_lever && (
              <div
                className="mt-5 p-3 rounded text-xs"
                style={{
                  background: "#FFF8E1",
                  border: "1px solid #F0E0A8",
                  color: "#5C5C5C",
                }}
              >
                <span className="uppercase tracking-wider" style={{ color: "#8A8A8A" }}>
                  Biggest lever to pull →
                </span>{" "}
                <span style={{ color: "#1A1A1A" }}>
                  {METRIC_LABELS[biggest_lever] ?? biggest_lever}
                </span>
                <span style={{ color: "#5C5C5C" }}>
                  {" "}
                  ({metrics[biggest_lever]?.score}/100). Open it below for how to fix.
                </span>
              </div>
            )}
          </div>
        </details>

        {/* Themes */}
        <div className="mt-10 space-y-6">
          {Object.entries(themes).map(([key, theme]) => (
            <details
              key={key}
              className="rounded-xl p-6 group"
              style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
              open
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-base">
                      <span className="mr-2">{theme.emoji}</span>
                      {theme.label}
                      <span
                        className="ml-2 text-xs"
                        style={{ color: "#8A8A8A" }}
                      >
                        ⌄
                      </span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
                      {theme.blurb}
                    </p>
                  </div>
                  <div
                    className="text-3xl font-light"
                    style={{ color: scoreColor(theme.score) }}
                  >
                    {theme.score}
                  </div>
                </div>
              </summary>
              <div className="mt-5">
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: "#5C5C5C" }}
                >
                  Average of {theme.metric_keys.length} metrics below.
                  {theme.weakest_metric && (
                    <>
                      {" "}Weakest:{" "}
                      <strong style={{ color: "#C62828" }}>
                        {METRIC_LABELS[theme.weakest_metric]}
                      </strong>{" "}
                      ({theme.weakest_score}/100) — open it for how to fix.
                    </>
                  )}
                </p>
                <div className="space-y-1 divide-y" style={{ borderColor: "#F0EDE6" }}>
                  {theme.metric_keys.map((mk) => {
                    const m = metrics[mk];
                    if (!m) return null;
                    return <MetricCard key={mk} metricKey={mk} metric={m} />;
                  })}
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Methodology */}
        <details className="mt-10 text-xs" style={{ color: "#5C5C5C" }}>
          <summary className="cursor-pointer" style={{ color: "#8A8A8A" }}>
            methodology
          </summary>
          <div className="mt-3 leading-relaxed space-y-2">
            <p>
              Every metric is computed from data I can&apos;t fudge: my own
              commit history (<code>hbschlac/*</code>), my Claude Code session
              logs (<code>~/.claude/projects/</code>), and direct{" "}
              <code>curl</code> hits to my live sites. No API keys, no third
              parties.
            </p>
            <p>
              Each metric is scored 0–100 (higher = better). Theme score is the
              average of its metrics. Vibe Score is the average of theme
              scores. Window: rolling {window_days} days. {repos_scanned} repos
              scanned.
            </p>
            <p style={{ color: "#8A8A8A" }}>
              Refreshed weekly · last run {fmtDate(generated_at)}
            </p>
          </div>
        </details>
      </main>
    </div>
  );
}
