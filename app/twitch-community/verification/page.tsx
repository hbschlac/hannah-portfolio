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
  verified: { bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E", label: "Verified" },
  blocked: { bg: "#FEFCE8", border: "#FEF08A", dot: "#EAB308", label: "Blocked by site" },
  error: { bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", label: "Error" },
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
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/twitch-community" className="text-sm hover:underline mb-6 inline-block" style={{ color: "#9146FF" }}>
          &larr; Back to Dashboard
        </a>

        <h1 className="text-3xl font-bold mb-2" style={{ color: "#222" }}>Data Verification</h1>
        <p className="mb-4" style={{ color: "#666" }}>
          Live audit of source URLs. This page picks a random sample of data points from the dashboard, fetches each
          source URL, and confirms it exists and contains matching content.
        </p>

        <div className="bg-white rounded-lg p-4 mb-8 text-sm" style={{ border: "1px solid #E8EAED", color: "#666" }}>
          <strong style={{ color: "#222" }}>How this works:</strong>{" "}
          For each sampled data point, we make a real HTTP request to the source URL.{" "}
          A &quot;Verified&quot; result means the URL returned 200 and the page content contains words from the scraped text.{" "}
          &quot;Blocked&quot; means the site returned 403/429 (expected for Reddit, which blocks automated requests).{" "}
          You can click any URL to verify it yourself.
        </div>

        {loading && (
          <div className="flex items-center gap-3 mb-8" style={{ color: "#999" }}>
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#9146FF transparent transparent transparent" }} />
            Checking {data ? data.totalChecked : "..."} source URLs...
          </div>
        )}

        {data && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="bg-white rounded-lg p-4 text-center" style={{ border: "1px solid #E8EAED" }}>
                <div className="text-2xl font-bold" style={{ color: "#9146FF" }}>{data.totalDataPoints.toLocaleString()}</div>
                <div className="text-xs" style={{ color: "#999" }}>Total Data Points</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center" style={{ border: "1px solid #E8EAED" }}>
                <div className="text-2xl font-bold" style={{ color: "#222" }}>{data.totalChecked}</div>
                <div className="text-xs" style={{ color: "#999" }}>URLs Checked</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center" style={{ border: "1px solid #E8EAED" }}>
                <div className="text-2xl font-bold" style={{ color: "#22C55E" }}>{data.verified}</div>
                <div className="text-xs" style={{ color: "#999" }}>Verified</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center" style={{ border: "1px solid #E8EAED" }}>
                <div className="text-2xl font-bold" style={{ color: "#EAB308" }}>{data.blocked}</div>
                <div className="text-xs" style={{ color: "#999" }}>Blocked by Site</div>
              </div>
            </div>

            {/* Source breakdown */}
            <div className="bg-white rounded-lg p-4 mb-8" style={{ border: "1px solid #E8EAED" }}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "#222" }}>Source Breakdown</h2>
              <div className="space-y-2">
                {data.sourceBreakdown.map((s) => (
                  <div key={s.source} className="flex items-center justify-between text-xs">
                    <span className="w-24" style={{ color: "#444" }}>{SOURCE_LABELS[s.source] ?? s.source}</span>
                    <div className="flex-1 mx-3 h-3 rounded-full overflow-hidden flex" style={{ background: "#F3F4F6" }}>
                      <div
                        className="h-full rounded-l-full"
                        style={{ width: `${s.sampled ? (s.verified / s.sampled) * 100 : 0}%`, background: "#22C55E" }}
                      />
                      <div
                        className="h-full"
                        style={{ width: `${s.sampled ? (s.blocked / s.sampled) * 100 : 0}%`, background: "#EAB308" }}
                      />
                    </div>
                    <span className="w-32 text-right" style={{ color: "#999" }}>
                      {s.verified} verified, {s.blocked} blocked
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual results */}
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#222" }}>Spot-Check Results</h2>
            <div className="space-y-3">
              {data.results.map((r) => {
                const style = STATUS_STYLES[r.status];
                return (
                  <div key={r.id} className="rounded-lg p-4" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
                      <span className="text-xs font-medium" style={{ color: "#222" }}>{style.label}</span>
                      <span className="text-xs" style={{ color: "#CCC" }}>|</span>
                      <span className="text-xs" style={{ color: "#999" }}>{SOURCE_LABELS[r.source] ?? r.source}</span>
                      {r.httpStatus && (
                        <>
                          <span className="text-xs" style={{ color: "#CCC" }}>|</span>
                          <span className="text-xs" style={{ color: "#999" }}>HTTP {r.httpStatus}</span>
                        </>
                      )}
                      {r.contentMatch !== undefined && (
                        <>
                          <span className="text-xs" style={{ color: "#CCC" }}>|</span>
                          <span className="text-xs" style={{ color: r.contentMatch ? "#22C55E" : "#EAB308" }}>
                            {r.contentMatch ? "Content matches" : "Content partial"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm mb-2 line-clamp-2" style={{ color: "#444" }}>&quot;{r.text}&quot;</p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline break-all"
                      style={{ color: "#9146FF" }}
                    >
                      {r.url}
                    </a>
                    {r.error && <p className="text-xs mt-1" style={{ color: "#999" }}>{r.error}</p>}
                  </div>
                );
              })}
            </div>

            {/* Re-run button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={runVerification}
                disabled={loading}
                className="text-xs text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ background: "#9146FF" }}
              >
                {loading ? "Checking..." : "Re-run Verification"}
              </button>
              <span className="text-xs" style={{ color: "#999" }}>
                Last checked: {new Date(data.checkedAt).toLocaleString()}
              </span>
            </div>
          </>
        )}

        {hasRun && !data && (
          <div className="text-sm" style={{ color: "#EF4444" }}>Verification failed. The API may be temporarily unavailable.</div>
        )}

        <div className="mt-12 pt-6 flex gap-3" style={{ borderTop: "1px solid #E8EAED" }}>
          <a href="/twitch-community" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:shadow-sm" style={{ background: "#F3F4F6", color: "#444" }}>
            Back to Dashboard
          </a>
          <a href="/twitch-community/methodology" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:shadow-sm" style={{ background: "#F3F4F6", color: "#444" }}>
            Methodology
          </a>
          <a href="https://github.com/hbschlac/twitch-community-research" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:shadow-sm" style={{ background: "#F3F4F6", color: "#444" }}>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
