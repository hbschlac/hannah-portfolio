import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Connectors } from "./Connectors";
import { CopyText } from "./CopyText";
import { SetupSteps } from "./SetupSteps";
import { UseCases } from "./UseCases";

const KIT_URL = "https://github.com/hbschlac/career-kit";
const PAGE_URL = "https://schlacter.me/career-kit";

const DESCRIPTION =
  "12 Claude skills that run your job search in your voice, from your facts: tailored resumes, outreach, fit scores and a job tracker. About 20 minutes to set up. No coding.";

export const metadata: Metadata = {
  title: "Career Kit — schlacter.me",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Career Kit: Claude skills for your job search",
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Kit: Claude skills for your job search",
    description: DESCRIPTION,
  },
};

const BENEFITS = [
  {
    title: "It writes like you.",
    body: "Setup reads 3–5 things you wrote yourself and turns them into voice rules. Every draft follows them, and lines that sound like AI get flagged before you send anything.",
  },
  {
    title: "It never makes things up.",
    body: "Every claim comes from your own facts file. When a job asks for something it can't find, it asks you: once, with every gap in one list. No guessed numbers.",
  },
  {
    title: "It learns from your edits.",
    body: "Correct a draft, then say “learn from this.” Your fix becomes a rule, so you never give the same note twice.",
  },
];

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Do I need to know how to code?",
    a: "No. You type what you want in plain English. The only GitHub part is making your copy, once.",
  },
  {
    q: "What does it cost?",
    a: "The kit is free. Claude Code needs a paid Claude plan: Pro, Max or Team. Composio is optional and has a free plan, no credit card.",
  },
  {
    q: "Who can see my resume and answers?",
    a: (
      <>
        Only you, as long as your copy is Private. Everything about you lives in one folder of your
        copy (it&apos;s called <code>profile</code>), inside your own GitHub account. I can&apos;t
        see it, and nothing flows back to my copy. Setup checks that your copy is private before it
        saves anything.
      </>
    ),
  },
  {
    q: "Is it only for product managers?",
    a: "No. I built it during my own PM search. Setup asks what roles you want, and every skill works from your answers: engineering, design, marketing, operations, sales.",
  },
  {
    q: "What if Claude gets something wrong?",
    a: "Tell it what's wrong in plain words. Then say “learn from this” and it saves your correction as a rule, so the same mistake doesn't come back.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes, once it's set up: the Code tab in the Claude app opens the same sessions. Do the setup on a computer, though. It's easier.",
  },
  {
    q: "I already use Claude Code in a terminal. Can I skip the browser?",
    a: (
      <>
        Yes. Make your private copy (step 2), then run{" "}
        <code>git clone https://github.com/&lt;your-username&gt;/career-kit</code>,{" "}
        <code>cd career-kit</code> and <code>claude</code>, and say &ldquo;set me up.&rdquo;
      </>
    ),
  },
];

