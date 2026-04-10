import { Suspense } from "react";
import Dashboard from "./Dashboard";
import type { RedditPost, RunSummary } from "./types";

export const metadata = { title: "Claude Wish List — schlacter.me" };

const RAW_BASE =
  "https://raw.githubusercontent.com/hbschlac/build-log/main/reddit-pulse";

async function getData(): Promise<{ runs: RunSummary[]; allPosts: RedditPost[] }> {
  try {
    const [runsRes, postsRes] = await Promise.all([
      fetch(`${RAW_BASE}/runs.json`, { cache: "no-store" }),
      fetch(`${RAW_BASE}/all-posts.json`, { cache: "no-store" }),
    ]);
    const [runs, allPosts] = await Promise.all([runsRes.json(), postsRes.json()]);
    return { runs: runs ?? [], allPosts: allPosts ?? [] };
  } catch {
    return { runs: [], allPosts: [] };
  }
}

async function DashboardLoader() {
  const { runs, allPosts } = await getData();
  return <Dashboard runs={runs} allPosts={allPosts} />;
}

export default function ClaudeIdeasPage() {
  return (
    <main className="min-h-screen bg-[#0f0f13] text-white">
      <Suspense fallback={<div className="p-12 text-stone-500">Loading…</div>}>
        <DashboardLoader />
      </Suspense>
    </main>
  );
}
