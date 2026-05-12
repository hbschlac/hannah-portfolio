import type { Metadata } from "next";
import {
  QUOTES,
  EXPERIMENTS,
  LAUNCHES,
  walmartFrictionByStage,
  sourceBreakdown,
  stageLabel,
} from "@/lib/acc-pulse";
import { JourneyView } from "./JourneyView";
import { StatsBar } from "./StatsBar";
import { LaunchTimeline } from "./LaunchTimeline";

export const metadata: Metadata = {
  title: "ACC Omni Customer Pulse",
  description:
    "A read of the Walmart Auto Care Center end-to-end customer journey, from public voices — and the experiments the friction suggests.",
};

export default function AccOmniCustomerPulsePage() {
  const stages = walmartFrictionByStage();
  const walmartBrands = ["walmart_acc", "sams_club"];
  const benchmarkBrands = ["costco", "discount_tire"];
  const walmartQuotes = QUOTES.filter((q) => walmartBrands.includes(q.brand));
  const benchmarkQuotes = QUOTES.filter((q) => benchmarkBrands.includes(q.brand));
  const walmartN = walmartQuotes.length;
  const benchmarkN = benchmarkQuotes.length;
  const sources = sourceBreakdown();

  const topStage = [...stages].sort((a, b) => b.frictionShare - a.frictionShare)[0];

  return (
    <>
      <style>{`html,body{background:#fafafa}`}</style>
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[680px] mx-auto px-6 py-16 md:py-24">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-4">
              ACC Omni Customer Pulse · Research Memo
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight">
              Where the end-to-end ACC experience leaks
            </h1>
            <p className="text-base text-neutral-600 mt-3 leading-relaxed">
              A read of the public customer voice across the six stages of the Walmart Auto Care
              omni journey — and the experiments the friction suggests.
            </p>
          </div>

          {/* Stats — click to drill into sources */}
          <StatsBar
            walmartQuotes={walmartQuotes}
            benchmarkQuotes={benchmarkQuotes}
            sourceBreakdown={sources}
          />

          {/* What we did */}
          <Section label="What we did">
            <p>
              Pulled <strong>{walmartN + benchmarkN}</strong> verbatim public customer comments
              from Reddit via the pullpush API — 18-month window, April 2026 snapshot. Every
              quote on this page links directly to the source comment. Each is mapped to a stage
              of the ACC omni journey:{" "}
              <span className="font-mono text-xs text-neutral-600">
                Discover → Schedule → Check-in → Service → Pickup → Post-visit
              </span>
              . Included a Costco / Discount Tire comparison set to ground &ldquo;what good sounds
              like&rdquo; in the customer&apos;s own words.
            </p>
          </Section>

          {/* How we validated */}
          <Section label="How we validated">
            <p>
              Every friction theme called out below shows up in at least{" "}
              <strong>two independent Reddit comments</strong> (different threads, different
              users) for the same brand and stage — one thread alone wouldn&apos;t make it in. No
              LLMs in the classification pipeline: I read each comment, confirmed the brand and
              journey stage, and kept the ones specific enough to teach something. Every quote
              links to its source.
            </p>
            <p className="mt-3 text-[13px] text-neutral-600">
              Known bias: Reddit skews toward users who wanted to say something, often strongly.
              This is a signal-finding exercise, not a population estimate of satisfaction — v2
              would add ConsumerAffairs, store reviews, and app store reviews for cross-channel
              triangulation.{" "}
              <a
                href="/acc-omni-customer-pulse/methodology"
                className="underline underline-offset-2 hover:text-neutral-800"
              >
                Full methodology &rarr;
              </a>
            </p>
          </Section>

          {/* What we learned */}
          <Section label="What we learned">
            <p>
              Friction concentrates at two stages: <strong>Check-in</strong> and{" "}
              <strong>Service</strong>. The pattern under both is the same — the digital promise
              (an appointment was booked, a service was paid for) doesn&apos;t survive the
              handoff to the store. A 7am appointment becomes a 9am start. An in-app work order
              gets eaten mid-inspection. A customer is asked to walk to the parts store to get
              their own filter. Customers name the price they paid for saving money: their time,
              unpredictably.
            </p>
            <p className="mt-3">
              What Costco and Discount Tire win on isn&apos;t price or speed — it&apos;s a single
              predictable promise kept every time. &ldquo;Free installation, free lifetime
              rotation, free road hazard&rdquo; isn&apos;t a better marketing line — it&apos;s a
              better product. And reproducible.
            </p>
            <p className="mt-4 text-[13px] text-neutral-600 leading-relaxed">
              One thing to say out loud: the team has internal survey and CSAT data with a
              thousand times the volume of this corpus. This isn&apos;t meant to replace any of
              that. It&apos;s public customer voice — the kind that lives on Reddit, store
              reviews, and app stores — meant to sit alongside internal signal and triangulate.
            </p>
          </Section>

          {/* Timeline — launches vs. signal */}
          <section className="mb-12">
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-1">
              Launches vs. signal — Oct 2024 → Apr 2026
            </p>
            <p className="text-[13px] text-neutral-600 mb-4 leading-relaxed">
              Walmart has been shipping against this exact problem — ACC of the Future, the 6.6M
              hours-saved disclosure, Sam&apos;s chain-wide tire-center remodel. The pilots hit
              the right stages: check-in, service, pickup. What the Reddit signal suggests is
              that the blueprint works — it&apos;s just that 10 of 2,582 stores is 0.4%, and the
              friction lives in the other 99.6%.
            </p>
            <LaunchTimeline launches={LAUNCHES} quotes={QUOTES} />
          </section>

          {/* Journey view */}
          <section className="mb-12">
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">
              Walmart &amp; Sam&apos;s — friction by journey stage
            </p>
            <JourneyView stages={stages} quotes={QUOTES} />
          </section>

          {/* Experiments */}
          <section className="mb-12">
            <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-4">
              What I&apos;d test
            </p>
            <p className="text-[14px] text-neutral-600 mb-6 leading-relaxed">
              If I were on the team, these are the hypotheses I&apos;d want to run next — each
              one grounded in a pattern the data surfaces, each one a natural extension of what
              ACC of the Future is already piloting, and each one small enough to test at a
              store cluster without touching core systems.
            </p>
            <div className="space-y-6">
              {EXPERIMENTS.map((e, i) => (
                <ExperimentCard key={e.id} index={i + 1} experiment={e} />
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-neutral-200 pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-900 font-medium">Hannah Schlacter</p>
                <p className="text-xs text-neutral-600">April 2026 · Independent research</p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-neutral-700">
                <a
                  href="/acc-omni-customer-pulse/methodology"
                  className="hover:text-neutral-900 transition-colors underline underline-offset-2"
                >
                  Methodology
                </a>
                <a
                  href="/acc-omni-customer-pulse/print?autoprint=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 transition-colors underline underline-offset-2"
                >
                  Print / Save as PDF
                </a>
                <a
                  href="https://schlacter.me"
                  className="hover:text-neutral-900 transition-colors underline underline-offset-2"
                >
                  schlacter.me
                </a>
              </div>
            </div>
            <div className="text-[12px] text-neutral-600 leading-relaxed bg-neutral-100 border border-neutral-200 rounded-lg p-4">
              <p className="font-medium text-neutral-800 mb-1">Transparency</p>
              <p>
                This is a voluntary, unpaid personal research project. I don&apos;t work for
                Walmart and no Walmart data was used — every quote is public and links back to
                its Reddit source. I built the scraping pipeline, the analysis, and this page
                using AI tools (Claude Code) for coding + draft iteration; all editorial
                decisions, quote selection, journey-stage mapping, experiment design, and memo
                writing are mine.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase mb-3">{label}</p>
      <div className="text-[15px] text-neutral-800 leading-relaxed">{children}</div>
    </section>
  );
}

function ExperimentCard({
  index,
  experiment,
}: {
  index: number;
  experiment: (typeof EXPERIMENTS)[number];
}) {
  return (
    <div className="border border-neutral-200 rounded-lg p-5 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xs font-mono text-neutral-600 mt-1">
          #{String(index).padStart(2, "0")}
        </span>
        <div>
          <p className="text-[11px] font-mono text-neutral-500 tracking-widest uppercase">
            Customer journey · {stageLabel(experiment.stage)}
          </p>
          <h3 className="text-[17px] font-semibold text-neutral-900 mt-0.5">{experiment.title}</h3>
        </div>
      </div>
      <dl className="text-sm space-y-3 pl-8">
        <Field label="Hypothesis">{experiment.hypothesis}</Field>
        <Field label="How I&apos;d test it">{experiment.test}</Field>
        <Field label="Primary metric">{experiment.primaryMetric}</Field>
        <Field label="Secondary metrics">
          <ul className="list-disc list-outside ml-5 space-y-1">
            {experiment.secondaryMetrics.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Field>
        <Field label="Guardrail">{experiment.guardrail}</Field>
      </dl>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt
        className="text-[11px] font-mono text-neutral-500 tracking-widest uppercase mb-1"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <dd className="text-[14px] text-neutral-800 leading-relaxed">{children}</dd>
    </div>
  );
}
