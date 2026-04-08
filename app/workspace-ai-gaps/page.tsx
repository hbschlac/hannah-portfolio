import { Suspense } from "react";
import { getSnapshot, type AnalysisSnapshot } from "@/lib/workspace-ai";
import { Dashboard } from "./components/Dashboard";
import { getDefaultThemes, getCuratedFeedback, analyzeFeedback } from "@/lib/workspace-ai";

function buildFallbackSnapshot(): AnalysisSnapshot {
  const curated = getCuratedFeedback();
  const themes = analyzeFeedback(curated, getDefaultThemes());
  return {
    lastUpdated: new Date().toISOString(),
    totalFeedback: curated.length,
    sources: { reddit: 0, hackernews: 0, playstore: 0, curated: curated.length },
    themes,
    topCompetitors: [
      { name: "ChatGPT", mentionCount: 4, topReasons: ["More reliable grounding", "Better formula generation", "Persistent memory"] },
      { name: "Microsoft Copilot", mentionCount: 3, topReasons: ["Unified memory across M365", "Deep Excel integration", "Meeting + task integration"] },
      { name: "Notion AI", mentionCount: 2, topReasons: ["Better context matching", "Tone-aware writing"] },
    ],
  };
}

async function DashboardLoader() {
  const snapshot = (await getSnapshot()) ?? buildFallbackSnapshot();
  return <Dashboard snapshot={snapshot} />;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 mt-3">Loading analysis...</p>
      </div>
    </div>
  );
}

export default function WorkspaceAIGapsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardLoader />
    </Suspense>
  );
}
