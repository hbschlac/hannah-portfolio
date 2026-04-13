"use client";

import { useEffect, useState } from "react";

interface VerifyResult {
  id: string;
  source: string;
  url: string;
  text: string;
  status: "verified" | "blocked" | "error";
  httpStatus?: number;
  contentMatch?: boolean;
  responseSnippet?: string;
  error?: string;
}

interface VerifyResponse {
  checkedAt: string;
  totalChecked: number;
  verified: number;
  blocked: number;
  errors: number;
  totalDataPoints: number;
  sourceBreakdown: { source: string; sampled: number; verified: number; blocked: number }[];
  results: VerifyResult[];
}

const STATUS_STYLES = {
  verified: { bg: "bg-green-900/30", border: "border-green-700", dot: "bg-green-400", label: "Verified" },
  blocked: { bg: "bg-yellow-900/30", border: "border-yellow-700", dot: "bg-yellow-400", label: "Blocked by site" },
  error: { bg: "bg-red-900/30", border: "border-red-700", dot: "bg-red-400", label: "Error" },
};

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  playstore: "Play Store",
  appstore: "App Store",
  curated: "Curated",
};

export default function VerificationPage() {
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch("/twitch-community/api/verify");
      const json = await res.json();
      setData(json);
      setHasRun(true);
    } catch {
      setHasRun(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/twitch-community" className="text-sm text-purple-400 hover:text-purple-300 mb-6 inline-block">
          &larr; Back to Dashboard
        </a>

        <h1 className="text-3xl font-bold mb-2">Data Verification</h1>
        <p className="text-gray-400 mb-4">
          Live audit of source URLs. This page picks a random sample of data points from the dashboard, fetches each
          source URL, and confirms it exists and contains matching content.
        </p>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-8 text-sm text-gray-400">
          <strong className="text-gray-200">How this works:</strong> For each sampled data point, we make a real HTTP
          request to the source URL. A &quot;Verified&quot; result means the URL returned 200 and the page content contains words
          from the scraped text. &quot;Blocked&quot; means the site returned 403/429 (expected for Reddit, which blocks automated
          requests). You can click any URL to verify it yourself.
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-400 mb-8">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Checking {data ? data.totalChecked : "..."} source URLs...
          </div>
        )}

        {data && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-purple-400">{data.totalDataPoints.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Data Points</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-white">{data.totalChecked}</div>
                <div className="text-xs text-gray-400">URLs Checked</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-green-400">{data.verified}</div>
                <div className="text-xs text-gray-400">Verified</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
                <div className="text-2xl font-bold text-yellow-400">{data.blocked}</div>
                <div className="text-xs text-gray-400">Blocked by Site</div>
              </div>
            </div>

            {/* Source breakdown */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-8">
              <h2 className="text-sm font-semibold text-gray-200 mb-3">Source Breakdown</h2>
              <div className="space-y-2">
                {data.sourceBreakdown.map((s) => (
                  <div key={s.source} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 w-24">{SOURCE_LABELS[s.source] ?? s.source}</span>
                    <div className="flex-1 mx-3 h-3 bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-green-500 rounded-l-full"
                        style={{ width: `${s.sampled ? (s.verified / s.sampled) * 100 : 0}%` }}
                      />
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${s.sampled ? (s.blocked / s.sampled) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-gray-400 w-32 text-right">
                      {s.verified} verified, {s.blocked} blocked
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual results */}
            <h2 className="text-lg font-semibold mb-4">Spot-Check Results</h2>
            <div className="space-y-3">
              {data.results.map((r) => {
                const style = STATUS_STYLES[r.status];
                return (
                  <div key={r.id} className={`${style.bg} border ${style.border} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      <span className="text-xs font-medium text-gray-200">{style.label}</span>
                      <span className="text-xs text-gray-500">|</span>
                      <span className="text-xs text-gray-400">{SOURCE_LABELS[r.source] ?? r.source}</span>
                      {r.httpStatus && (
                        <>
                          <span className="text-xs text-gray-500">|</span>
                          <span className="text-xs text-gray-400">HTTP {r.httpStatus}</span>
                        </>
                      )}
                      {r.contentMatch !== undefined && (
                        <>
                          <span className="text-xs text-gray-500">|</span>
                          <span className={`text-xs ${r.contentMatch ? "text-green-400" : "text-yellow-400"}`}>
                            {r.contentMatch ? "Content matches" : "Content partial"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">&quot;{r.text}&quot;</p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 break-all"
                    >
                      {r.url}
                    </a>
                    {r.error && <p className="text-xs text-gray-500 mt-1">{r.error}</p>}
                  </div>
                );
              })}
            </div>

            {/* Re-run button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={runVerification}
                disabled={loading}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Checking..." : "Re-run Verification"}
              </button>
              <span className="text-xs text-gray-500">
                Last checked: {new Date(data.checkedAt).toLocaleString()}
              </span>
            </div>
          </>
        )}

        {hasRun && !data && (
          <div className="text-red-400 text-sm">Verification failed. The API may be temporarily unavailable.</div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-800 flex gap-3">
          <a href="/twitch-community" className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            Back to Dashboard
          </a>
          <a href="/twitch-community/methodology" className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            Methodology
          </a>
          <a href="https://github.com/hbschlac/twitch-community-research" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
