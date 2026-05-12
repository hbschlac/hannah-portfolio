import type { Metadata } from "next";
import { QUOTES, sourceBreakdown, walmartQuoteCount, benchmarkQuoteCount } from "@/lib/acc-pulse";

export const metadata: Metadata = {
  title: "Methodology — ACC Omni Customer Pulse",
  description: "How this data was collected, filtered, and categorized.",
};

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  consumeraffairs: "ConsumerAffairs",
  google: "Google reviews",
  yelp: "Yelp",
  app_store: "App Store reviews",
  play_store: "Play Store reviews",
  youtube: "YouTube comments",
};

export default function MethodologyPage() {
  const sources = sourceBreakdown();
  const walmartN = walmartQuoteCount();
  const benchmarkN = benchmarkQuoteCount();
  const total = QUOTES.length;

  return (
    <>
      <style>{`html,body{background:#fafafa}`}</style>
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[640px] mx-auto px-6 py-16 md:py-24">
          <a
            href="/acc-omni-customer-pulse"
            className="text-xs text-neutral-600 hover:text-neutral-700 transition-colors"
          >
            &larr; Back to memo
          </a>

          <h1 className="text-2xl font-semibold text-neutral-900 mt-6 mb-2 tracking-tight">
            Methodology
          </h1>
          <p className="text-sm text-neutral-600 mb-10">
            How this data was collected, filtered, and categorized. No internal Walmart data is
            used anywhere on this site — everything below is sourced from public pages.
          </p>

          <Section title="Scope">
            <p>
              Brands covered: Walmart Auto Care Centers, Sam&apos;s Club Tire &amp; Battery,
              Costco Tire Center, Discount Tire. Costco and Discount Tire are included as
              benchmarks to ground &ldquo;what good sounds like&rdquo; in customer voice — not as
              a competitive analysis.
            </p>
            <p className="mt-3">Journey stages (exactly one assigned per quote):</p>
            <ol className="mt-2 ml-4 list-decimal space-y-1">
              <li>Discover — browsing tires, fitment, pricing on walmart.com or the Walmart app</li>
              <li>Schedule — booking the appointment, picking service, time, and store</li>
              <li>Check-in — arrival, key handoff, wait expectations</li>
              <li>Service — the work itself, communication during, verification</li>
              <li>Pickup — payment, confirming work done, walking out</li>
              <li>Post-visit — warranty, rotation reminders, rebooking, returns</li>
            </ol>
          </Section>

          <Section title="Data sources">
            <p>
              {total} verbatim customer quotes from public sources, collected April 10–14, 2026.
              18-month freshness window (October 2024 – April 2026) where dates are visible.
            </p>
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="text-left text-neutral-600 border-b border-neutral-200">
                  <th className="pb-2 font-normal">Source</th>
                  <th className="pb-2 font-normal text-right">Quotes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sources)
                  .filter(([, n]) => n > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, n]) => (
                    <tr key={src} className="border-b border-neutral-100">
                      <td className="py-2 text-neutral-700">{SOURCE_LABELS[src] ?? src}</td>
                      <td className="py-2 text-right font-mono text-neutral-600">{n}</td>
                    </tr>
                  ))}
                <tr>
                  <td className="pt-3 font-medium text-neutral-800">Total</td>
                  <td className="pt-3 text-right font-mono text-neutral-800">{total}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-[13px] text-neutral-600">
              Split: {walmartN} Walmart/Sam&apos;s quotes, {benchmarkN} Costco/Discount Tire
              benchmark quotes. v1 is Reddit-only because that&apos;s what I could collect
              verbatim and date-stamped in the time I gave myself. v2 would fold in
              ConsumerAffairs, Google/Yelp store reviews, Walmart + Sam&apos;s app store reviews,
              and YouTube comments — each from a different failure mode distribution, which is
              the point of adding them.
            </p>
          </Section>

          <Section title="Inclusion rule">
            <p>
              A friction theme only surfaces in the top-level memo if it appears in{" "}
              <strong>≥ 2 independent Reddit comments</strong> — different threads, different
              users — for the same brand and the same journey stage. One viral thread
              doesn&apos;t make a theme. v2&apos;s corroboration rule tightens to &ldquo;≥ 2
              independent <em>platforms</em>&rdquo; once non-Reddit sources are added.
            </p>
            <p className="mt-3">
              Quote selection was human review, not LLM-judged. I read the post, made sure it was
              (a) about the right brand, (b) about the right journey stage, (c) specific enough to
              teach something (&ldquo;wait was long&rdquo; got cut; &ldquo;booked at 9am, walked
              out at 1pm&rdquo; stayed).
            </p>
          </Section>

          <Section title="What this can and can&apos;t say">
            <p>
              <strong>Can say:</strong> which journey stages generate the most specific,
              repeatable public complaints, with verbatim examples, and what the comparable
              positive voice sounds like for competitors.
            </p>
            <p className="mt-3">
              <strong>Cannot say:</strong> population-level satisfaction, incidence rate, or how
              these patterns would rank against internal CSAT / NPS data the Walmart team already
              has. Public review data skews toward customers with strong feelings — usually
              negative — so absolute shares should be read as relative-within-corpus, not
              absolute-in-the-world.
            </p>
          </Section>

          <Section title="What v2 would add">
            <p>
              v1 is intentionally small and Reddit-only — the fastest way to prove the journey
              framing works before investing in a broader pipeline. v2 sharpens three things.
            </p>

            <div className="mt-5">
              <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">
                1 · More sources, different failure modes
              </p>
              <p className="text-[14px] leading-relaxed">
                Reddit captures a specific type of customer: the one who wanted to tell a story.
                Each additional source adds a different lens — and the blind spots of the
                current data are where the most expensive leaks tend to live.
              </p>
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="text-left text-neutral-600 border-b border-neutral-200">
                    <th className="pb-2 font-normal">Source</th>
                    <th className="pb-2 font-normal">What it catches that Reddit doesn&apos;t</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  <tr className="border-b border-neutral-100 align-top">
                    <td className="py-2 pr-3 text-neutral-700 font-medium whitespace-nowrap">
                      App store reviews
                    </td>
                    <td className="py-2 text-neutral-600">
                      Pre-visit abandoners — the shoppers who churn at the Discover / Schedule
                      stages, never enter a store, and never post about it.
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 align-top">
                    <td className="py-2 pr-3 text-neutral-700 font-medium whitespace-nowrap">
                      Google / Yelp store reviews
                    </td>
                    <td className="py-2 text-neutral-600">
                      Store-level variance. Friction is geographic — some ACCs are great, some
                      aren&apos;t. Per-store review data would show which patterns are systemic
                      vs. hot-spot.
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 align-top">
                    <td className="py-2 pr-3 text-neutral-700 font-medium whitespace-nowrap">
                      ConsumerAffairs
                    </td>
                    <td className="py-2 text-neutral-600">
                      Escalation-stage complaints — warranty denials, damage claims, formal
                      disputes. The failure modes that cost money on the back end.
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100 align-top">
                    <td className="py-2 pr-3 text-neutral-700 font-medium whitespace-nowrap">
                      YouTube comments
                    </td>
                    <td className="py-2 text-neutral-600">
                      Shoppers actively comparing ACC to Costco / Discount mid-decision — the
                      Discover-stage switchers.
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[13px] text-neutral-600 leading-relaxed mt-3">
                Corroboration rule tightens with the source expansion: v2 requires{" "}
                <strong>≥ 2 independent <em>platforms</em></strong> (not just 2 Reddit comments)
                before a theme lands on the memo.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">
                2 · Weekly auto-refresh
              </p>
              <p className="text-[14px] leading-relaxed">
                Replace the manual curation with a scheduled job that pulls, dedupes, and
                re-tags on a weekly cadence. Pattern already running on two of my other research
                projects (
                <a
                  href="/tinker-flywheel"
                  className="underline underline-offset-2 hover:text-neutral-900"
                >
                  tinker-flywheel
                </a>
                ,{" "}
                <a
                  href="/managed-agents-pulse"
                  className="underline underline-offset-2 hover:text-neutral-900"
                >
                  managed-agents-pulse
                </a>
                ) — a day of work to port, and it keeps the link live for anyone reopening it
                weeks from now.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">
                3 · Per-store heatmap
              </p>
              <p className="text-[14px] leading-relaxed">
                Once Google review data is in, every quote gets a store ID. A map view would
                show which ACC locations generate disproportionate friction at each journey
                stage — turning &ldquo;check-in is broken&rdquo; into &ldquo;check-in is broken
                at these 40 stores, where the common thread is [X].&rdquo; That&apos;s the
                version a regional ops lead could actually act on.
              </p>
            </div>
          </Section>

          <footer className="border-t border-neutral-200 pt-8 mt-10 text-xs text-neutral-600">
            <p>Hannah Schlacter · April 2026 · Independent research, no internal data used.</p>
          </footer>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-neutral-900 mb-3">{title}</h2>
      <div className="text-[15px] text-neutral-700 leading-relaxed space-y-1">{children}</div>
    </section>
  );
}
