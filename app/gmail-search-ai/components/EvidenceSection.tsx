"use client";

import { useState } from "react";
import type { GmailActionSnapshot, Hypothesis } from "@/lib/gmail-action";

const THEME_LABELS: Record<string, string> = {
  accuracy: "Summary accuracy",
  "action-gap": "The action gap",
  voice: "Voice & personalization",
};

function QuoteBlock({ quote, url, subreddit }: {
  quote: string;
  url: string;
  subreddit: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <blockquote className="border-l-2 border-gray-200 pl-4 py-0.5 group-hover:border-gray-500 transition-colors">
        <p className="text-sm text-gray-700 leading-relaxed">
          &ldquo;{quote.length > 200 ? quote.slice(0, 200) + "…" : quote}&rdquo;
        </p>
        <cite className="block mt-1.5 text-xs text-gray-400 not-italic group-hover:text-gray-600 transition-colors">
          r/{subreddit} ↗
        </cite>
      </blockquote>
    </a>
  );
}

function ThemeBlock({ hypothesis, allExpanded }: { hypothesis: Hypothesis; allExpanded: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const show = allExpanded || expanded;
  const extraQuotes = hypothesis.quotes.slice(2);

  return (
    <div className="mb-10">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        {THEME_LABELS[hypothesis.id] ?? hypothesis.id}
      </h3>
      <div className="space-y-5">
        {hypothesis.quotes.slice(0, 2).map((q, i) => (
          <QuoteBlock key={i} quote={q.text} url={q.url} subreddit={q.subreddit} />
        ))}
        {extraQuotes.length > 0 && show && (
          extraQuotes.map((q, i) => (
            <QuoteBlock key={i + 2} quote={q.text} url={q.url} subreddit={q.subreddit} />
          ))
        )}
        {extraQuotes.length > 0 && !show && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            + {extraQuotes.length} more
          </button>
        )}
      </div>
    </div>
  );
}

export function EvidenceSection({ snapshot }: { snapshot: GmailActionSnapshot }) {
  return (
    <div className="max-w-2xl mx-auto px-6 pb-16">
      <div className="border-t border-gray-100 pt-10 mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">What users are saying</h2>
        <p className="text-sm text-gray-400">All posts linked to source. Click any quote to read on Reddit.</p>
      </div>

      {snapshot.hypotheses.map((h) => (
        <ThemeBlock key={h.id} hypothesis={h} allExpanded={false} />
      ))}
    </div>
  );
}
