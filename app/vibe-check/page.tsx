import type { Metadata } from "next";
import Link from "next/link";
import statsJson from "../../public/vibe-check-stats.json";
import historyJson from "../../public/vibe-check-history.json";
import lessonsJson from "../../public/vibe-coach-lessons.json";

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
type Focus = {
  metric: string;
  headline: string;
  score: number;
  actions: string[];
};
type ImproverAction = {
  date: string;
  metric: string;
  repo: string;
  status: "opened" | "skipped" | "failed";
  pr_url: string | null;
};
type ImproverActivity = {
  total_runs_30d: number;
  opened_30d: number;
  skipped_30d: number;
  failed_30d: number;
  recent: ImproverAction[];
};
type Stats = {
  generated_at: string;
  window_days: number;
  vibe_score: number;
  verdict: string;
  biggest_lever?: string;
  focus?: Focus;
  improver_activity?: ImproverActivity;
  themes: Record<string, Theme>;
  metrics: Record<string, Metric>;
  repos_scanned: number;
};
type HistoryEntry = {
  generated_at: string;
  vibe_score: number;
  theme_scores: Record<string, number>;
  biggest_lever?: string;
};
type Lesson = {
  habit: string;
  framing: string;
  evidence_count: number;
  evidence_summary: string;
  weeks_in_flight: number;
  status: string;
};
type LessonsFile = {
  generated_at: string;
  sessions_analyzed: number;
  lessons_in_flight: Lesson[];
  lessons_graduated: { habit: string; weeks_in_flight?: number }[];
  going_well: { note: string }[];
};

const stats = statsJson as Stats;
const history = historyJson as HistoryEntry[];
const lessons = lessonsJson as LessonsFile;

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

function Sparkline({ data }: { data: HistoryEntry[] }) {
  if (data.length < 2) return null;
  const points = data.map((d) => d.vibe_score);
  const w = 240;
  const h = 60;
  const pad = 4;
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 100);
  const range = max - min || 1;
  const xStep = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * xStep;
    const y = pad + (h - pad * 2) * (1 - (p - min) / range);
    return { x, y, val: p };
  });
  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const last = coords[coords.length - 1];
  const first = coords[0];
  const delta = points[points.length - 1] - points[0];
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const sign = delta > 0 ? "+" : "";
  const trendColor =
    delta > 0 ? "#2E7D32" : delta < 0 ? "#C62828" : "#8A8A8A";

  return (
    <div className="flex items-center gap-4">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ display: "block" }}
      >
        <path
          d={path}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={first.x} cy={first.y} r="2.5" fill="#8A8A8A" />
        <circle cx={last.x} cy={last.y} r="3" fill={scoreBigColor(last.val)} />
      </svg>
      <div className="text-xs leading-tight" style={{ color: "#5C5C5C" }}>
        <div style={{ color: trendColor }}>
          {arrow} {sign}
          {delta} pts
        </div>
        <div style={{ color: "#8A8A8A" }}>over {data.length} weeks</div>
      </div>
    </div>
  );
}

