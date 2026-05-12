"use client";

import { useState } from "react";
import type { Quote } from "@/lib/acc-pulse";
import { stageLabel } from "@/lib/acc-pulse";

type Drill = "walmart" | "benchmark" | "sources" | null;

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  consumeraffairs: "ConsumerAffairs",
  google: "Google",
  yelp: "Yelp",
  app_store: "App Store",
  play_store: "Play Store",
  youtube: "YouTube",
};

const BRAND_LABELS: Record<string, string> = {
  walmart_acc: "Walmart ACC",
  sams_club: "Sam's Club",
  costco: "Costco",
  discount_tire: "Discount Tire",
};

export function StatsBar({
  walmartQuotes,
  benchmarkQuotes,
  sourceBreakdown,
}: {
  walmartQuotes: Quote[];
  benchmarkQuotes: Quote[];
  sourceBreakdown: Record<string, number>;
}) {
  const [drill, setDrill] = useState<Drill>(null);
  const sourceCount = Object.values(sourceBreakdown).filter((n) => n > 0).length;

  return (
    <>
      <div className="flex flex-wrap gap-x-8 gap-y-4 mb-12 pb-8 border-b border-neutral-200">
        <StatButton
          value={walmartQuotes.length.toString()}
          label="Walmart / Sam's voices"
          onClick={() => setDrill("walmart")}
        />
        <StatButton
          value={benchmarkQuotes.length.toString()}
          label="Costco / Discount benchmark"
          onClick={() => setDrill("benchmark")}
        />
        <StatButton
          value={sourceCount.toString()}
          label="public sources"
          onClick={() => setDrill("sources")}
        />
        <a
          href="/acc-omni-customer-pulse/methodology"
          className="group"
          aria-label="18-month window — see methodology"
        >
          <p className="text-2xl font-semibold text-neutral-900 font-mono group-hover:text-rose-600 transition-colors">
            18 mo
          </p>
          <p className="text-xs text-neutral-600 mt-0.5 group-hover:text-neutral-600 transition-colors underline-offset-2 group-hover:underline">
            window ↗
          </p>
        </a>
      </div>
      <p className="text-[11px] text-neutral-600 -mt-10 mb-12 italic">
        Click any number to see the underlying sources.
      </p>

      {drill === "walmart" && (
        <QuoteDrawer
          heading="Every Walmart / Sam's Club quote in the corpus"
          subhead={`${walmartQuotes.length} verbatim Reddit comments, each with a permalink to the source thread.`}
          quotes={walmartQuotes}
          onClose={() => setDrill(null)}
        />
      )}
      {drill === "benchmark" && (
        <QuoteDrawer
          heading="Every Costco / Discount Tire benchmark quote"
          subhead={`${benchmarkQuotes.length} verbatim Reddit comments. Included to ground "what good sounds like" in customer voice.`}
          quotes={benchmarkQuotes}
          onClose={() => setDrill(null)}
        />
      )}
      {drill === "sources" && (
        <SourcesDrawer breakdown={sourceBreakdown} onClose={() => setDrill(null)} />
      )}
    </>
  );
}

function StatButton({
  value,
  label,
  onClick,
}: {
  value: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left"
      aria-label={`${value} ${label} — click to see sources`}
    >
      <p className="text-2xl font-semibold text-neutral-900 font-mono group-hover:text-rose-600 transition-colors">
        {value}
      </p>
      <p className="text-xs text-neutral-600 mt-0.5 group-hover:text-neutral-600 transition-colors underline-offset-2 group-hover:underline">
        {label} ↗
      </p>
    </button>
  );
}

function QuoteDrawer({
  heading,
  subhead,
  quotes,
  onClose,
}: {
  heading: string;
  subhead: string;
  quotes: Quote[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
              Source data
            </p>
            <h3 className="text-lg font-semibold text-neutral-900 mt-1">{heading}</h3>
            <p className="text-sm text-neutral-600 mt-1">{subhead}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-700 transition-colors ml-4 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <ul className="px-6 py-4 space-y-4">
          {quotes.map((q) => (
            <li key={q.id} className="border-l-2 border-neutral-200 pl-4 py-1">
              <p className="text-[14px] text-neutral-800 leading-relaxed italic">
                &ldquo;{q.quote}&rdquo;
              </p>
              <p className="text-xs text-neutral-600 mt-2 flex flex-wrap gap-x-2 gap-y-1">
                <span>{BRAND_LABELS[q.brand] ?? q.brand}</span>
                <span>·</span>
                <span>{stageLabel(q.stage)}</span>
                <span>·</span>
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-700 underline underline-offset-2"
                >
                  {SOURCE_LABELS[q.source] ?? q.source}
                  {q.date ? ` · ${q.date}` : ""} ↗
                </a>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SourcesDrawer({
  breakdown,
  onClose,
}: {
  breakdown: Record<string, number>;
  onClose: () => void;
}) {
  const entries = Object.entries(breakdown)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-neutral-200 flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
              Source data
            </p>
            <h3 className="text-lg font-semibold text-neutral-900 mt-1">Public sources used</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-600 border-b border-neutral-200">
                <th className="pb-2 font-normal">Source</th>
                <th className="pb-2 font-normal text-right">Quotes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([src, n]) => (
                <tr key={src} className="border-b border-neutral-100">
                  <td className="py-2 text-neutral-700">{SOURCE_LABELS[src] ?? src}</td>
                  <td className="py-2 text-right font-mono text-neutral-600">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[13px] text-neutral-600 leading-relaxed mt-5">
            v1 corpus is Reddit-only — pulled verbatim via the public{" "}
            <a
              href="https://pullpush.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-neutral-800"
            >
              pullpush.io
            </a>{" "}
            comment search API. Every quote links back to the exact comment on Reddit so anyone
            can verify the phrasing, author, and date.
          </p>
          <p className="text-[13px] text-neutral-600 leading-relaxed mt-3">
            v2 would add ConsumerAffairs, Google/Yelp store reviews, Walmart + Sam&apos;s app
            store reviews, and YouTube comments — each a different failure-mode distribution,
            which is the point of adding them. Read the{" "}
            <a
              href="/acc-omni-customer-pulse/methodology"
              className="underline underline-offset-2 hover:text-neutral-800"
            >
              full methodology
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
