import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claude Skills I've Built — schlacter.me",
  description:
    "The Claude Code skills I designed and built myself — autonomous agents that maintain my sites, my whole job-search system, a writing engine that holds my voice, and personal tools for my home, wardrobe, and research.",
};

type Skill = {
  name: string;
  oneLiner: string;
  how: string;
  trigger?: string;
  tags: string[];
  link?: { label: string; href: string };
};

type Group = {
  title: string;
  blurb: string;
  skills: Skill[];
};

const GROUPS: Group[] = [
  {
    title: "Autonomous agents",
    blurb: "Skills that run on a schedule or a trigger and keep my projects healthy without me watching.",
    skills: [
      {
        name: "git-sync-fixer",
        oneLiner: "A nightly enforcer that makes sure none of my code is stranded on my laptop.",
        how: "Scans my machine for git repos with no remote and directories with unpushed commits, auto-creates private GitHub repos for anything unsynced, pushes the pending work, gitignores secrets, and emails me what it did. Runs every night at 11:15pm.",
        trigger: "sync my code",
        tags: ["Autonomous", "Scheduled"],
      },
      {
        name: "vercel-deploy-fixer",
        oneLiner: "Broken deploys fix themselves before I've read the failure email.",
        how: "Scans Gmail for Vercel deployment-failure notifications, pulls the repo, reads the build and runtime logs, diagnoses the error, patches it, and redeploys. Runs every three hours during the day.",
        trigger: "fix deploy errors",
        tags: ["Autonomous", "Scheduled"],
      },
      {
        name: "calmar-bug-fixer",
        oneLiner: "Bug reports on my live interior-design site turn into shipped fixes.",
        how: "A webhook fires the moment I submit the in-site bug form. The skill reproduces the bug, writes the patch, and deploys it — the report and the fix are the same loop.",
        trigger: "webhook on bug submit",
        tags: ["Autonomous", "Webhook"],
      },
      {
        name: "skill-auditor",
        oneLiner: "Supply-chain security for the AI skills I install.",
        how: "Vets, installs, and monitors third-party Claude skills through a five-stage pipeline — provenance manifest, hash baselines, sandbox checks, and a weekly drift scan that flags anything that changed underneath me.",
        trigger: "audit skills",
        tags: ["Autonomous", "Scheduled"],
      },
    ],
  },
  {
    title: "Career & job search",
    blurb: "The system I run my entire PM job hunt through — finding roles, reaching out, applying, and prepping.",
    skills: [
      {
        name: "product-networking",
        oneLiner: "The engine behind every professional message I send.",
        how: "Drafts cold emails, LinkedIn DMs, intro requests, and referral blurbs in my voice, and tailors my resume to a specific role — one system for networking, outreach, and applications.",
        trigger: "reach out to",
        tags: ["System"],
      },
      {
        name: "job-search",
        oneLiner: "Finds the roles and the people before they hit the job boards.",
        how: "Runs natural-language job search, Google X-Ray across Greenhouse / Lever / Ashby, scouts companies showing growth signals, and surfaces the likely hiring manager for a role.",
        trigger: "who's hiring",
        tags: ["Research"],
      },
      {
        name: "job-tracker",
        oneLiner: "My application pipeline, always current.",
        how: "Tracks every company, resume status, outreach sent, and application submitted, so I always know what's outstanding — and so parallel Claude sessions don't collide on the same data.",
        trigger: "job tracker",
        tags: ["Utility"],
      },
      {
        name: "resume",
        oneLiner: "Tailors and publishes my resume for a specific role.",
        how: "Reads the job description, rewrites bullets to match, edits the Google Doc, and publishes a per-role copy to schlacter.me — the full loop end to end.",
        trigger: "resume subskill",
        tags: [],
      },
      {
        name: "resume-learn",
        oneLiner: "Teaches the resume skill so I never give the same note twice.",
        how: "Routes feedback from a hands-on editing session back into the canonical resume files, editing them in place instead of spawning duplicate docs.",
        trigger: "resume learn",
        tags: ["Self-improving"],
      },
      {
        name: "interview",
        oneLiner: "My interview prep and mock-interview coach.",
        how: "Researches the company, maps my stories to the role, runs behavioral and product-sense mocks, and gives feedback on my answers.",
        trigger: "prep for interview",
        tags: [],
      },
      {
        name: "project",
        oneLiner: "Turns a job application into a real prototype.",
        how: "Scopes and builds a targeted, vibe-coded project that demonstrates value to a specific team — the same approach behind several case studies on this site.",
        trigger: "what should I build for",
        tags: [],
      },
    ],
  },
  {
    title: "Home & life",
    blurb: "Personal skills that hold context I'd otherwise have to re-explain every time.",
    skills: [
      {
        name: "personal-stylist",
        oneLiner: "A stylist that knows my closet and a thousand outfits.",
        how: "Searches a database of 1,000+ analyzed influencer looks from Instagram, LTK, and ShopMy, cross-referenced with my own wardrobe inventory, to answer “what do I wear with this?”",
        trigger: "how do I style",
        tags: ["Personal", "Data"],
      },
      {
        name: "interior-designer",
        oneLiner: "A design advisor that already knows my house.",
        how: "Holds the full context for our Oakland home — style, color palette, room priorities, team contacts, and specs — so I can ask a design question without re-explaining the whole project.",
        trigger: "662 Calmar",
        tags: ["Personal"],
      },
      {
        name: "calmar-sync",
        oneLiner: "Keeps the house's inspiration gallery in sync.",
        how: "An image pipeline that moves design inspiration into the right categories in my interior-design portfolio, so the gallery stays organized without manual filing.",
        trigger: "sync calmar images",
        tags: ["Utility", "Pipeline"],
      },
    ],
  },
  {
    title: "Writing & voice",
    blurb: "The layer that keeps everything I write sounding like me, not like an LLM.",
    skills: [
      {
        name: "voice",
        oneLiner: "My writing voice, encoded as a system any task can layer on.",
        how: "A five-level register model and a fourteen-point checklist that any writing task — emails, docs, applications, this page — runs through, so the output reads as mine instead of generic.",
        trigger: "match my voice",
        tags: ["Modifier"],
      },
      {
        name: "aislop",
        oneLiner: "An AI-slop detector that catches the tells before I ship them.",
        how: "Scans a draft against a twelve-category checklist for generic, jargon-heavy, hedge-everything AI writing, then rewrites the flagged lines in my voice. A required step before anything goes out.",
        trigger: "check for AI slop",
        tags: ["Modifier"],
      },
      {
        name: "brainstorming",
        oneLiner: "A thinking partner that pushes back.",
        how: "A DM-style sparring partner — short bursts, strong opinions with tradeoffs, one question per turn, no premature conclusions. For thinking out loud on anything before I converge.",
        trigger: "brainstorm",
        tags: ["Modifier"],
      },
    ],
  },
  {
    title: "Code & craft",
    blurb: "Tools that raise the quality of what I build and how I show it.",
    skills: [
      {
        name: "code-builder",
        oneLiner: "Raises the floor on code quality by never trusting a single first draft.",
        how: "Generates five parallel implementations of the same task, self-scores each against a measurable rubric, and merges the winner. Exercises judgment on when a task actually warrants the full five-draft pass.",
        tags: ["Open source"],
        link: { label: "github.com/hbschlac/code-builder", href: "https://github.com/hbschlac/code-builder" },
      },
      {
        name: "mcp-contributor",
        oneLiner: "Contributing back to the protocol the rest of these skills run on.",
        how: "Guides upstream contributions to the Model Context Protocol governance org — the spec, the official SDKs, and the docs — including the full SEP proposal lifecycle from triage to sponsor review.",
        tags: ["Open source"],
        link: { label: "github.com/hbschlac/mcp-contributor", href: "https://github.com/hbschlac/mcp-contributor" },
      },
      {
        name: "screen-capture",
        oneLiner: "Turns a working prototype into case-study assets with zero manual steps.",
        how: "Drives macOS screencapture, ffmpeg, and headless Chrome to produce clean stills, screen recordings, and GIFs — the same pipeline that captured the demos across this site.",
        trigger: "record my screen",
        tags: ["Utility"],
      },
      {
        name: "schlacter-me",
        oneLiner: "The skill that maintains this site.",
        how: "Knows the structure, design tokens, and deploy flow of schlacter.me, so adding a project or shipping a change is one instruction instead of a hunt through the codebase. This page was built with it.",
        trigger: "add a project to my site",
        tags: [],
      },
    ],
  },
  {
    title: "Research & data utilities",
    blurb: "The tools I built to pull the raw material my research and dashboards run on.",
    skills: [
      {
        name: "reddit",
        oneLiner: "Reddit search and research, on tap.",
        how: "Searches posts and subreddits and pulls full discussions — the data layer behind the product-research dashboards on this site.",
        trigger: "search Reddit",
        tags: ["Research"],
      },
      {
        name: "youtube",
        oneLiner: "Reads a YouTube video so I don't have to.",
        how: "Pulls metadata and the full transcript from any video through a credential-free pipeline, so I can summarize it or take structured notes.",
        trigger: "summarize this video",
        tags: ["Utility"],
      },
      {
        name: "google-docs",
        oneLiner: "Direct control of my Google Docs.",
        how: "A skill I built over the Google Docs API to read, create, edit, search, and format docs — including the careful find-and-replace flow my resume workflow depends on.",
        trigger: "open my Google Doc",
        tags: ["Utility"],
      },
      {
        name: "google-drive",
        oneLiner: "Fast, reliable Google Drive from a prompt.",
        how: "Searches with Drive query language, reads and downloads files, and uploads new ones — mapped around the API's quirks so it just works.",
        trigger: "search my drive",
        tags: ["Utility"],
      },
      {
        name: "claude-code-insights",
        oneLiner: "My own usage data, aggregated and made public.",
        how: "Parses my local Claude Code transcripts into a live stats page — hours, sessions, commits, top projects — that updates weekly. A PM claim about myself, with the number on the page.",
        tags: ["Open source"],
        link: { label: "schlacter.me/claude-code", href: "/claude-code" },
      },
    ],
  },
  {
    title: "Reflection & workflow",
    blurb: "Skills pointed back at my own work — learning from it and carrying it between sessions.",
    skills: [
      {
        name: "vibe-coach",
        oneLiner: "A weekly self-review loop that rewrites its own rulebook.",
        how: "Reads my session transcripts, writes per-session post-mortems, extracts the habits that keep recurring, and edits my global instructions so future sessions correct for them automatically.",
        trigger: "Saturday reflection",
        tags: ["Scheduled", "Self-improving"],
      },
      {
        name: "summary",
        oneLiner: "Clean handoffs between sessions.",
        how: "Stops work and writes a complete session summary so I can close a session and a fresh Claude picks up exactly where I left off — the reason my long projects survive context limits.",
        trigger: "summary",
        tags: ["Workflow"],
      },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.skills);
const TOTAL = ALL.length;
const AUTONOMOUS = ALL.filter((s) => s.tags.includes("Autonomous")).length;
const OPEN_SOURCE = ALL.filter((s) => s.tags.includes("Open source")).length;

export default function SkillsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8F6F2", color: "#1A1A1A" }}>
      <main className="max-w-3xl mx-auto w-full px-6 pt-16 pb-16">
        <Link
          href="/projects"
          className="text-xs transition-opacity hover:opacity-50"
          style={{ color: "#8A8A8A" }}
        >
          ← projects
        </Link>

        <p className="text-xs tracking-widest uppercase mt-10" style={{ color: "#1A1A1A" }}>
          Claude Skills
        </p>
        <h1 className="text-2xl mt-2" style={{ color: "#1A1A1A" }}>
          Skills I&apos;ve built for Claude
        </h1>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: "#8A8A8A" }}>
          A Claude Code &quot;skill&quot; is a reusable instruction set that teaches Claude to do a
          specific job my way. I&apos;ve written {TOTAL} of my own. Instead of doing the same work
          twice, I turn it into software that runs itself — agents that maintain my sites, the
          system I run my whole job search through, a writing engine that holds my voice, and
          personal tools for my home, my wardrobe, and my research. Here&apos;s the full set.
        </p>

        <div
          className="grid grid-cols-3 gap-4 mt-10 pt-8"
          style={{ borderTop: "1px solid #E5E1D8" }}
        >
          <Kpi label="skills built" value={String(TOTAL)} />
          <Kpi label="run unattended" value={String(AUTONOMOUS)} />
          <Kpi label="open-source" value={String(OPEN_SOURCE)} href="https://github.com/hbschlac" />
        </div>

        {GROUPS.map((group) => (
          <section key={group.title} className="mt-14">
            <p className="text-xs tracking-widest uppercase mb-1.5" style={{ color: "#8A8A8A" }}>
              {group.title}
            </p>
            <p className="text-sm mb-5" style={{ color: "#8A8A8A" }}>
              {group.blurb}
            </p>
            <div className="flex flex-col gap-3">
              {group.skills.map((skill) => (
                <SkillCard key={skill.name} skill={skill} />
              ))}
            </div>
          </section>
        ))}

        <section
          className="mt-14 pt-8 text-xs leading-relaxed"
          style={{ borderTop: "1px solid #E5E1D8", color: "#8A8A8A" }}
        >
          <p>
            Most of these skills are personal infrastructure and live in a private config repo;
            the open-source ones are linked above. Built and maintained with Claude Code.
          </p>
        </section>
      </main>

      <footer
        className="max-w-3xl mx-auto w-full px-6 py-8"
        style={{ borderTop: "1px solid #E5E1D8" }}
      >
        <p className="text-xs" style={{ color: "#8A8A8A" }}>
          vibed with love | oakland, ca
        </p>
      </footer>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "#FFF", border: "1px solid #E5E1D8" }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-medium" style={{ color: "#1A1A1A", fontFamily: "monospace" }}>
          {skill.name}
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#F5E0E6", color: "rgba(26,26,26,0.7)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm mt-2" style={{ color: "#1A1A1A" }}>
        {skill.oneLiner}
      </p>
      <p className="text-sm mt-2 leading-relaxed" style={{ color: "#8A8A8A" }}>
        {skill.how}
      </p>
      <div className="flex items-center gap-3 flex-wrap mt-3">
        {skill.trigger && (
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ background: "#F8F6F2", border: "1px solid #E5E1D8", color: "#8A8A8A", fontFamily: "monospace" }}
          >
            {skill.trigger}
          </span>
        )}
        {skill.link && (
          <a
            href={skill.link.href}
            target={skill.link.href.startsWith("http") ? "_blank" : undefined}
            rel={skill.link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-xs underline hover:opacity-70"
            style={{ color: "#1A1A1A" }}
          >
            {skill.link.label} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <>
      <p className="text-2xl tabular-nums" style={{ color: "#1A1A1A" }}>
        {value}
      </p>
      <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "#8A8A8A" }}>
        {label}
        {href && <span aria-hidden="true"> →</span>}
      </p>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-50">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}
