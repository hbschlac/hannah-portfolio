import Image from "next/image";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "Hannah Schlacter — for Tribe AI",
  description:
    "A few on-spec artifacts that mirror the work of a forward-deployed AI delivery PM.",
  robots: { index: false, follow: false },
};

type Artifact = {
  title: string;
  href: string;
  preview: string; // /tribe-ai/*.png — falls back to null if file missing
  stats: string;
  problem: string;
  built: string;
  relevance: string;
  weekOne: string;
};

const ARTIFACTS: Artifact[] = [
  {
    title: "Vantara Agent Studio",
    href: "https://vantara-agent-studio.vercel.app",
    preview: "/tribe-ai/vantara-preview.png",
    stats:
      "Built solo · one session · live demo (no API key) at vantara-agent-studio.vercel.app/build?usecase=comms&demo=true",
    problem:
      "How does a non-technical ops lead at a healthcare F500 stand up a compliant AI agent without an engineering team?",
    built:
      "A no-code wizard using the Vercel AI SDK + Claude that generates and deploys agents for defined healthcare use cases — live and playable with no API key.",
    relevance:
      "This is the shape of a forward-deployed engagement: scope a client's use case, prototype end-to-end, get to a live demo without a team.",
    weekOne:
      "I'd bias toward shipping a thin working prototype before any spec doc — clients buy conviction from something they can click, not from slideware.",
  },
  {
    title: "Workspace AI Gaps",
    href: "https://schlacter.me/workspace-ai-gaps",
    preview: "/tribe-ai/workspace-ai-gaps-preview.png",
    stats:
      "1,096 real user data points · scraped + synthesized · methodology + GitHub repo public",
    problem:
      "What's actually slowing Gemini adoption inside Google Workspace — in users' own language, not in product-team language?",
    built:
      "A social-listening pipeline that pulls raw posts about Gemini Workspace, clusters them by friction theme, and surfaces drill-downs with the original quotes.",
    relevance:
      "Before delivering AI to a F500, a delivery PM has to know where adoption actually breaks. This is that qual research, run on myself.",
    weekOne:
      "I'd run this playbook on each client's internal population in the first two weeks — what are employees already saying about AI that the exec sponsor hasn't heard?",
  },
  {
    title: "Managed Agents Pulse",
    href: "https://schlacter.me/managed-agents-pulse",
    preview: "/tribe-ai/managed-agents-pulse-preview.png",
    stats: "Live data pipeline · refreshed automatically · Anthropic-shaped",
    problem:
      "Once an agent ships to production, how do you know it's actually working — not just technically running, but doing the job?",
    built:
      "A monitoring dashboard that tracks managed-agent health signals and surfaces anomalies a PM (not just an SRE) can act on.",
    relevance:
      "Delivery doesn't end at handoff. The PM who keeps the post-launch loop tight is the one clients re-hire.",
    weekOne:
      "I'd push for a 'Day-30 health check' ritual with every client — same dashboard shape, tuned to their use case.",
  },
];

function previewExists(relPath: string): boolean {
  try {
    const abs = path.join(process.cwd(), "public", relPath.replace(/^\//, ""));
    return fs.existsSync(abs);
  } catch {
    return false;
  }
}

export default function TribeAIPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 pt-14 pb-24">
        {/* Header */}
        <p className="text-xs tracking-widest uppercase text-muted">
          Hannah Schlacter · for Tribe AI
        </p>
        <h1 className="mt-4 text-lg sm:text-xl text-foreground leading-snug font-medium">
          A few things I&rsquo;ve built on my own time that mirror what a Tribe
          AI delivery PM does day-to-day — standing up working enterprise agent
          prototypes, listening to how real users describe AI adoption friction,
          and keeping agents healthy in production.
        </h1>
        <p className="mt-4 text-xs text-muted/80 leading-relaxed italic">
          Unsolicited and built on my own time — I don&rsquo;t have a
          relationship with Tribe AI. Just wanted to show, not tell.
        </p>

        {/* Read on Tribe */}
        <section className="mt-10 border-l-2 border-accent pl-4">
          <p className="text-xs tracking-widest uppercase text-muted mb-2">
            A read on Tribe
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Tribe sits in a unique spot: F500s referred in by OpenAI and
            Anthropic, expecting lab-grade rigor with consultancy-grade
            delivery. The forward-deployed PM is the person who turns that
            trust into working software — fast enough to keep the referral
            loop warm, careful enough that nothing embarrasses the lab that
            sent them. The three pieces below are my attempt to practice that
            muscle on my own.
          </p>
        </section>

        {/* Artifacts */}
        <section className="mt-12 space-y-8">
          <p className="text-xs tracking-widest uppercase text-muted">
            Artifacts
          </p>
          {ARTIFACTS.map((a, i) => (
            <ArtifactCard key={a.title} artifact={a} index={i + 1} />
          ))}
        </section>

        {/* Soft close */}
        <section className="mt-14 border-t border-border pt-8">
          <p className="text-sm text-foreground leading-relaxed">
            Happy to walk through any of these live — 15 minutes, your call.
          </p>
          <p className="mt-2 text-xs text-muted">
            <a
              href="mailto:hbschlac@gmail.com"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              hbschlac@gmail.com
            </a>{" "}
            · schlacter.me
          </p>
        </section>
      </div>
    </main>
  );
}

function ArtifactCard({
  artifact,
  index,
}: {
  artifact: Artifact;
  index: number;
}) {
  const hasPreview = previewExists(artifact.preview);
  return (
    <article className="rounded-xl border border-border overflow-hidden">
      {/* Preview */}
      {hasPreview ? (
        <a
          href={artifact.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-accent-light/40"
        >
          <Image
            src={artifact.preview}
            alt={`${artifact.title} preview`}
            width={1200}
            height={750}
            className="w-full h-auto"
            priority={index === 1}
          />
        </a>
      ) : (
        <a
          href={artifact.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-[16/10] bg-accent-light/40 flex items-center justify-center"
        >
          <span className="text-xs text-muted tracking-widest uppercase">
            {artifact.title} ↗
          </span>
        </a>
      )}

      {/* Body */}
      <div className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className="text-base font-medium text-foreground">
            <a
              href={artifact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-2"
            >
              {artifact.title} ↗
            </a>
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted/80 leading-snug">
          {artifact.stats}
        </p>

        <dl className="mt-4 space-y-2.5 text-sm leading-relaxed">
          <Row label="Problem I was solving" value={artifact.problem} />
          <Row label="What I built" value={artifact.built} />
          <Row label="Why it's relevant to Tribe" value={artifact.relevance} />
          <Row
            label="What I'd carry into Week 1 at Tribe"
            value={artifact.weekOne}
          />
        </dl>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-wider uppercase text-muted">
        {label}
      </dt>
      <dd className="text-foreground/90">{value}</dd>
    </div>
  );
}
