import type { Metadata } from "next";
import {
  QUOTES,
  EXPERIMENTS,
  LAUNCHES,
  STAGES,
  walmartFrictionByStage,
  stageLabel,
} from "@/lib/acc-pulse";
import type { Quote, JourneyStage } from "@/lib/acc-pulse";
import { PrintTrigger, PrintButton } from "./PrintTrigger";

export const metadata: Metadata = {
  title: "ACC Omni Customer Pulse — Print version",
  description:
    "Print / PDF-friendly version of the ACC Omni Customer Pulse memo. Self-contained, no network resources required.",
};

const BRAND_LABELS: Record<string, string> = {
  walmart_acc: "Walmart ACC",
  sams_club: "Sam's Club",
  costco: "Costco",
  discount_tire: "Discount Tire",
};

export default function PrintPage() {
  const walmartBrands = ["walmart_acc", "sams_club"] as const;
  const benchmarkBrands = ["costco", "discount_tire"] as const;
  const walmartQuotes = QUOTES.filter((q) => (walmartBrands as readonly string[]).includes(q.brand));
  const benchmarkQuotes = QUOTES.filter((q) => (benchmarkBrands as readonly string[]).includes(q.brand));
  const stages = walmartFrictionByStage();
  const totalFriction = stages.reduce((s, x) => s + x.frictionCount, 0);

  return (
    <>
      <PrintStyles />
      <PrintTrigger />
      <main className="print-root">
        <div className="no-print mx-auto max-w-3xl px-6 pt-8">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm text-neutral-700">
              This is the print-ready version. Use your browser&apos;s Save-as-PDF option from the
              print dialog.
            </p>
            <PrintButton />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Back to{" "}
            <a className="underline underline-offset-2" href="/acc-omni-customer-pulse">
              the interactive memo
            </a>
            .
          </p>
        </div>

        <article className="print-article">
          {/* Header */}
          <header className="print-header">
            <p className="eyebrow">ACC Omni Customer Pulse · Research memo · April 2026</p>
            <h1>Where the end-to-end ACC experience leaks</h1>
            <p className="lede">
              A read of the public customer voice across the six stages of the Walmart Auto Care
              omni journey — and the experiments the friction suggests.
            </p>
            <p className="byline">
              Hannah Schlacter · Independent research · schlacter.me/acc-omni-customer-pulse
            </p>
          </header>

          {/* Corpus snapshot */}
          <Section heading="Corpus at a glance">
            <div className="stat-row">
              <Stat value={walmartQuotes.length.toString()} label="Walmart / Sam’s voices" />
              <Stat value={benchmarkQuotes.length.toString()} label="Costco / Discount benchmark" />
              <Stat value="Reddit" label="single v1 source" />
              <Stat value="18 mo" label="window" />
            </div>
          </Section>

          {/* What we did */}
          <Section heading="What we did">
            <p>
              Pulled {walmartQuotes.length + benchmarkQuotes.length} verbatim public customer
              comments from Reddit via the pullpush API — 18-month window, April 2026 snapshot.
              Every quote links directly to the source comment. Each is mapped to a stage of the
              ACC omni journey: Discover → Schedule → Check-in → Service → Pickup → Post-visit.
              Included a Costco / Discount Tire comparison set to ground “what good sounds like”
              in the customer’s own words.
            </p>
          </Section>

          {/* How we validated */}
          <Section heading="How we validated">
            <p>
              Every friction theme called out here shows up in at least two independent Reddit
              comments — different threads, different users — for the same brand and stage. One
              thread alone wouldn’t make it in. No LLMs in the classification pipeline: I read
              each comment, confirmed the brand and journey stage, and kept the ones specific
              enough to teach something.
            </p>
            <p className="small">
              Known bias: Reddit skews toward users who wanted to say something, often strongly.
              This is a signal-finding exercise, not a population estimate of satisfaction — v2
              would add ConsumerAffairs, store reviews, and app store reviews for cross-channel
              triangulation.
            </p>
          </Section>

          {/* What we learned */}
          <Section heading="What we learned">
            <p>
              Friction concentrates at two stages: <strong>Check-in</strong> and{" "}
              <strong>Service</strong>. The pattern under both is the same — the digital promise
              (an appointment was booked, a service was paid for) doesn’t survive the handoff to
              the store. A 7am appointment becomes a 9am start. An in-app work order gets eaten
              mid-inspection. A customer is asked to walk to the parts store to get their own
              filter. Customers name the price they paid for saving money: their time,
              unpredictably.
            </p>
            <p>
              What Costco and Discount Tire win on isn’t price or speed — it’s a single
              predictable promise kept every time. “Free installation, free lifetime rotation,
              free road hazard” isn’t a better marketing line — it’s a better product. And
              reproducible.
            </p>
            <p className="small">
              One thing to say out loud: the team has internal survey and CSAT data with a
              thousand times the volume of this corpus. This isn’t meant to replace any of that.
              It’s public customer voice — the kind that lives on Reddit, store reviews, and app
              stores — meant to sit alongside internal signal and triangulate.
            </p>
          </Section>

          {/* Journey with all quotes inlined */}
          <Section heading={`Walmart & Sam's — friction by journey stage (${totalFriction} comments)`}>
            {STAGES.map((stage) => {
              const stageQuotes = walmartQuotes.filter((q) => q.stage === stage.id);
              const stageFrictionCount = stages.find((s) => s.id === stage.id)?.frictionCount ?? 0;
              if (stageQuotes.length === 0) return null;
              return (
                <div key={stage.id} className="stage-block">
                  <h3>
                    {stages.findIndex((s) => s.id === stage.id) + 1}. {stage.label}{" "}
                    <span className="count">
                      — {stageFrictionCount} friction / {stageQuotes.length} total
                    </span>
                  </h3>
                  <p className="small">{stage.description}</p>
                  <p className="hypothesis">{stage.hypothesis}</p>
                  <QuoteList quotes={stageQuotes} />
                  <BenchmarkBlock
                    stage={stage.id}
                    quotes={benchmarkQuotes.filter((q) => q.stage === stage.id)}
                  />
                </div>
              );
            })}
          </Section>

          {/* Launches */}
          <Section heading="Public ACC / Sam's launches — Oct 2024 → Apr 2026">
            <p className="small">
              Five public launches in the window. These anchor each experiment to the Walmart
              roadmap rather than proposing new direction cold.
            </p>
            <table className="launch-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Launch</th>
                  <th>Scale</th>
                </tr>
              </thead>
              <tbody>
                {LAUNCHES.slice()
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((l) => (
                    <tr key={l.id}>
                      <td className="nowrap mono">{l.date}</td>
                      <td>
                        <strong>{l.shortTitle}</strong>
                        <br />
                        <span className="small">{l.summary}</span>
                        <br />
                        <span className="source">
                          {l.sourceName}: {l.sourceUrl}
                        </span>
                      </td>
                      <td className="small">{l.scale}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Section>

          {/* Experiments */}
          <Section heading="What I'd test">
            <p className="small">
              Each hypothesis is grounded in a pattern the data surfaces, maps to what ACC of the
              Future is already piloting, and is small enough to test at a store cluster without
              touching core systems.
            </p>
            {EXPERIMENTS.map((e, i) => (
              <div key={e.id} className="exp-card">
                <p className="eyebrow">
                  Experiment #{String(i + 1).padStart(2, "0")} · Customer journey ·{" "}
                  {stageLabel(e.stage)}
                </p>
                <h3>{e.title}</h3>
                <dl>
                  <dt>Hypothesis</dt>
                  <dd>{e.hypothesis}</dd>
                  <dt>How I’d test it</dt>
                  <dd>{e.test}</dd>
                  <dt>Primary metric</dt>
                  <dd>{e.primaryMetric}</dd>
                  <dt>Secondary metrics</dt>
                  <dd>
                    <ul>
                      {e.secondaryMetrics.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </dd>
                  <dt>Guardrail</dt>
                  <dd>{e.guardrail}</dd>
                </dl>
              </div>
            ))}
          </Section>

          {/* Footer / disclosure */}
          <footer className="print-footer">
            <p className="eyebrow">Transparency</p>
            <p>
              This is a voluntary, unpaid personal research project. I don’t work for Walmart and
              no Walmart data was used — every quote is public and links back to its Reddit
              source. I built the scraping pipeline, the analysis, and this page using AI tools
              (Claude Code) for coding + draft iteration; all editorial decisions, quote
              selection, journey-stage mapping, experiment design, and memo writing are mine.
            </p>
            <p className="small">
              Hannah Schlacter · April 2026 · schlacter.me/acc-omni-customer-pulse
            </p>
          </footer>
        </article>
      </main>
    </>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-section">
      <h2>{heading}</h2>
      {children}
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function QuoteList({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) return null;
  return (
    <ul className="quote-list">
      {quotes.map((q) => (
        <li key={q.id} className={`quote quote-${q.sentiment}`}>
          <p className="quote-body">&ldquo;{q.quote}&rdquo;</p>
          <p className="quote-meta">
            <span>{BRAND_LABELS[q.brand] ?? q.brand}</span>
            <span> · </span>
            <span className="capitalize-first">{q.sentiment}</span>
            <span> · </span>
            <span>{q.date ?? "undated"}</span>
            <span> · </span>
            <span className="url-break">{q.url}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function BenchmarkBlock({
  stage,
  quotes,
}: {
  stage: JourneyStage;
  quotes: Quote[];
}) {
  if (quotes.length === 0) return null;
  // Keep it tight: show the 2 highest-signal benchmark quotes per stage.
  const top = quotes.slice(0, 2);
  return (
    <div className="benchmark">
      <p className="eyebrow">Benchmark — what &ldquo;good&rdquo; sounds like</p>
      <QuoteList quotes={top} />
    </div>
  );
}

/** Inline print-optimized styles. Isolated from site CSS so body defaults apply. */
function PrintStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        html, body { background: #ffffff; color: #1a1a1a; }
        .print-root { background: #ffffff; }
        .print-article {
          max-width: 760px;
          margin: 0 auto;
          padding: 32px 48px 48px 48px;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          color: #1a1a1a;
          line-height: 1.55;
          font-size: 11.5pt;
        }
        .print-header { margin-bottom: 28px; border-bottom: 1px solid #d4d4d4; padding-bottom: 18px; }
        .print-header h1 { font-size: 22pt; font-weight: 600; line-height: 1.15; margin: 8px 0 10px 0; color: #0a0a0a; letter-spacing: -0.01em; }
        .print-header .lede { font-size: 13pt; color: #404040; margin: 0 0 12px 0; }
        .print-header .byline { font-size: 9.5pt; color: #666; margin: 0; }
        .eyebrow { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.1em; color: #525252; margin: 0 0 4px 0; }
        .print-section { margin-top: 22px; page-break-inside: avoid; }
        .print-section h2 { font-size: 14pt; font-weight: 600; color: #0a0a0a; border-bottom: 1px solid #d4d4d4; padding-bottom: 6px; margin: 0 0 12px 0; }
        .print-section h3 { font-size: 11.5pt; font-weight: 600; margin: 14px 0 4px 0; color: #0a0a0a; }
        .print-section h3 .count { font-weight: 400; color: #525252; font-size: 10pt; }
        .print-section p { margin: 0 0 10px 0; color: #262626; }
        .print-section p.small { font-size: 10pt; color: #525252; }
        .print-section p.hypothesis { font-size: 10.5pt; color: #9f1239; background: #fff1f2; border-left: 3px solid #fda4af; padding: 8px 10px; margin: 10px 0; font-style: italic; }
        .stat-row { display: flex; gap: 24px; flex-wrap: wrap; padding: 12px 0; }
        .stat { min-width: 120px; }
        .stat-value { font-size: 18pt; font-weight: 600; color: #0a0a0a; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; line-height: 1.1; }
        .stat-label { font-size: 9pt; color: #525252; margin-top: 2px; }
        .stage-block { margin-bottom: 16px; page-break-inside: avoid; }
        .quote-list { list-style: none; padding: 0; margin: 8px 0 12px 0; }
        .quote { margin-bottom: 10px; padding: 8px 10px 8px 14px; border-left: 3px solid #e5e5e5; page-break-inside: avoid; }
        .quote-negative { border-left-color: #fb7185; }
        .quote-positive { border-left-color: #34d399; }
        .quote-mixed { border-left-color: #fbbf24; }
        .quote-body { font-style: italic; color: #262626; margin: 0 0 4px 0; font-size: 10.5pt; line-height: 1.5; }
        .quote-meta { font-size: 8.5pt; color: #525252; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
        .quote-meta .capitalize-first { text-transform: capitalize; }
        .url-break { word-break: break-all; }
        .benchmark { margin-top: 6px; padding-top: 6px; }
        .benchmark .quote { border-left-color: #34d399; background: #f0fdf4; }
        .launch-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 8px; }
        .launch-table th { text-align: left; border-bottom: 1px solid #a3a3a3; padding: 6px 8px; font-weight: 600; color: #404040; }
        .launch-table td { vertical-align: top; border-bottom: 1px solid #e5e5e5; padding: 10px 8px; }
        .launch-table td.nowrap { white-space: nowrap; }
        .launch-table .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        .launch-table .source { font-size: 8.5pt; color: #525252; word-break: break-all; }
        .exp-card { border: 1px solid #e5e5e5; border-radius: 6px; padding: 14px 16px; margin: 12px 0; page-break-inside: avoid; }
        .exp-card h3 { margin: 4px 0 10px 0; font-size: 12pt; }
        .exp-card dl { margin: 0; }
        .exp-card dt { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8.5pt; color: #525252; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; }
        .exp-card dd { margin: 2px 0 0 0; font-size: 10.5pt; color: #1f1f1f; }
        .exp-card dd ul { margin: 4px 0 0 0; padding-left: 18px; }
        .exp-card dd ul li { margin: 2px 0; }
        .print-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #d4d4d4; color: #404040; }
        .print-footer p { margin: 0 0 6px 0; font-size: 10pt; }
        .print-footer p.small { font-size: 9pt; color: #666; }

        /* Mobile screen fallback — keep readable before print */
        @media (max-width: 600px) {
          .print-article { padding: 20px 18px; font-size: 11pt; }
          .print-header h1 { font-size: 20pt; }
          .stat-row { gap: 16px; }
          .stat { min-width: 90px; }
        }

        /* Print-specific */
        @media print {
          @page { size: Letter; margin: 0.6in; }
          .no-print { display: none !important; }
          html, body { background: #ffffff !important; }
          .print-article { padding: 0; max-width: none; font-size: 10.5pt; }
          .print-header h1 { font-size: 20pt; }
          .print-section { page-break-inside: auto; }
          .stage-block, .exp-card, .quote { page-break-inside: avoid; }
          a { color: inherit; text-decoration: none; }
          /* Keep URLs legible on paper via the meta row, not via link styling. */
        }
      `,
      }}
    />
  );
}
