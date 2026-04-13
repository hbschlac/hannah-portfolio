import { Suspense } from "react";
import Dashboard from "./Dashboard";
import type { RunSummary } from "./types";

export const metadata = { title: "Claude Wish List — schlacter.me" };

const RAW_BASE =
  "https://raw.githubusercontent.com/hbschlac/build-log/main/reddit-pulse";

async function getRuns(): Promise<RunSummary[]> {
  try {
    const res = await fetch(`${RAW_BASE}/runs.json`, { next: { tags: ["reddit-pulse"] } });
    if (!res.ok) return [];
    return (await res.json()) ?? [];
  } catch {
    return [];
  }
}

async function DashboardLoader() {
  const runs = await getRuns();
  return <Dashboard runs={runs} />;
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
