"use client";

import { useState } from "react";
import type { JourneyStage, Quote } from "@/lib/acc-pulse";

interface StageRow {
  id: JourneyStage;
  label: string;
  shortLabel: string;
  description: string;
  hypothesis: string;
  frictionCount: number;
  frictionShare: number;
}

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

export function JourneyView({
  stages,
  quotes,
}: {
  stages: StageRow[];
  quotes: Quote[];
}) {
  const [openStage, setOpenStage] = useState<JourneyStage | null>(null);
  const totalFriction = stages.reduce((sum, s) => sum + s.frictionCount, 0);
  const maxCount = Math.max(1, ...stages.map((s) => s.frictionCount));

  return (
    <>
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <p className="text-[13px] text-neutral-700 leading-relaxed mb-4">
          Of <strong className="text-neutral-900">{totalFriction}</strong> Walmart / Sam&apos;s
          friction comments in the Reddit corpus, here&apos;s how they land by journey stage.
          Each bar shows how many comments mention friction at that step. Click any stage for
          the verbatim voices + the Costco / Discount Tire benchmark.
        </p>
        <div className="space-y-2">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setOpenStage(stage.id)}
              className="w-full flex items-center gap-3 py-3 px-3 -mx-3 rounded hover:bg-neutral-50 transition-colors text-left group"
            >
              <span className="text-xs font-mono text-neutral-600 w-5 flex-shrink-0">
                {stages.indexOf(stage) + 1}
              </span>
              <span className="text-sm text-neutral-800 w-[84px] sm:w-24 flex-shrink-0 font-medium">
                {stage.shortLabel}
              </span>
              <div className="flex-1 min-w-0">
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-400"
                    style={{ width: `${(stage.frictionCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-700 w-12 text-right flex-shrink-0">
                {stage.frictionCount} / {totalFriction}
              </span>
              <span className="text-neutral-400 text-xs group-hover:text-rose-500 transition-colors flex-shrink-0">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-neutral-600 mt-3 italic">
        Walmart &amp; Sam&apos;s only — positive Walmart quotes and the Costco / Discount benchmark are
        inside each stage drawer.
      </p>
      {openStage && (
        <Drawer
          stage={stages.find((s) => s.id === openStage)!}
          quotes={quotes.filter((q) => q.stage === openStage)}
          onClose={() => setOpenStage(null)}
        />
      )}
    </>
  );
}

function Drawer({
  stage,
  quotes,
  onClose,
}: {
  stage: StageRow;
  quotes: Quote[];
  onClose: () => void;
}) {
  const walmart = quotes.filter(
    (q) => (q.brand === "walmart_acc" || q.brand === "sams_club") && q.sentiment === "negative",
  );
  const positive = quotes.filter(
    (q) => (q.brand === "walmart_acc" || q.brand === "sams_club") && q.sentiment !== "negative",
  );
  const benchmark = quotes.filter(
    (q) => q.brand === "costco" || q.brand === "discount_tire",
  );

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
              Customer journey · {stage.shortLabel}
            </p>
            <h3 className="text-lg font-semibold text-neutral-900 mt-1">{stage.label}</h3>
            <p className="text-sm text-neutral-600 mt-1">{stage.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-700 transition-colors ml-4 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
            <p className="text-xs font-mono text-rose-500 tracking-widest uppercase mb-2">
              What the data suggests
            </p>
            <p className="text-sm text-neutral-800 leading-relaxed">{stage.hypothesis}</p>
          </div>

          {walmart.length > 0 && (
            <QuoteGroup
              heading={`Walmart & Sam's voices — ${walmart.length}`}
              color="rose"
              quotes={walmart}
            />
          )}

          {positive.length > 0 && (
            <QuoteGroup
              heading={`What customers like at Walmart — ${positive.length}`}
              color="neutral"
              quotes={positive}
            />
          )}

          {benchmark.length > 0 && (
            <QuoteGroup
              heading={`Benchmark — what &ldquo;good&rdquo; sounds like (Costco / Discount Tire)`}
              color="emerald"
              quotes={benchmark}
            />
          )}

          {walmart.length === 0 && positive.length === 0 && benchmark.length === 0 && (
            <p className="text-sm text-neutral-600 italic">
              No quotes collected for this stage in the current corpus.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuoteGroup({
  heading,
  color,
  quotes,
}: {
  heading: string;
  color: "rose" | "emerald" | "neutral";
  quotes: Quote[];
}) {
  const bar =
    color === "rose"
      ? "border-rose-300"
      : color === "emerald"
        ? "border-emerald-300"
        : "border-neutral-300";
  return (
    <div>
      <p
        className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3"
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      <ul className="space-y-4">
        {quotes.map((q) => (
          <li key={q.id} className={`border-l-2 ${bar} pl-4`}>
            <p className="text-[15px] text-neutral-800 leading-relaxed italic">
              &ldquo;{q.quote}&rdquo;
            </p>
            <p className="text-xs text-neutral-600 mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span>{BRAND_LABELS[q.brand] ?? q.brand}</span>
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
  );
}
