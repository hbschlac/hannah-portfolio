"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { CopyText } from "./CopyText";

type UseCase = {
  id: string;
  tab: string;
  skill: string;
  when: string;
  say: { text: string; hint?: string };
  steps: string[];
  get: string;
  needs: string;
};

type Stage = { stage: string; cases: UseCase[] };

// Every step below is what the kit's skill files do (github.com/hbschlac/career-kit, skills/*).
const STAGES: Stage[] = [
  {
    stage: "Find a job",
    cases: [
      {
        id: "find",
        tab: "Find roles",
        skill: "job-search",
        when: "You don't know where to look next.",
        say: { text: "Find me roles like", hint: "the job you want, where, and what kind of company" },
        steps: [
          "Reads your targets: roles, locations, years of experience and dealbreakers.",
          "Searches LinkedIn job posts and writes searches that find roles on company career pages.",
          "Spots companies that are about to hire, like ones that just raised money.",
          "Adds the ones you like to your tracker.",
        ],
        get: "A short list of real, open roles that fit.",
        needs: "Nothing extra. Composio puts the tracker in a Google Sheet.",
      },
      {
        id: "linkedin",
        tab: "Search LinkedIn",
        skill: "linkedin-jobs",
        when: "You want to see what's posted on LinkedIn right now.",
        say: { text: "Search LinkedIn jobs for", hint: "role, city or remote" },
        steps: [
          "Searches LinkedIn's public job listings. No LinkedIn login needed.",
          "Pulls the full description for any job you pick.",
          "Adds it to your tracker, then scores it or tailors your resume when you ask.",
        ],
        get: "Current LinkedIn postings, filtered to what you want.",
        needs: "Nothing extra. It comes with the kit.",
      },
      {
        id: "read",
        tab: "Read a job post",
        skill: "job-fetch",
        when: "You found a posting on a company site, Greenhouse, Lever, Ashby or Workday.",
        say: { text: "Read this job:", hint: "paste the link" },
        steps: [
          "Pulls the full text of the posting, even from job sites that block Claude's own browser.",
          "Turns it into a list of what the job asks for.",
          "Hands it to your next ask: a score, a tailored resume, a note to the team.",
        ],
        get: "The job, read and summarized, ready for the next step.",
        needs: "On claude.ai/code, most job sites need Composio. On a computer, nothing extra.",
      },
    ],
  },
  {
    stage: "Apply",
    cases: [
      {
        id: "tailor",
        tab: "Tailor my resume",
        skill: "resume",
        when: "You found a job you want.",
        say: { text: "Tailor my resume for this job:", hint: "paste the job link" },
        steps: [
          "Reads the job post and lists what it asks for.",
          "Checks your past tailored resumes. If you made one for a similar job, it offers to start there.",
          "Checks your facts file for each ask. Anything missing comes back as one short list of questions.",
          "Writes every change as a before → after list in your voice, so you see it all before anything is edited.",
          "Scores your resume before and after, the way a screening tool would.",
          "Edits a copy of your Google Doc. Your original stays untouched, and the copy keeps your formatting and stays one page.",
        ],
        get: "A tailored copy of your resume, plus a PDF when you ask for one.",
        needs: "Google Drive (or Composio). Without it, you get the changes in the chat and paste them in yourself.",
      },
      {
        id: "reuse",
        tab: "Reuse a tailored resume",
        skill: "resume",
        when: "You tailored a resume for one job, and a similar one comes up weeks later.",
        say: { text: "Use the resume I made for", hint: "company name" },
        steps: [
          "Every resume it tailors gets logged: company, role, the job's top themes, and the doc.",
          "A new job is matched against that list. The same job reposted? It reuses that version. A similar one? It starts from the closest.",
          "Only what's different for the new job gets changed, on a fresh copy. The old version stays as it was.",
        ],
        get: "A new version without redoing the parts that already fit.",
        needs: "Google Drive (or Composio).",
      },
      {
        id: "score",
        tab: "Score before I apply",
        skill: "recruiter-filter",
        when: "You're about to hit Apply.",
        say: { text: "Score my resume against this job:", hint: "paste the job link" },
        steps: [
          "Checks the knockouts first: years, location, work authorization, required credentials. These drop an application before anyone reads it.",
          "Scores your resume from 0 to 100, the way an applicant-tracking system screens it.",
          "Shows what a recruiter takes in from a six-second skim of the top of your resume.",
          "Ranks the fixes by how many points each one wins back.",
        ],
        get: "A fit score and a short list of fixes, biggest win first.",
        needs: "Nothing extra.",
      },
      {
        id: "cover",
        tab: "Write a cover letter",
        skill: "resume",
        when: "The application asks for a cover letter.",
        say: { text: "Write a cover letter for this job:", hint: "paste the job link" },
        steps: [
          "Opens with something true about their world, then puts you in it.",
          "Uses only facts from your facts file, and names real parts of their product.",
          "Keeps it to half or three-quarters of a page, in your voice.",
          "Runs the AI-sounding-lines check before you see it.",
        ],
        get: "A cover letter you'd actually send.",
        needs: "Nothing extra.",
      },
      {
        id: "project",
        tab: "Stand out",
        skill: "project",
        when: "It's a job you really want.",
        say: { text: "What should I build for this application?", hint: "paste the job link" },
        steps: [
          "Works out the problem this team cares about most.",
          "Picks an angle: research on their users, a prototype, a teardown or plan, or a sample in their format.",
          "Scopes something small you can finish and send to the hiring team.",
        ],
        get: "A work sample that shows the team you already understand their world.",
        needs: "Nothing extra.",
      },
    ],
  },
  {
    stage: "Reach out",
    cases: [
      {
        id: "outreach",
        tab: "Write a note",
        skill: "networking",
        when: "You want a referral, an intro, or a reply from a hiring manager.",
        say: { text: "Write a LinkedIn note to", hint: "their name, role and company, and what you want" },
        steps: [
          "Asks who they are and what you want, if you didn't say.",
          "Picks the format: a LinkedIn DM, cold email, intro request or referral blurb.",
          "Writes it in your voice. Emails and DMs lead with the ask and stay short enough to read on a phone.",
          "Checks anything longer than a DM for lines that sound like AI wrote them.",
        ],
        get: "A message ready to send.",
        needs: "Nothing extra.",
      },
      {
        id: "followup",
        tab: "Follow up",
        skill: "networking",
        when: "Someone replied, or went quiet, and you need the next message.",
        say: { text: "Follow up with", hint: "their name" },
        steps: [
          "Reads your earlier emails with them in Gmail. Read-only.",
          "Answers what they asked and picks up what they said, without repeating your intro.",
          "Keeps the tone you already used with them.",
          "Never sends anything. You copy it and send it yourself.",
        ],
        get: "A follow-up that fits the conversation.",
        needs: "Gmail. Without it, paste their last message.",
      },
      {
        id: "voice",
        tab: "Does this sound like me?",
        skill: "voice",
        when: "A draft sounds stiff, or not like you.",
        say: { text: "Does this sound like me?", hint: "paste the draft" },
        steps: [
          "Checks the draft against your voice rules, built from things you wrote yourself.",
          "Matches the setting: a cover letter, a cold email and a Slack message each sound different.",
          "Rewrites what's off, line by line.",
        ],
        get: "The same message, in your voice.",
        needs: "Nothing extra.",
      },
      {
        id: "aislop",
        tab: "Sounds like AI?",
        skill: "aislop",
        when: "Before anything goes out.",
        say: { text: "Slop check:", hint: "paste the draft" },
        steps: [
          "Flags generic, jargon-heavy and inflated lines.",
          "Says what's wrong with each one.",
          "Rewrites the flagged lines in your voice.",
        ],
        get: "A draft that doesn't read like AI wrote it.",
        needs: "Nothing extra.",
      },
    ],
  },
  {
    stage: "Keep track",
    cases: [
      {
        id: "tracker",
        tab: "Track applications",
        skill: "networking",
        when: "You applied, heard back, or want to see where things stand.",
        say: { text: "Log that I applied to", hint: "company" },
        steps: [
          "Finds the row for that job.",
          "Updates the status and adds a dated note.",
          "Answers “what's in my pipeline?” in a few lines.",
        ],
        get: "A tracker that stays current without you editing it.",
        needs: "Composio for a Google Sheet. Without it, a simple table in your copy of the kit.",
      },
      {
        id: "review",
        tab: "Weekly review",
        skill: "career-review",
        when: "It's Sunday and you've lost track of who wrote back.",
        say: { text: "Weekly review" },
        steps: [
          "Checks your Gmail for replies to each application in your tracker. Read-only: it never sends, labels or deletes.",
          "Marks each one: interview, rejection, or no reply after 30 days.",
          "Suggests up to 3 fixes to the kit based on what's working. Nothing changes until you say yes.",
        ],
        get: "An up-to-date tracker, without digging through your inbox.",
        needs: "Gmail + Composio.",
      },
    ],
  },
  {
    stage: "Gets better over time",
    cases: [
      {
        id: "learn",
        tab: "Learn from this",
        skill: "resume-learn",
        when: "You corrected Claude and never want to again.",
        say: { text: "Learn from this" },
        steps: [
          "Collects your corrections from the session: words, facts, formatting.",
          "Saves each one to your rules, voice or facts file, in your private copy.",
          "Every future draft follows them.",
        ],
        get: "No note given twice.",
        needs: "Nothing extra.",
      },
      {
        id: "tune",
        tab: "Tunes itself",
        skill: "career-review",
        when: "Automatically, every session.",
        say: { text: "How are my skills doing?" },
        steps: [
          "Each session records how much it used (tokens, the unit Claude's work is measured in) and which skills ran.",
          "The weekly review finds the skill that costs the most, or that got more expensive.",
          "It proposes a fix you approve, then checks the next week that the cost came down.",
        ],
        get: "A kit that gets tuned to how you use it.",
        needs: "Nothing extra. Composio keeps the history in a sheet; without it, a file in your copy.",
      },
      {
        id: "profile",
        tab: "Update my profile",
        skill: "setup",
        when: "New job, new resume, or you want something different.",
        say: { text: "Update my profile" },
        steps: [
          "Reads your latest resume, and older ones in Google Drive if you want.",
          "Asks what changed about what you're looking for.",
          "Updates your facts, targets and rules so every skill works from your current story.",
        ],
        get: "Every skill working from the latest you.",
        needs: "Nothing extra. Google Drive lets it read your resumes directly.",
      },
    ],
  },
];

