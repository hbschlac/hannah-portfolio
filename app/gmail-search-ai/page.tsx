import { Suspense } from "react";
import { getGmailActionSnapshot, buildFallbackGmailSnapshot } from "@/lib/gmail-action";
import { GmailActionDashboard } from "./components/GmailActionDashboard";

async function DashboardLoader() {
  const snapshot = (await getGmailActionSnapshot()) ?? buildFallbackGmailSnapshot();
  return <GmailActionDashboard snapshot={snapshot} />;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 mt-3">Loading research...</p>
      </div>
    </div>
  );
}

export default function GmailSearchAIPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardLoader />
    </Suspense>
  );
}
