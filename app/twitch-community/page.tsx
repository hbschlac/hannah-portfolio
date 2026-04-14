import { Suspense } from "react";
import { getSnapshot, type AnalysisSnapshot } from "@/lib/twitch-research";
import { Dashboard } from "./components/Dashboard";
import { getDefaultThemes, getCuratedFeedback, analyzeFeedback, getFeatureLaunches } from "@/lib/twitch-research";

function buildFallbackSnapshot(): AnalysisSnapshot {
  const curated = getCuratedFeedback();
  const themes = analyzeFeedback(curated, getDefaultThemes());
  const launches = getFeatureLaunches();
  for (const theme of themes) {
    theme.relatedLaunches = launches.filter((l) => l.relatedThemes.includes(theme.id)).map((l) => l.id);
  }
  return {
    lastUpdated: new Date().toISOString(),
    totalFeedback: curated.length,
    sources: { reddit: 0, hackernews: 0, playstore: 0, appstore: 0, youtube: 0, curated: curated.length },
    themes,
    topCompetitors: [
      { name: "YouTube", mentionCount: 5, topReasons: ["Reliable notifications", "Algorithm-driven discovery", "VOD persistence"] },
      { name: "Kick", mentionCount: 3, topReasons: ["Better creator economics", "Reliable go-live alerts"] },
      { name: "Discord", mentionCount: 2, topReasons: ["Real-time community", "Reliable push notifications"] },
    ],
    featureLaunches: launches,
    perspectiveSplit: {
      creator: curated.filter((c) => c.perspective === "creator").length,
      viewer: curated.filter((c) => c.perspective === "viewer").length,
      both: curated.filter((c) => c.perspective === "both").length,
    },
    monthlyDistribution: [],
  };
}

async function DashboardLoader() {
  const snapshot = (await getSnapshot()) ?? buildFallbackSnapshot();
  return <Dashboard snapshot={snapshot} />;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "#9146FF transparent transparent transparent" }} />
        <p className="text-sm mt-3" style={{ color: "#999" }}>Loading research...</p>
      </div>
    </div>
  );
}

export default function TwitchCommunityPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardLoader />
    </Suspense>
  );
}