function LessonsCard({ lessons }: { lessons: LessonsFile }) {
  if (
    !lessons.lessons_in_flight?.length &&
    !lessons.going_well?.length
  ) {
    return null;
  }
  return (
    <div
      className="mt-6 rounded-xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
    >
      <p
        className="text-xs uppercase tracking-wider"
        style={{ color: "#8A8A8A" }}
      >
        Habits I&apos;m trying to break
      </p>
      <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
        Extracted weekly from my own session transcripts by{" "}
        <code style={{ background: "#F8F6F2", padding: "1px 4px" }}>
          vibe-coach
        </code>
        . The lessons get written into my global CLAUDE.md so the next session
        enforces them automatically.
      </p>
      {lessons.lessons_in_flight?.length > 0 && (
        <ul className="mt-5 space-y-4">
          {lessons.lessons_in_flight.map((l, i) => (
            <li key={i}>
              <p
                className="text-sm"
                style={{ color: "#1A1A1A" }}
              >
                <span style={{ color: "#C62828" }}>→</span> {l.habit}
              </p>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "#5C5C5C" }}
              >
                {l.framing}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "#8A8A8A" }}
              >
                Evidence: {l.evidence_summary} ·{" "}
                {l.weeks_in_flight}{" "}
                {l.weeks_in_flight === 1 ? "week" : "weeks"} in flight
              </p>
            </li>
          ))}
        </ul>
      )}
      {lessons.lessons_graduated?.length > 0 && (
        <div className="mt-5">
          <p
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: "#8A8A8A" }}
          >
            Graduated (sustained ≥3 weeks)
          </p>
          <ul className="space-y-1">
            {lessons.lessons_graduated.map((g, i) => (
              <li
                key={i}
                className="text-xs"
                style={{ color: "#2E7D32" }}
              >
                ✓ {g.habit}
              </li>
            ))}
          </ul>
        </div>
      )}
      {lessons.going_well?.length > 0 && (
        <div className="mt-5">
          <p
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: "#8A8A8A" }}
          >
            Going well, keep doing it
          </p>
          <ul className="space-y-1">
            {lessons.going_well.map((g, i) => (
              <li
                key={i}
                className="text-xs"
                style={{ color: "#558B2F" }}
              >
                ✓ {g.note}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs mt-5" style={{ color: "#8A8A8A" }}>
        {lessons.sessions_analyzed} sessions analyzed · refreshed Saturdays
      </p>
    </div>
  );
}

function ImproverActivityCard({ activity }: { activity: ImproverActivity }) {
  const hasRuns = activity.total_runs_30d > 0;
  return (
    <div
      className="mt-6 rounded-xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
    >
      <p
        className="text-xs uppercase tracking-wider"
        style={{ color: "#8A8A8A" }}
      >
        Improver activity (last 30 days)
      </p>
      {!hasRuns ? (
        <p className="text-sm mt-3" style={{ color: "#5C5C5C" }}>
          The improver runs every Monday at 9am and opens a draft PR
          targeting the weakest metric. First run: next Monday. Check back
          for the loop closing.
        </p>
      ) : (
        <>
          <div className="mt-3 flex gap-4 text-xs" style={{ color: "#5C5C5C" }}>
            <span>
              <strong style={{ color: "#2E7D32" }}>
                {activity.opened_30d}
              </strong>{" "}
              opened
            </span>
            <span>
              <strong style={{ color: "#8A8A8A" }}>
                {activity.skipped_30d}
              </strong>{" "}
              skipped
            </span>
            {activity.failed_30d > 0 && (
              <span>
                <strong style={{ color: "#C62828" }}>
                  {activity.failed_30d}
                </strong>{" "}
                failed
              </span>
            )}
          </div>
          {activity.recent.length > 0 && (
            <ul className="mt-4 space-y-2">
              {activity.recent.map((a, i) => (
                <li
                  key={i}
                  className="text-xs flex items-baseline gap-3"
                  style={{ color: "#1A1A1A" }}
                >
                  <span style={{ color: "#8A8A8A" }}>{a.date}</span>
                  <span style={{ color: "#5C5C5C" }}>
                    {METRIC_LABELS[a.metric] ?? a.metric}
                  </span>
                  <span style={{ color: "#8A8A8A" }}>· {a.repo}</span>
                  {a.pr_url ? (
                    <a
                      href={a.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto underline"
                      style={{ color: "#1A1A1A" }}
                    >
                      see PR →
                    </a>
                  ) : (
                    <span
                      className="ml-auto italic"
                      style={{ color: "#8A8A8A" }}
                    >
                      {a.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <p className="text-xs mt-4" style={{ color: "#8A8A8A" }}>
        Autonomous engine — opens draft PRs only, never auto-merges.
      </p>
    </div>
  );
}

function FocusCard({ focus }: { focus: Focus }) {
  return (
    <div
      className="mt-8 rounded-xl p-6"
      style={{ background: "#FFFFFF", border: "1px solid #E8E4DC" }}
    >
      <p
        className="text-xs uppercase tracking-wider"
        style={{ color: "#8A8A8A" }}
      >
        What I&apos;m working on this month
      </p>
      <p className="text-base mt-2" style={{ color: "#1A1A1A" }}>
        {focus.headline}
      </p>
      <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
        Targeting <strong>{METRIC_LABELS[focus.metric] ?? focus.metric}</strong>
        {" "}({focus.score}/100, lowest sub-score).
      </p>
      <ul className="mt-4 space-y-2">
        {focus.actions.map((a, i) => (
          <li
            key={i}
            className="text-sm leading-relaxed flex gap-3"
            style={{ color: "#1A1A1A" }}
          >
            <span style={{ color: "#8A8A8A" }}>→</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs mt-4" style={{ color: "#8A8A8A" }}>
        Refreshed every Sunday. Next score in this metric tells the story.
      </p>
    </div>
  );
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

  // default
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
      </div>
    </details>
  );
}

export default function VibeCheckPage() {
  const {
    vibe_score,
    verdict,
    biggest_lever,
    focus,
    improver_activity,
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
          my vibe coding actually holds up — and what I&apos;m doing about the
          gaps.
        </p>

        {/* Vibe Score */}
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
            {history.length >= 2 ? (
              <div className="mt-5 flex justify-center">
                <Sparkline data={history} />
              </div>
            ) : (
              <p className="text-xs mt-4" style={{ color: "#8A8A8A" }}>
                first measurement · check back next week for trend
              </p>
            )}
            <p className="text-xs mt-4" style={{ color: "#8A8A8A" }}>
              click for how this number gets made →
            </p>
          </summary>
          <div
            className="mt-6 pt-6 text-left"
            style={{ borderTop: "1px solid #E8E4DC" }}
          >
            <p
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: "#8A8A8A" }}
            >
              How {vibe_score} gets calculated
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#1A1A1A" }}
            >
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
          </div>
        </details>

        {/* Focus card */}
        {focus && <FocusCard focus={focus} />}

        {/* Improver activity */}
        {improver_activity && (
          <ImproverActivityCard activity={improver_activity} />
        )}

        {/* Lessons in flight (vibe-coach) */}
        <LessonsCard lessons={lessons} />

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
                      ({theme.weakest_score}/100).
                    </>
                  )}
                </p>
                <div
                  className="space-y-1 divide-y"
                  style={{ borderColor: "#F0EDE6" }}
                >
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
              commit history (<code>hbschlac/*</code>, public repos only), my
              Claude Code session logs, and direct <code>curl</code> hits to
              live sites. No API keys, no third parties.
            </p>
            <p>
              Each metric is scored 0–100 (higher = better). Theme score is the
              average of its metrics. Vibe Score is the average of theme
              scores. Window: rolling {window_days} days. {repos_scanned} repos
              scanned. Sparkline shows weekly Vibe Score history.
            </p>
            <p style={{ color: "#8A8A8A" }}>
              Refreshed weekly · last run {fmtDate(generated_at)}
              {biggest_lever && (
                <>
                  {" "}· biggest lever:{" "}
                  {METRIC_LABELS[biggest_lever] ?? biggest_lever}
                </>
              )}
            </p>
          </div>
        </details>
      </main>
    </div>
  );
}
