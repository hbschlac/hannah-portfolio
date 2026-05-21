import type { Metadata } from "next";
import Link from "next/link";
import statsJson from "../../public/vibe-check-stats.json";

export const metadata: Metadata = {
  title: "Vibe Check — schlacter.me",
  description:
    "Hours coded ≠ good code. An honest, self-graded report card of my vibe coding.",
};

type Metric = {
  value: string;
  score: number;
  caption: string;
  raw?: Record<string, unknown>;
};
type Theme = {
  label: string;
  blurb: string;
  emoji: string;
  metric_keys: string[];
  score: number;
};
type Stats = {
  generated_at: string;
  window_days: number;
  tomatometer: number;
  verdict: string;
  themes: Record<string, Theme>;
  metrics: Record<string, Metric>;
  repos_scanned: number;
};

const stats = statsJson as Stats;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
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

function tomatoColor(score: number): string {
  if (score >= 60) return "#C62828";
  return "#5C5C5C";
}

const METRIC_LABELS: Record<string, string> = {
  broken_in_prod: "Broken in prod",
  uptime: "Live site latency",
  mttf: "Mean time to fix",
  fix_to_feature: "Fix-to-feature ratio",
  reverts: "Revert / oops count",
  debug_spiral: "Longest debug spiral",
  test_coverage: "Test coverage",
  todos: "TODOs left in code",
  secrets_blocked: "Secrets blocked at the gate",
};

export default function VibeCheckPage() {
  const { tomatometer, verdict, themes, metrics, generated_at, window_days, repos_scanned } =
    stats;

  return (
    <div className="min-h-screen" style={{ background: "#F8F6F2", color: "#1A1A1A" }}>
      <main className="max-w-3xl mx-auto w-full px-6 pt-16 pb-16">
        <Link
          href="/"
          className="text-xs transition-opacity hover:opacity-50"
          style={{ color: "#8A8A8A" }}
        >
          ← schlacter.me
        </Link>

        <p className="text-xs tracking-widest uppercase mt-10" style={{ color: "#1A1A1A" }}>
          Vibe Check
        </p>
        <h1 className="text-2xl mt-2">am i any good at this?</h1>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: "#5C5C5C" }}>
          Anyone can hold down a camera shutter. Doesn&apos;t make them a photographer.
          Anyone can vibe code. Doesn&apos;t make them a software engineer. This page is
          an honest, self-graded report card of how much my vibe coding actually holds up.
        </p>

        {/* Tomatometer */}
        <div
          className="mt-12 rounded-2xl p-10 text-center"
          style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
        >
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: "#8A8A8A" }}
          >
            Tomatometer
          </p>
          <div
            className="text-7xl font-light mt-3"
            style={{ color: tomatoColor(tomatometer) }}
          >
            {tomatometer}
          </div>
          <p className="text-base mt-2" style={{ color: "#1A1A1A" }}>
            {verdict}
          </p>
          <p className="text-xs mt-3" style={{ color: "#8A8A8A" }}>
            avg of 3 themes · {repos_scanned} repos · last {window_days} days
          </p>
        </div>

        {/* Themes */}
        <div className="mt-10 space-y-6">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className="rounded-xl p-6"
              style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-base">
                    <span className="mr-2">{theme.emoji}</span>
                    {theme.label}
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
              <div className="mt-5 space-y-3">
                {theme.metric_keys.map((mk) => {
                  const m = metrics[mk];
                  if (!m) return null;
                  return (
                    <div key={mk} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm">{METRIC_LABELS[mk] ?? mk}</p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "#8A8A8A" }}
                        >
                          {m.caption}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base" style={{ color: "#1A1A1A" }}>
                          {m.value}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: scoreColor(m.score) }}
                        >
                          {m.score}/100
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
              commit history (<code>hbschlac/*</code>), my Claude Code session logs
              (<code>~/.claude/projects/</code>), and direct <code>curl</code> hits
              to my live sites. No API keys, no third parties.
            </p>
            <p>
              <strong>Broken in prod</strong> counts fix commits that land within 24h
              of the commit they followed — a proxy for &quot;just shipped and
              immediately patched.&quot; <strong>Mean time to fix</strong> is the
              median gap between a bug-introducing commit and its fix.{" "}
              <strong>Debug spiral</strong> is the longest single Claude Code session,
              capped at 6h to filter idle gaps. <strong>Live site latency</strong> hits
              each live site over HTTP, weights HTTP-200 rate by average TTFB.{" "}
              <strong>Secrets blocked</strong> counts secret-y patterns explicitly
              gitignored across repos.
            </p>
            <p>
              Each metric is scored 0–100 (higher = better). Theme score is the
              average of its metrics. Tomatometer is the average of theme scores.
              Window: rolling {window_days} days.
            </p>
            <p style={{ color: "#8A8A8A" }}>Refreshed weekly · last run {fmtDate(generated_at)}</p>
          </div>
        </details>
      </main>
    </div>
  );
}
