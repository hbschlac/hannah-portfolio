"use client";

import type { Hypothesis } from "@/lib/gmail-action";

export function HypothesisCard({
  hypothesis,
  onViewEvidence,
}: {
  hypothesis: Hypothesis;
  onViewEvidence: (h: Hypothesis) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Color bar */}
      <div className="h-1 w-full" style={{ background: hypothesis.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Tag + icon */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: hypothesis.color }}
          >
            {hypothesis.icon} H{hypothesis.id === "accuracy" ? "1" : hypothesis.id === "action-gap" ? "2" : "3"}
          </span>
          {hypothesis.frequency > 0 && (
            <span className="text-xs text-gray-400 font-medium">
              {hypothesis.frequency} posts matched
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold text-gray-900 text-base leading-snug">{hypothesis.name}</h3>

        {/* Tagline */}
        <p className="text-sm font-medium mt-1.5" style={{ color: hypothesis.color }}>
          {hypothesis.tagline}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-2 leading-relaxed flex-1">
          {hypothesis.description}
        </p>

        {/* Quotes */}
        {hypothesis.quotes.length > 0 && (
          <div className="mt-4 space-y-3">
            {hypothesis.quotes.slice(0, 2).map((q, i) => (
              <a
                key={i}
                href={q.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-gray-50 border border-gray-100 p-3 hover:border-gray-300 transition-colors group"
              >
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">&ldquo;{q.text}&rdquo;</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  <span>r/{q.subreddit}</span>
                  <span>·</span>
                  <span>u/{q.author}</span>
                  <span className="ml-auto group-hover:text-blue-500 transition-colors text-gray-300">↗</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Competitor signal */}
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Competitor signal: </span>
            {hypothesis.competitorSignal}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => onViewEvidence(hypothesis)}
          className="mt-4 w-full text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
        >
          View all {hypothesis.frequency > 0 ? `${hypothesis.frequency} ` : ""}posts →
        </button>
      </div>
    </div>
  );
}
