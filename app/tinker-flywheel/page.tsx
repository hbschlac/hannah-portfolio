import { Suspense } from "react";
import { connection } from "next/server";
import { getSnapshot } from "@/lib/tinker-flywheel";
import { ThemeDrill, PhaseLegend, UserDefinition } from "./ThemeDrill";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Iteration Gap — Tinker Flywheel Analysis",
  description:
    "What stops developers from retraining? Analysis of 2,000+ public signals across Reddit, HN, GitHub, and Stack Overflow.",
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

async function Memo() {
  await connection();
  const snapshot = await getSnapshot();
  const total = snapshot?.totalFeedback ?? 0;
  const evalTheme = snapshot?.themes.find((t) => t.id === "evaluation");
  const evalPct = total > 0 && evalTheme ? Math.round((evalTheme.frequency / (snapshot?.phaseBreakdown.evaluate ?? 1 + (snapshot?.phaseBreakdown.iterate ?? 0))) * 100) : 50;
  const sourceCount = snapshot ? Object.keys(snapshot.sources).filter((k) => (snapshot.sources as Record<string, number>)[k] > 0).length : 5;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[640px] mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-4">
            Research Memo
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight">
            The Iteration Gap
          </h1>
          <p className="text-base text-neutral-500 mt-2 leading-relaxed">
            What stops developers from retraining more often — and why that&apos;s Tinker&apos;s flywheel.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 mb-12 pb-8 border-b border-neutral-200">
          <Stat value={total.toLocaleString() + "+"} label="data points" />
          <Stat value={sourceCount.toString()} label="sources" />
          <Stat value="18 mo" label="window" />
        </div>

        {/* The finding */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            The finding
          </p>
          <p className="text-lg md:text-xl text-neutral-900 leading-relaxed font-medium">
            Developers aren&apos;t avoiding retraining because training is hard.
            They&apos;re avoiding it because they can&apos;t tell if the last round worked.
          </p>
        </section>

        {/* The data */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            What the data shows
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed">
            Across {total.toLocaleString()}+ public signals — Reddit, Hacker News, GitHub Issues,
            Stack Overflow, Hugging Face Forums, and X/Twitter — evaluation is the dominant pain point
            after a fine-tuning job finishes. <strong>{evalPct}% of theme-matched feedback</strong> is
            about one question: <em>&ldquo;Did it actually get better?&rdquo;</em>
          </p>
          <p className="text-[15px] text-neutral-700 leading-relaxed mt-4">
            The second cluster is about what happens next: when to retrain, how to compare versions,
            how to iterate without starting over. These are lifecycle problems.
            Tinker solves the hardest part — distributed training. But the flywheel that turns a
            one-time training job into a platform developers never leave is <em>iteration</em>,
            and iteration has friction Tinker hasn&apos;t addressed.
          </p>
        </section>

        {/* Lifecycle */}
        <section className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
            The lifecycle
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm font-mono">
            <span
              className="px-3 py-1.5 bg-neutral-200 text-neutral-400 rounded"
              title="Run a fine-tuning job — what Tinker does today."
            >
              Train
            </span>
            <span className="text-neutral-300">&rarr;</span>
            <span
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded border border-amber-200 cursor-help"
              title="After a run: did the new model actually get better? Benchmarks, baseline comparisons, data-quality checks, regression detection."
            >
              Evaluate
            </span>
            <span className="text-neutral-300">&rarr;</span>
            <span
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded border border-blue-200 cursor-help"
              title="Between runs: what do I train next? When to retrain, how to update without starting over, which version to keep."
            >
              Iterate
            </span>
            <span className="text-neutral-300">&rarr;</span>
            <span className="text-neutral-300 text-xs">repeat</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Train is solved. Evaluate and Iterate are where developers get stuck.{" "}
            <span className="text-neutral-300">(Hover the chips for definitions.)</span>
          </p>
          <UserDefinition />
        </section>

        {/* Theme breakdown */}
        <section className="mb-12">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-4">
            Where the friction lives
          </p>
          <ThemeDrill themes={snapshot?.themes ?? []} />
          <PhaseLegend />
        </section>

        {/* So what */}
        <section className="mb-12 p-5 bg-neutral-100 rounded-lg">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-2">
            The so what
          </p>
          <p className="text-[15px] text-neutral-800 leading-relaxed">
            A fine-tuning API that also closes the evaluation loop doesn&apos;t just make
            developers&apos; lives easier — it makes them retrain more often. More training jobs
            = more compute consumed = compounding revenue. The gap between a training tool and
            a training <em>platform</em> is the iteration layer.
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-200 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-900 font-medium">Hannah Schlacter</p>
            <p className="text-xs text-neutral-400">April 2026</p>
          </div>
          <div className="flex gap-4 text-xs text-neutral-400">
            <a
              href="/tinker-flywheel/methodology"
              className="hover:text-neutral-600 transition-colors underline underline-offset-2"
            >
              Methodology
            </a>
            <a
              href="/tinker-flywheel/api/export"
              className="hover:text-neutral-600 transition-colors underline underline-offset-2"
            >
              Raw data (JSON)
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-neutral-900 font-mono">{value}</p>
      <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function TinkerFlywheelPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Memo />
    </Suspense>
  );
}
