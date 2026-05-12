"use client";

import { useState } from "react";
import type { Launch, Quote } from "@/lib/acc-pulse";
import { stageLabel } from "@/lib/acc-pulse";

const BRAND_LABELS: Record<string, string> = {
  walmart_acc: "Walmart ACC",
  sams_club: "Sam's Club",
  costco: "Costco",
  discount_tire: "Discount Tire",
};

/** Parse YYYY-MM to a numeric index relative to the start of the window. */
function monthIndex(ym: string, startYm: string) {
  const [y, m] = ym.split("-").map(Number);
  const [sy, sm] = startYm.split("-").map(Number);
  return (y - sy) * 12 + (m - sm);
}

export function LaunchTimeline({
  launches,
  quotes,
}: {
  launches: Launch[];
  quotes: Quote[];
}) {
  const walmart = quotes.filter((q) => q.brand === "walmart_acc" || q.brand === "sams_club");

  // Window: Oct 2024 → Apr 2026 (19 months)
  const startYm = "2024-10";
  const endYm = "2026-04";
  const totalMonths = monthIndex(endYm, startYm);

  const [openLaunch, setOpenLaunch] = useState<Launch | null>(null);

  return (
    <>
      <div className="border border-neutral-200 rounded-lg bg-white p-5">
        <p className="text-[13px] text-neutral-700 leading-relaxed mb-6">
          Five public launches in the 18-month window. Click any pin or row to see the source
          article, the stages it touched, and any Reddit voices that surfaced in the three months
          after it shipped.
        </p>

        {/* Horizontal timeline — pins above an axis line, safe padding so edges don't clip */}
        <div className="px-3 sm:px-4">
          <div className="relative h-12 mb-1">
            {launches.map((launch, i) => {
              const idx = monthIndex(launch.date, startYm);
              const left = (idx / totalMonths) * 100;
              const stacked =
                launches.findIndex((l) => l.date === launch.date && l.id !== launch.id) !== -1 &&
                i % 2 === 1;
              return (
                <button
                  key={launch.id}
                  onClick={() => setOpenLaunch(launch)}
                  className="absolute -translate-x-1/2 group flex flex-col items-center"
                  style={{ left: `${left}%`, top: stacked ? "26px" : "0px" }}
                  aria-label={`${launch.title} — ${launch.date}`}
                >
                  <span className="block w-3 h-3 rounded-full bg-neutral-900 group-hover:bg-rose-500 transition-colors border-2 border-white shadow" />
                  <span className="block w-px h-3 bg-neutral-300 mt-0.5" />
                </button>
              );
            })}
          </div>

          {/* Month axis */}
          <div className="relative h-5 border-t border-neutral-300">
            {["2024-10", "2025-04", "2025-10", "2026-04"].map((m, i, arr) => {
              const idx = monthIndex(m, startYm);
              const left = (idx / totalMonths) * 100;
              const isFirst = i === 0;
              const isLast = i === arr.length - 1;
              return (
                <span
                  key={m}
                  className="absolute text-[10px] font-mono text-neutral-600 mt-1 whitespace-nowrap"
                  style={{
                    left: isLast ? "auto" : isFirst ? "0%" : `${left}%`,
                    right: isLast ? "0%" : "auto",
                    transform: isFirst || isLast ? "none" : "translateX(-50%)",
                  }}
                >
                  {m}
                </span>
              );
            })}
          </div>
        </div>

        {/* Launch labels row — clickable */}
        <div className="mt-10 pt-3 border-t border-neutral-100 space-y-1">
          <p className="text-[11px] font-mono text-neutral-500 tracking-widest uppercase mb-2">
            Public ACC / Sam&apos;s launches (Oct 2024 – Apr 2026)
          </p>
          {launches
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((launch) => (
              <button
                key={launch.id}
                onClick={() => setOpenLaunch(launch)}
                className="w-full flex items-center gap-3 text-left py-1 px-2 -mx-2 rounded hover:bg-neutral-50 transition-colors group"
              >
                <span className="text-[11px] font-mono text-neutral-700 w-14 flex-shrink-0">
                  {launch.date}
                </span>
                <span className="text-[13px] text-neutral-800 truncate flex-1 min-w-0">
                  {launch.shortTitle}
                </span>
                <span className="hidden sm:inline text-[11px] text-neutral-600 truncate max-w-[180px]">
                  {launch.scale.split(" · ")[0]}
                </span>
                <span className="text-neutral-400 text-xs group-hover:text-rose-500 transition-colors flex-shrink-0">
                  →
                </span>
              </button>
            ))}
        </div>
      </div>

      <p className="text-[11px] text-neutral-600 mt-3 italic leading-relaxed">
        Dots = public launches. Click any launch for the source + the voices that emerged in the
        3 months after.
      </p>

      {openLaunch && (
        <LaunchDrawer
          launch={openLaunch}
          afterQuotes={walmart.filter(
            (q) =>
              q.date &&
              monthIndex(q.date, openLaunch.date) >= 0 &&
              monthIndex(q.date, openLaunch.date) <= 3,
          )}
          onClose={() => setOpenLaunch(null)}
        />
      )}
    </>
  );
}

function LaunchDrawer({
  launch,
  afterQuotes,
  onClose,
}: {
  launch: Launch;
  afterQuotes: Quote[];
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
              Launch · {launch.date}
            </p>
            <h3 className="text-lg font-semibold text-neutral-900 mt-1">{launch.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">{launch.scale}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-700 ml-4 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 space-y-6">
          <p className="text-[15px] text-neutral-800 leading-relaxed">{launch.summary}</p>

          <div className="flex flex-wrap gap-2">
            {launch.stagesTouched.map((s) => (
              <span
                key={s}
                className="text-[11px] font-mono bg-neutral-100 text-neutral-600 px-2 py-1 rounded"
              >
                {stageLabel(s)}
              </span>
            ))}
          </div>

          <div>
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-2">
              Source
            </p>
            <a
              href={launch.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-neutral-800 underline underline-offset-2 hover:text-rose-600"
            >
              {launch.sourceName} ↗
            </a>
          </div>

          <div>
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">
              Reddit voices in the 3 months after — {afterQuotes.length}
            </p>
            {afterQuotes.length === 0 ? (
              <p className="text-[13px] text-neutral-600 italic">
                No in-corpus Reddit comments tagged to Walmart/Sam&apos;s appeared in the three
                months after this launch. That&apos;s a limit of the v1 corpus, not a signal that
                the launch is silent.
              </p>
            ) : (
              <ul className="space-y-3">
                {afterQuotes.map((q) => (
                  <li key={q.id} className="border-l-2 border-neutral-200 pl-4">
                    <p className="text-[14px] text-neutral-800 leading-relaxed italic">
                      &ldquo;{q.quote}&rdquo;
                    </p>
                    <p className="text-xs text-neutral-600 mt-2 flex flex-wrap gap-x-2">
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
                        Reddit · {q.date} ↗
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