const CASES = STAGES.flatMap((s) => s.cases);
const INDEX = new Map(CASES.map((c, i) => [c.id, i]));

export function UseCases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = CASES[active];

  // Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = CASES.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {STAGES.map((s) => (
          <div key={s.stage}>
            <p className="text-xs text-muted mb-2" aria-hidden="true">
              {s.stage}
            </p>
            <div role="tablist" aria-label={s.stage} className="flex flex-wrap gap-2">
              {s.cases.map((c) => {
                const i = INDEX.get(c.id) ?? 0;
                const selected = i === active;
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`uc-tab-${c.id}`}
                    aria-selected={selected}
                    aria-controls={selected ? `uc-panel-${c.id}` : undefined}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={onKeyDown}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      background: selected ? "#1A1A1A" : "#FFF",
                      color: selected ? "#FFF" : "#1A1A1A",
                      borderColor: selected ? "#1A1A1A" : "#E5E1D8",
                    }}
                  >
                    {c.tab}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`uc-panel-${current.id}`}
        aria-labelledby={`uc-tab-${current.id}`}
        className="mt-5 rounded-xl border border-border bg-white p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{current.tab}</p>
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "#F8F6F2", border: "1px solid #E5E1D8", color: "#8A8A8A", fontFamily: "monospace" }}
            title="The skill in the kit that does this"
          >
            skill: {current.skill}
          </span>
        </div>

        <p className="text-xs tracking-widest uppercase text-muted mt-4">When</p>
        <p className="text-sm mt-1 text-foreground">{current.when}</p>

        <p className="text-xs tracking-widest uppercase text-muted mt-5 mb-2">You type</p>
        <CopyText text={current.say.text} hint={current.say.hint} />

        <p className="text-xs tracking-widest uppercase text-muted mt-5 mb-2">What Claude does</p>
        <ol className="flex flex-col gap-2">
          {current.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span
                className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-accent-light text-[11px] flex items-center justify-center tabular-nums"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-lg bg-accent-light px-4 py-3">
          <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(26,26,26,0.6)" }}>
            You get
          </p>
          <p className="text-sm mt-1 text-foreground">{current.get}</p>
        </div>

        <p className="text-xs mt-4 text-muted">
          <span className="text-foreground">Needs:</span> {current.needs}
        </p>
      </div>
    </div>
  );
}
