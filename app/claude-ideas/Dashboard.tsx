"use client";

import { useState, useCallback, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import type { RedditPost, RunSummary, PostCategory } from "./types";

// ─── colours ──────────────────────────────────────────────────────────────────
const CAT_COLOR: Record<PostCategory, string> = {
  pain_point: "#ef4444",
  feature_request: "#8b5cf6",
  positive: "#22c55e",
  competitor: "#f59e0b",
};
const CAT_LABEL: Record<PostCategory, string> = {
  pain_point: "Pain Point",
  feature_request: "Feature Request",
  positive: "Positive",
  competitor: "Competitor",
};
const IMPACT_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

// ─── lazy post fetching ───────────────────────────────────────────────────────
function buildPostsUrl(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/api/reddit-pulse/posts?${q.toString()}`;
}

async function fetchPosts(url: string): Promise<RedditPost[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ─── drilldown drawer ─────────────────────────────────────────────────────────
interface DrawerState {
  label: string;
  query: string; // /api/reddit-pulse/posts?... URL
}

function DrilldownDrawer({
  drawer,
  onClose,
}: {
  drawer: DrawerState | null;
  onClose: () => void;
}) {
  const [posts, setPosts] = useState<RedditPost[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!drawer) { setPosts(null); return; }
    setLoading(true);
    setPosts(null);
    fetchPosts(drawer.query).then((p) => { setPosts(p); setLoading(false); });
  }, [drawer]);

  if (!drawer) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#18181f] border-l border-white/10 z-50 flex flex-col shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Source data</p>
            <h2 className="text-sm font-semibold text-white leading-snug">{drawer.label}</h2>
            {posts && (
              <p className="text-xs text-stone-500 mt-0.5">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors ml-4 mt-0.5 text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0f0f13] rounded-lg p-4 border border-white/5 animate-pulse h-24" />
              ))}
            </div>
          )}
          {!loading && posts?.length === 0 && (
            <p className="text-stone-500 text-sm">No posts to show.</p>
          )}
          {!loading && posts && [...posts].sort((a, b) => b.score - a.score).map((post) => (
            <div key={post.id} className="bg-[#0f0f13] rounded-lg p-4 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: CAT_COLOR[post.category] + "22", color: CAT_COLOR[post.category] }}
                >
                  {CAT_LABEL[post.category]}
                </span>
                <span className="text-xs text-stone-500 shrink-0">r/{post.subreddit} · ↑{post.score}</span>
              </div>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white font-medium hover:text-violet-300 transition-colors leading-snug block mb-2"
              >
                {post.title} ↗
              </a>
              {post.selftext_snippet && (
                <p className="text-xs text-stone-400 leading-relaxed line-clamp-3">{post.selftext_snippet}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-stone-600">{post.collected_run}</span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View on Reddit →
                </a>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, onClick }: {
  label: string; value: string | number; sub?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/5 hover:bg-white/8 active:bg-white/10 border border-white/8 rounded-xl p-5 text-left transition-all cursor-pointer group w-full"
    >
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-white group-hover:text-violet-300 transition-colors">{value}</p>
      {sub && <p className="text-xs text-stone-500 mt-1">{sub}</p>}
      <p className="text-xs text-stone-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">click to drill down</p>
    </button>
  );
}

// ─── module 1: this week's fresh findings ────────────────────────────────────
function FreshFindings({
  latestRun,
  openDrawer,
}: {
  latestRun: RunSummary | null;
  openDrawer: (label: string, query: string) => void;
}) {
  const [filter, setFilter] = useState<PostCategory | "all">("all");
  const [previewPosts, setPreviewPosts] = useState<RedditPost[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Auto-fetch latest run's posts for the card list (small, ~25 posts)
  useEffect(() => {
    if (!latestRun) return;
    setLoadingPreview(true);
    fetchPosts(buildPostsUrl({ run_date: latestRun.run_date }))
      .then((p) => { setPreviewPosts(p); setLoadingPreview(false); });
  }, [latestRun?.run_date]);

  const displayed = filter === "all" ? previewPosts : previewPosts.filter((p) => p.category === filter);

  if (!latestRun) {
    return (
      <section className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">This Week&apos;s Findings</h2>
        <p className="text-stone-500 text-sm">No data yet — first agent run pending.</p>
      </section>
    );
  }

  return (
    <section className="bg-white/5 border border-white/8 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Module 1</p>
          <h2 className="text-xl font-bold text-white">This Week&apos;s Fresh Findings</h2>
          <p className="text-sm text-stone-400 mt-1">
            {latestRun.day} · {latestRun.run_date} · {latestRun.total_new_posts} new posts
          </p>
        </div>
        <a
          href="https://raw.githubusercontent.com/hbschlac/build-log/main/reddit-pulse/all-posts.json"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-stone-300 transition-colors"
        >
          ↓ Download raw data
        </a>
      </div>

      {/* category filter badges */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(["all", "pain_point", "feature_request", "positive", "competitor"] as const).map((cat) => {
          const count = cat === "all" ? latestRun.total_new_posts : (latestRun.categories[cat] ?? 0);
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                const q = cat === "all"
                  ? buildPostsUrl({ run_date: latestRun.run_date })
                  : buildPostsUrl({ run_date: latestRun.run_date, category: cat });
                const label = cat === "all" ? "All posts this week" : `${CAT_LABEL[cat]} posts this week`;
                openDrawer(label, q);
              }}
              className="text-xs px-3 py-1 rounded-full border transition-all"
              style={
                active && cat !== "all"
                  ? { background: CAT_COLOR[cat] + "22", borderColor: CAT_COLOR[cat], color: CAT_COLOR[cat] }
                  : { background: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "#a8a29e" }
              }
            >
              {cat === "all" ? "All" : CAT_LABEL[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* post preview cards */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {loadingPreview && [1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0f0f13] rounded-lg p-3 border border-white/5 animate-pulse h-14" />
        ))}
        {!loadingPreview && displayed.map((post) => (
          <button
            key={post.id}
            onClick={() => openDrawer(`"${post.title}"`, buildPostsUrl({ ids: post.id }))}
            className="w-full text-left bg-[#0f0f13] hover:bg-white/5 border border-white/5 hover:border-white/15 rounded-lg p-3 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: CAT_COLOR[post.category] + "22", color: CAT_COLOR[post.category] }}
              >
                {CAT_LABEL[post.category]}
              </span>
              <span className="text-xs text-stone-500">r/{post.subreddit} · ↑{post.score}</span>
              <span className="ml-auto text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">view source →</span>
            </div>
            <p className="text-sm text-white leading-snug">{post.title}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── module 2: cumulative trends & wow ───────────────────────────────────────
function CumulativeTrends({
  runs,
  openDrawer,
}: {
  runs: RunSummary[];
  openDrawer: (label: string, query: string) => void;
}) {
  const last10 = runs.slice(-10);
  const latestRun = runs[runs.length - 1];

  const trendData = last10.map((r) => {
    const total = r.total_new_posts || 1;
    return {
      date: r.run_date.slice(5),
      pain: Math.round((r.categories.pain_point / total) * 100),
      feature: Math.round((r.categories.feature_request / total) * 100),
      positive: Math.round((r.categories.positive / total) * 100),
      competitor: Math.round((r.categories.competitor / total) * 100),
      run_date: r.run_date,
    };
  });

  const pieData = latestRun ? [
    { name: "Pain Points", value: latestRun.categories.pain_point, color: CAT_COLOR.pain_point, cat: "pain_point" as PostCategory },
    { name: "Feature Requests", value: latestRun.categories.feature_request, color: CAT_COLOR.feature_request, cat: "feature_request" as PostCategory },
    { name: "Positive", value: latestRun.categories.positive, color: CAT_COLOR.positive, cat: "positive" as PostCategory },
    { name: "Competitor", value: latestRun.categories.competitor, color: CAT_COLOR.competitor, cat: "competitor" as PostCategory },
  ] : [];

  const tagData = latestRun?.top_tags.slice(0, 8).map((t) => {
    const prevRun = runs[runs.length - 2];
    const prevCount = prevRun?.top_tags.find((pt) => pt.tag === t.tag)?.count ?? 0;
    return { tag: t.tag, thisWeek: t.count, lastWeek: prevCount };
  }) ?? [];

  const delta = latestRun?.delta_vs_last;

  if (runs.length === 0) {
    return (
      <section className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Cumulative Trends</h2>
        <p className="text-stone-500 text-sm">No runs yet.</p>
      </section>
    );
  }

  return (
    <section className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-8">
      <div>
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Module 2</p>
        <h2 className="text-xl font-bold text-white">Cumulative Trends & Week-over-Week</h2>
      </div>

      {/* WoW deltas */}
      {delta && (
        <div className="flex gap-3 flex-wrap">
          {([
            { label: "Pain points", val: delta.pain_point_pct_change, cat: "pain_point" as PostCategory },
            { label: "Feature requests", val: delta.feature_request_pct_change, cat: "feature_request" as PostCategory },
            { label: "Positive", val: delta.positive_pct_change, cat: "positive" as PostCategory },
          ]).map(({ label, val, cat }) => (
            <button
              key={label}
              onClick={() => openDrawer(`${label} — latest run`, buildPostsUrl({ run_date: latestRun!.run_date, category: cat }))}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/8 rounded-lg px-4 py-2 transition-colors"
            >
              <span className="text-sm text-stone-300">{label}</span>
              <span className={`text-sm font-bold ${val > 0 ? "text-red-400" : val < 0 ? "text-green-400" : "text-stone-400"}`}>
                {val > 0 ? "↑" : val < 0 ? "↓" : "—"}{Math.abs(val).toFixed(1)}%
              </span>
            </button>
          ))}
          {delta.top_emerging_tag && (
            <button
              onClick={() => openDrawer(`Posts tagged "${delta.top_emerging_tag}"`, buildPostsUrl({ tag: delta.top_emerging_tag! }))}
              className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-lg px-4 py-2 transition-colors"
            >
              <span className="text-xs text-amber-300">🆕 New tag:</span>
              <span className="text-sm font-medium text-amber-200">{delta.top_emerging_tag}</span>
            </button>
          )}
        </div>
      )}

      {/* trend line */}
      {trendData.length > 1 && (
        <div>
          <p className="text-xs text-stone-400 mb-3">Category % over last {trendData.length} runs — click a data point to see posts</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#78716c", fontSize: 11 }} />
              <YAxis tick={{ fill: "#78716c", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#e7e5e4" }} itemStyle={{ color: "#a8a29e" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#a8a29e" }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Line type="monotone" dataKey="pain" stroke={CAT_COLOR.pain_point} name="Pain Points" dot={{ r: 4, cursor: "pointer" }} onClick={(d: any) => openDrawer(`Pain points · ${d.run_date}`, buildPostsUrl({ run_date: d.run_date, category: "pain_point" }))} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Line type="monotone" dataKey="feature" stroke={CAT_COLOR.feature_request} name="Feature Requests" dot={{ r: 4, cursor: "pointer" }} onClick={(d: any) => openDrawer(`Feature requests · ${d.run_date}`, buildPostsUrl({ run_date: d.run_date, category: "feature_request" }))} />
              <Line type="monotone" dataKey="positive" stroke={CAT_COLOR.positive} name="Positive" dot={{ r: 4, cursor: "pointer" }} />
              <Line type="monotone" dataKey="competitor" stroke={CAT_COLOR.competitor} name="Competitor" dot={{ r: 4, cursor: "pointer" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* pie + tag bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-stone-400 mb-3">This week&apos;s split — click a slice</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={(e: any) => openDrawer(`${e.name} · this week`, buildPostsUrl({ run_date: latestRun!.run_date, category: e.cat }))}
                style={{ cursor: "pointer" }}
              >
                {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} itemStyle={{ color: "#a8a29e" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#a8a29e" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-stone-400 mb-3">Top tags: this week vs last — click a bar</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tagData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#78716c", fontSize: 10 }} />
              <YAxis dataKey="tag" type="category" tick={{ fill: "#a8a29e", fontSize: 10 }} width={90} />
              <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} itemStyle={{ color: "#a8a29e" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#a8a29e" }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Bar dataKey="thisWeek" name="This week" fill="#8b5cf6" radius={[0, 3, 3, 0]} onClick={(d: any) => openDrawer(`Posts tagged "${d.tag}" · this week`, buildPostsUrl({ run_date: latestRun!.run_date, tag: d.tag }))} style={{ cursor: "pointer" }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Bar dataKey="lastWeek" name="Last week" fill="#4c1d95" radius={[0, 3, 3, 0]} onClick={(d: any) => { const prev = runs[runs.length - 2]; if (prev) openDrawer(`Posts tagged "${d.tag}" · last week`, buildPostsUrl({ run_date: prev.run_date, tag: d.tag })); }} style={{ cursor: "pointer" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ─── module 3: pm today for anthropic ────────────────────────────────────────
function PmToday({
  latestRun,
  openDrawer,
}: {
  latestRun: RunSummary | null;
  openDrawer: (label: string, query: string) => void;
}) {
  if (!latestRun?.pm_analysis) {
    return (
      <section className="bg-white/5 border border-white/8 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">PM Today for Anthropic</h2>
        <p className="text-stone-500 text-sm">PM analysis pending — available after first agent run.</p>
      </section>
    );
  }

  const { top_priority, secondary_priorities } = latestRun.pm_analysis;

  function PriorityCard({ priority, rank }: { priority: typeof top_priority; rank: "top" | "secondary" }) {
    const supportingQuery = buildPostsUrl({ ids: priority.supporting_post_ids.join(",") });
    return (
      <div className={`rounded-xl border p-5 ${rank === "top" ? "border-violet-500/30 bg-violet-500/5" : "border-white/8 bg-white/3"}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {rank === "top" && <span className="text-xs text-violet-300 uppercase tracking-widest font-medium block mb-1">Top Priority</span>}
            <h3 className="text-base font-bold text-white">{priority.title}</h3>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: IMPACT_COLOR[priority.impact_level] + "22", color: IMPACT_COLOR[priority.impact_level] }}>
              {priority.impact_level} impact
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-stone-300">{priority.effort_level} effort</span>
          </div>
        </div>

        <ul className="space-y-1 mb-3">
          {priority.why.map((bullet, i) => (
            <li key={i} className="text-sm text-stone-300 flex gap-2">
              <span className="text-violet-400 shrink-0">·</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => openDrawer(`Data behind: "${priority.title}"`, supportingQuery)}
          className="w-full text-left bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-lg px-3 py-2 transition-colors group mb-3"
        >
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">Supporting metric</p>
          <p className="text-sm text-white">{priority.metric}</p>
          <p className="text-xs text-violet-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            click to see source posts + verify →
          </p>
        </button>

        <button
          onClick={() => openDrawer(`ROI evidence: "${priority.title}"`, supportingQuery)}
          className="w-full text-left bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-lg px-3 py-2 transition-colors group"
        >
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">ROI & impact</p>
          <p className="text-sm text-white">{priority.roi_estimate}</p>
          <p className="text-xs text-violet-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            click to verify with raw Reddit posts →
          </p>
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Module 3</p>
        <h2 className="text-xl font-bold text-white">PM Today for Anthropic</h2>
        <p className="text-sm text-stone-400 mt-1">
          AI-generated prioritization from this week&apos;s Reddit data. Click any metric or ROI to see the raw posts behind the claim.
        </p>
        {/* sample bias caveat */}
        <p className="text-xs text-stone-600 mt-2 border border-white/5 rounded-lg px-3 py-2 bg-white/3">
          ⚠ Based on r/ClaudeAI posts (n={latestRun.total_new_posts}). Reddit skews toward developers and frustrated users — not representative of Claude&apos;s full user base. Use as a signal, not a verdict.
        </p>
      </div>

      <PriorityCard priority={top_priority} rank="top" />

      {secondary_priorities.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Runner-up priorities</p>
          <div className="space-y-3">
            {secondary_priorities.map((p, i) => <PriorityCard key={i} priority={p} rank="secondary" />)}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── main dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ runs }: { runs: RunSummary[] }) {
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const openDrawer = useCallback((label: string, query: string) => setDrawer({ label, query }), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  const latestRun = runs[runs.length - 1] ?? null;
  const totalPosts = latestRun?.cumulative_total ?? 0;

  return (
    <>
      <DrilldownDrawer drawer={drawer} onClose={closeDrawer} />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-500 mb-1">schlacter.me</p>
            <h1 className="text-3xl font-bold text-white">Claude Wish List</h1>
            <p className="text-stone-400 mt-1 text-sm">Reddit intelligence · collected Mon, Wed, Fri, Sun · r/ClaudeAI</p>
            {latestRun && <p className="text-xs text-stone-600 mt-1">Last updated {latestRun.run_date}</p>}
          </div>
          <a
            href="https://raw.githubusercontent.com/hbschlac/build-log/main/reddit-pulse/all-posts.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-stone-300 transition-colors self-start"
          >
            ↓ Download all data (JSON)
          </a>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total posts"
            value={totalPosts}
            sub="all time"
            onClick={() => openDrawer("All posts — all time", buildPostsUrl({}))}
          />
          <StatCard
            label="Pain points"
            value={latestRun?.categories.pain_point ?? 0}
            sub="this week"
            onClick={() => latestRun && openDrawer("Pain points · this week", buildPostsUrl({ run_date: latestRun.run_date, category: "pain_point" }))}
          />
          <StatCard
            label="Feature requests"
            value={latestRun?.categories.feature_request ?? 0}
            sub="this week"
            onClick={() => latestRun && openDrawer("Feature requests · this week", buildPostsUrl({ run_date: latestRun.run_date, category: "feature_request" }))}
          />
          <StatCard
            label="Top tag"
            value={latestRun?.top_tags[0]?.tag ?? "—"}
            sub={latestRun?.top_tags[0] ? `${latestRun.top_tags[0].count} posts` : ""}
            onClick={() => { const tag = latestRun?.top_tags[0]?.tag; if (tag) openDrawer(`Posts tagged "${tag}"`, buildPostsUrl({ tag })); }}
          />
        </div>

        <FreshFindings latestRun={latestRun} openDrawer={openDrawer} />
        <CumulativeTrends runs={runs} openDrawer={openDrawer} />
        <PmToday latestRun={latestRun} openDrawer={openDrawer} />
      </div>
    </>
  );
}
