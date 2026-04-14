import { Suspense } from "react";
import { connection } from "next/server";
import { getSnapshot } from "@/lib/tinker-flywheel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — Tinker Flywheel Analysis",
  description: "Data sources, collection method, keyword matching, and verification process.",
};

export default function MethodologyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MethodologyContent />
    </Suspense>
  );
}

async function MethodologyContent() {
  await connection();
  const snapshot = await getSnapshot();
  const total = snapshot?.totalFeedback ?? 0;
  const sources = snapshot?.sources ?? {};

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[640px] mx-auto px-6 py-16 md:py-24">
        <a
          href="/tinker-flywheel"
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          &larr; Back to memo
        </a>

        <h1 className="text-2xl font-semibold text-neutral-900 mt-6 mb-2 tracking-tight">
          Methodology
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          How this data was collected, filtered, and categorized. No LLMs were used in the
          analysis — all classification is deterministic keyword matching.
        </p>

        <Section title="Data sources">
          <p>
            {total.toLocaleString()}+ data points from{" "}
            {Object.keys(sources).filter((k) => (sources as Record<string, number>)[k] > 0).length}{" "}
            public sources, collected April 2026. 18-month freshness window (October 2024 &ndash; April 2026).
          </p>
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-200">
                <th className="pb-2 font-normal">Source</th>
                <th className="pb-2 font-normal text-right">Items</th>
                <th className="pb-2 font-normal text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sources)
                .filter(([, v]) => (v as number) > 0)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([source, count]) => (
                  <tr key={source} className="border-b border-neutral-100">
                    <td className="py-2 font-mono text-neutral-700">{formatSource(source)}</td>
                    <td className="py-2 text-right text-neutral-600">{(count as number).toLocaleString()}</td>
                    <td className="py-2 text-right text-neutral-400">
                      {total > 0 ? Math.round(((count as number) / total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Section>

        <Section title="Collection method">
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Reddit</strong> &mdash; Pullpush.io API (Pushshift successor). Posts + comments
              across r/LocalLLaMA, r/MachineLearning, r/MLOps, r/deeplearning, r/artificial,
              r/datascience, r/LangChain.
            </li>
            <li>
              <strong>Hacker News</strong> &mdash; Algolia search API. Stories + comments.
              14 search queries covering fine-tuning, evaluation, retraining, drift.
            </li>
            <li>
              <strong>GitHub Issues</strong> &mdash; REST API search across thinking-machines-lab/tinker,
              huggingface/transformers, axolotl-ai-cloud/axolotl, unslothai/unsloth.
            </li>
            <li>
              <strong>Stack Overflow</strong> &mdash; StackExchange API. stackoverflow.com,
              datascience.stackexchange.com, ai.stackexchange.com.
            </li>
            <li>
              <strong>Twitter / X</strong> &mdash; Curated tweet IDs fetched via Twitter&apos;s public syndication API
              (<Code>cdn.syndication.twimg.com/tweet-result</Code>). High-signal tweets identified via web search
              across four themes: fine-tuning evaluation, catastrophic forgetting, training cost, and LoRA / adapters.
            </li>
            <li>
              <strong>Hugging Face Forums</strong> &mdash; Discourse search API on discuss.huggingface.co.
            </li>
          </ul>
        </Section>

        <Section title="Keyword matching (double-gate + proximity)">
          <p>
            Every item must pass three checks to be counted:
          </p>
          <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>
              <strong>Fine-tuning context</strong> &mdash; text must contain either one{" "}
              <em>strong</em> signal (<Code>fine-tun*</Code>, <Code>finetun*</Code>,{" "}
              <Code>lora</Code>, <Code>qlora</Code>, <Code>sft</Code>, <Code>rlhf</Code>,{" "}
              <Code>dpo</Code>, <Code>grpo</Code>, <Code>training run</Code>, <Code>unsloth</Code>,{" "}
              <Code>axolotl</Code>, <Code>tinker</Code>, <Code>instruction tun*</Code>) or two{" "}
              <em>weak</em> signals (<Code>adapter</Code>, <Code>checkpoint</Code>,{" "}
              <Code>base model</Code>, <Code>huggingface</Code>, <Code>transformers</Code>,{" "}
              <Code>distill</Code>, <Code>training data</Code>).
            </li>
            <li>
              <strong>Theme keyword</strong> &mdash; text must match at least one keyword from one
              of 7 theme categories (evaluation, data quality, catastrophic forgetting, retraining
              triggers, incremental training, version comparison, iteration overhead).
            </li>
            <li>
              <strong>Proximity</strong> &mdash; a theme keyword and a context word must appear
              within 150 characters of each other. Prevents matches where the two concepts are
              mentioned in passing in unrelated parts of the text.
            </li>
          </ol>
          <p className="mt-3">
            Items that pass are counted toward every matching theme. A noise filter rejects job
            listings, resumes, and self-promotional posts. Top quotes per theme are ranked by
            community score, boosted 2&times; for question/pain-point markers (&ldquo;how do I&rdquo;,
            &ldquo;struggling with&rdquo;, etc.) and deboosted to 0.1&times; for announcements
            (&ldquo;releases&rdquo;, &ldquo;introducing&rdquo;, etc.).
          </p>
        </Section>

        <Section title="Deduplication">
          <p>
            Two-pass dedup: (1) by unique item ID, (2) by normalized text (lowercase, whitespace-stripped,
            first 200 chars). Same post crossposted to multiple subreddits counts once.
          </p>
        </Section>

        <Section title="Theme definitions">
          <div className="space-y-3">
            <ThemeDef
              name="Did it actually get better?"
              phase="evaluate"
              description="Developers asking how to evaluate fine-tuned models, what benchmarks to use, how to compare against baseline."
            />
            <ThemeDef
              name="Is my data clean?"
              phase="evaluate"
              description="Training data quality issues — duplicates, mislabeling, bias, data prep friction."
            />
            <ThemeDef
              name="Did fine-tuning break something?"
              phase="evaluate"
              description="Catastrophic forgetting, capability regression, safety degradation after training."
            />
            <ThemeDef
              name="When should I retrain?"
              phase="iterate"
              description="Drift detection, staleness signals, retraining frequency decisions."
            />
            <ThemeDef
              name="How do I update without starting over?"
              phase="iterate"
              description="Incremental training, LoRA composition, adding new data to existing models."
            />
            <ThemeDef
              name="Which version is best?"
              phase="iterate"
              description="Model versioning, A/B comparison, rollback, experiment tracking."
            />
            <ThemeDef
              name="The overhead of another training run"
              phase="iterate"
              description="Cost, pipeline complexity, data refresh pain, time-to-retrain."
            />
          </div>
        </Section>

        <Section title="Known limitations">
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Discord communities</strong> (Unsloth, Axolotl, HuggingFace, EleutherAI) are high-signal
              sources but require authenticated bot access. Not included.
            </li>
            <li>
              <strong>Pullpush.io scores</strong> are captured at archive time and may differ from live Reddit scores.
              Score thresholds are set low (1+) to account for this.
            </li>
            <li>
              <strong>Keyword matching</strong> can over-match (generic ML posts that mention fine-tuning
              in passing) or under-match (discussions that use novel terminology).
              The double-gate filter reduces false positives but doesn&apos;t eliminate them.
            </li>
            <li>
              <strong>No sentiment analysis</strong> &mdash; items are categorized by topic, not by
              whether the author was frustrated, satisfied, or neutral.
            </li>
          </ul>
        </Section>

        <Section title="Reproducibility">
          <p>
            Full source code is available in the{" "}
            <a
              href="https://github.com/hbschlac/schlacter-me"
              className="underline underline-offset-2 hover:text-neutral-900 transition-colors"
              target="_blank"
              rel="noopener"
            >
              schlacter-me repository
            </a>
            . The scraper, keyword definitions, and analysis logic are in{" "}
            <Code>lib/tinker-flywheel.ts</Code>. Raw data is available via the{" "}
            <a
              href="/tinker-flywheel/api/export"
              className="underline underline-offset-2 hover:text-neutral-900 transition-colors"
            >
              export API
            </a>
            .
          </p>
        </Section>

        <footer className="border-t border-neutral-200 pt-8 mt-12">
          <a
            href="/tinker-flywheel"
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            &larr; Back to memo
          </a>
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-3">
        {title}
      </h2>
      <div className="text-[15px] text-neutral-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-mono rounded">
      {children}
    </code>
  );
}

function ThemeDef({ name, phase, description }: { name: string; phase: string; description: string }) {
  return (
    <div className="flex gap-2">
      <span
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
          phase === "evaluate" ? "bg-amber-500" : "bg-blue-500"
        }`}
      />
      <div>
        <p className="text-sm font-medium text-neutral-800">{name}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function formatSource(source: string): string {
  const map: Record<string, string> = {
    reddit: "Reddit",
    hackernews: "Hacker News",
    "github-issues": "GitHub Issues",
    stackoverflow: "Stack Overflow",
    huggingface: "Hugging Face",
    twitter: "Twitter / X",
    curated: "Curated",
  };
  return map[source] ?? source;
}
