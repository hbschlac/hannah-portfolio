"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { CopyText } from "./CopyText";

type UseCase = {
  id: string;
  tab: string;
  when: string;
  say: { text: string; hint?: string };
  steps: string[];
  get: string;
  needs: string;
};

// Every step below is what the kit's skill files actually do (career-kit/skills/*).
const CASES: UseCase[] = [
  {
    id: "tailor",
    tab: "Tailor my resume",
    when: "You found a job you want.",
    say: { text: "Tailor my resume for this job:", hint: "paste the job link" },
    steps: [
      "Reads the job post and lists what it asks for.",
      "Checks your facts file for each one. Anything missing comes back as one short list of questions.",
      "Writes every change as a before → after list in your voice, so you see it all before anything is edited.",
      "Scores your resume before and after, the way a screening tool would.",
      "Edits a copy of your Google Doc. Your original stays untouched, and the copy keeps your formatting and stays one page.",
    ],
    get: "A tailored copy of your resume, plus a PDF when you ask for one.",
    needs: "Google Drive (or Composio). Without it, you get the changes in the chat and paste them in yourself.",
  },
  {
    id: "score",
    tab: "Score before I apply",
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
    id: "outreach",
    tab: "Write a note",
    when: "You want a referral, an intro, or a reply from a hiring manager.",
    say: { text: "Write a LinkedIn note to", hint: "their name, role and company, and what you want" },
    steps: [
      "Asks who they are and what you want, if you didn't say.",
      "Picks the format: a LinkedIn DM, cold email, intro request, referral blurb or cover letter.",
      "Writes it in your voice. Emails and DMs lead with the ask and stay short enough to read on a phone.",
      "Checks anything longer than a DM for lines that sound like AI wrote them.",
    ],
    get: "A message ready to send.",
    needs: "Nothing extra.",
  },
  {
    id: "find",
    tab: "Find roles",
    when: "You don't know where to look next.",
    say: { text: "Find me roles like", hint: "the job you want, where, and at what kind of company" },
    steps: [
      "Reads your targets: roles, locations, years of experience and dealbreakers.",
      "Searches LinkedIn job posts and writes searches that find roles on company career pages.",
      "Spots companies that are about to hire, like ones that just raised money.",
      "Pulls the full job description for the ones you like and adds them to your tracker.",
    ],
    get: "A short list of real, open roles that fit, already in your tracker.",
    needs: "Nothing extra. Composio puts the tracker in a Google Sheet.",
  },
  {
    id: "project",
    tab: "Stand out",
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
  {
    id: "review",
    tab: "Weekly review",
    when: "It's Sunday and you've lost track of who wrote back.",
    say: { text: "Weekly review" },
    steps: [
      "Checks your Gmail for replies to each application in your tracker. Read-only: it never sends, labels or deletes.",
      "Marks each one: interview, rejection, or no reply after 30 days.",
      "Suggests up to 3 rule changes based on what's working. Nothing changes until you say yes.",
    ],
    get: "An up-to-date tracker, without digging through your inbox.",
    needs: "Gmail + Composio.",
  },
];

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
      <div role="tablist" aria-label="Use cases" className="flex flex-wrap gap-2">
        {CASES.map((c, i) => {
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

      <div
        role="tabpanel"
        id={`uc-panel-${current.id}`}
        aria-labelledby={`uc-tab-${current.id}`}
        className="mt-4 rounded-xl border border-border bg-white p-5"
      >
        <p className="text-xs tracking-widest uppercase text-muted">When</p>
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