export default function CareerKitPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto w-full px-6 pt-16 pb-16">
        <Link href="/" className="text-xs text-muted transition-opacity hover:opacity-50">
          ← schlacter.me
        </Link>

        {/* Hero */}
        <p className="text-xs tracking-widest uppercase mt-10">Career Kit</p>
        <h1 className="text-2xl sm:text-3xl mt-2 leading-tight">
          My job-search system, packaged for yours
        </h1>
        <p className="text-sm sm:text-base mt-4 leading-relaxed text-muted">
          I built these 12 Claude skills to run my own job search: tailoring resumes, writing
          outreach, and scoring applications before a recruiter does. This copy has none of my data
          in it. You fill it with yours once, in about 20 minutes. Then you paste a job link and ask
          for what you need.
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          {["No coding", "About 20 minutes to set up", "Your copy stays private"].map((chip) => (
            <span
              key={chip}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#F5E0E6", color: "rgba(26,26,26,0.7)" }}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <a
            href="#setup"
            className="text-sm px-5 py-2.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "#1A1A1A", color: "#FFF" }}
          >
            Set it up, step by step ↓
          </a>
          <a
            href="#use-cases"
            className="text-sm px-5 py-2.5 rounded-lg border border-border bg-white transition-opacity hover:opacity-70"
          >
            What can it do for me?
          </a>
        </div>

        {/* What it is */}
        <Section id="what" eyebrow="What it is" title="A job-search helper that works from your facts">
          <p className="text-sm leading-relaxed">
            Claude is an AI assistant made by Anthropic. A <em>skill</em> is a saved set of
            instructions that teaches Claude to do one job the same careful way every time. This kit
            is 12 of them for a job search, plus one private folder of facts about you.
          </p>
          <p className="text-sm mt-3 leading-relaxed">
            Think: a resume writer, a recruiter and a career coach who all work from the same notes
            (yours).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-white p-5">
                <h3 className="text-sm font-medium">{b.title}</h3>
                <p className="text-sm mt-2 leading-relaxed text-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Use cases */}
        <Section id="use-cases" eyebrow="Use cases" title="What you can ask for">
          <p className="text-sm leading-relaxed text-muted mb-5">
            Most of a job search is the same chores on repeat: tailor the resume, write the note,
            check who wrote back. The kit does the chores. You do the interviews. Pick one to see
            how it works.
          </p>
          <UseCases />
        </Section>

        {/* Connectors */}
        <Section id="tools" eyebrow="Connections" title="What to connect, and what each one adds">
          <p className="text-sm leading-relaxed text-muted mb-5">
            With nothing connected, Claude can still draft everything in the chat. Each connection
            adds more. Switch them on and off to see what you&apos;d be able to do.
          </p>
          <Connectors />
        </Section>

        {/* Setup */}
        <Section id="setup" eyebrow="Setup" title="Set it up, step by step">
          <p className="text-sm leading-relaxed text-muted">
            About 20 minutes, on a computer. Before you start, have these ready:
          </p>
          <ul className="mt-3 mb-6 flex flex-col gap-2 text-sm leading-relaxed">
            <Need>
              <strong>A paid Claude plan</strong> (Pro, Max or Team). The free plan doesn’t
              include Claude Code.
            </Need>
            <Need>
              <strong>Your resume.</strong> A Google Doc works best. A PDF or Word file works too.
            </Need>
            <Need>
              <strong>An email address</strong> for a free GitHub account (step 1).
            </Need>
          </ul>
          <SetupSteps />
          <p className="text-xs mt-4 leading-relaxed text-muted">
            Your progress saves in this browser, so you can close the page and pick up where you
            left off.
          </p>
        </Section>

        {/* FAQ */}
        <Section id="faq" eyebrow="Questions" title="Good to know">
          <div className="flex flex-col gap-2">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-white px-5 py-4">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 text-sm">
                  {f.q}
                  <span
                    className="shrink-0 text-xs text-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </summary>
                <p className="text-sm mt-3 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* Share */}
        <section className="mt-14 pt-8 border-t border-border">
          <p className="text-sm leading-relaxed">
            Know someone who&apos;s job hunting? Send them this page.
          </p>
          <div className="mt-3">
            <CopyText text={PAGE_URL} />
          </div>
          <p className="text-xs mt-4 leading-relaxed text-muted">
            Prefer to read it on GitHub? The kit&apos;s README has the same steps:{" "}
            <a href={KIT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">
              github.com/hbschlac/career-kit
            </a>
          </p>
        </section>
      </main>

      <footer className="max-w-3xl mx-auto w-full px-6 py-8 border-t border-border">
        <p className="text-xs text-muted">vibed with love | oakland, ca</p>
      </footer>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-8">
      <p className="text-xs tracking-widest uppercase text-muted">{eyebrow}</p>
      <h2 className="text-lg mt-1 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Need({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
