import { Suspense } from "react";
import {
  getSnapshot,
  getCuratedFeedback,
  analyzeFeedback,
  getDefaultThemes,
  type AnalysisSnapshot,
} from "@/lib/cohere-experience";
import { Dashboard } from "./components/Dashboard";

function buildFallbackSnapshot(): AnalysisSnapshot {
  const curated = getCuratedFeedback();
  const themes = analyzeFeedback(curated, getDefaultThemes());
  const byVendor = { cohere: 0, openai: 0, anthropic: 0 };
  for (const f of curated) byVendor[f.vendor]++;
  return {
    lastUpdated: new Date().toISOString(),
    totalFeedback: curated.length,
    sources: { curated: curated.length },
    byVendor,
    themes,
    thesis:
      "Cohere's real wedge is enterprise deployment — data residency, VPC, multi-cloud. But developers don't discover that wedge through the playground, the SDK quickstart, or the model selection flow. Those surfaces still treat Cohere like a generic LLM vendor. Close that gap and enterprise buyers convert to enterprise users.",
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
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 mt-3">Loading analysis…</p>
      </div>
    </div>
  );
}

export default function CohereDeveloperExperiencePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardLoader />
    </Suspense>
  );
}
