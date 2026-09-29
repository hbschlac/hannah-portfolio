"use client";

import { useState } from "react";

type ConnectorId = "github" | "drive" | "gmail" | "composio" | "linkedin";

type Connector = {
  id: ConnectorId;
  name: string;
  label: string; // plain words, not jargon
  locked?: string; // why it can't be unticked
  what: string;
  where: string;
};

// Mirrors README → "Connect your tools" in github.com/hbschlac/career-kit.
const CONNECTORS: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    label: "Needed",
    locked: "Needed for everything",
    what: "Where your private copy of the kit lives. Claude opens it at the start of every session.",
    where: "You connect it the first time you open claude.ai/code (step 5).",
  },
  {
    id: "drive",
    name: "Google Drive + Docs",
    label: "Recommended",
    what: "Claude reads every resume you've saved, from any year, plus your work samples and projects, for facts and numbers. Then it edits a copy of your resume right in Google Docs and saves the PDF.",
    where: "Connect on claude.ai's connectors page (step 3).",
  },
  {
    id: "gmail",
    name: "Gmail",
    label: "Recommended",
    what: "Claude learns how you write from emails you've sent, reads the earlier thread before a follow-up, and spots interview invites and rejections. Read-only: it never sends, deletes or labels anything.",
    where: "Same page (step 3).",
  },
  {
    id: "composio",
    name: "Composio",
    label: "Optional · free",
    what: "A free add-on service that lets Claude keep your job tracker in a Google Sheet, check your resume still fits one page without sharing it, and save a PDF to your Drive when you're on your phone. It also gives Claude a second way into your Docs.",
    where: "One link, added on the same connectors page (step 4).",
  },
  {
    id: "linkedin",
    name: "LinkedIn jobs",
    label: "Already included",
    locked: "Comes with the kit",
    what: "Claude searches LinkedIn job posts, filters them by your years of experience, industry, pay and remote, and reads full job descriptions, using LinkedIn's public job pages. No LinkedIn login.",
    where: "Nothing to connect.",
  },
];

type Ability = {
  text: string;
  // Met when every connection in any one of these groups is ticked.
  requires: ConnectorId[][];
  needs?: string;
  without?: string;
};

const ABILITIES: Ability[] = [
  { text: "Write resume changes, cover letters and messages in your voice, right in the chat", requires: [[]] },
  { text: "Score your resume against any job and rank the fixes", requires: [[]] },
  { text: "Search LinkedIn jobs by your years of experience, industry, pay and remote, and read full job posts", requires: [[]] },
  { text: "Prep you for interviews: a company brief, your best stories for each question, mock rounds", requires: [[]] },
  {
    text: "Read every resume you've saved in Google Drive, from any year, plus your work samples, for facts and numbers",
    requires: [["drive"], ["composio"]],
    needs: "Google Drive",
    without: "Without it, you paste in your resume and anything else you want it to use.",
  },
  {
    text: "Edit a copy of your resume in Google Docs, formatting intact, and save the PDF",
    requires: [["drive"], ["composio"]],
    needs: "Google Drive",
    without: "Without it, you get the changes in the chat and paste them into your doc.",
  },
  {
    text: "On your phone, turn a job link into a tailored resume PDF saved in your Google Drive",
    requires: [["composio"]],
    needs: "Composio",
    without: "Without it, you get the tailored doc and save the PDF from the Google Docs app.",
  },
  {
    text: "Read the comments people left on your resume doc and apply them",
    requires: [["composio"]],
    needs: "Composio",
    without: "Without it, you paste the feedback into the chat.",
  },
  {
    text: "Learn your voice from emails you've sent, and read the earlier thread before a follow-up",
    requires: [["gmail"]],
    needs: "Gmail",
  },
  {
    text: "Find out what happened to your applications: interviews, rejections, silence",
    requires: [["gmail"]],
    needs: "Gmail",
  },
  {
    text: "Keep your job tracker in a Google Sheet",
    requires: [["composio"]],
    needs: "Composio",
    without: "Without it, your tracker is a simple table inside your copy of the kit.",
  },
  {
    text: "Weekly review: log new replies in your tracker for you",
    requires: [["gmail", "composio"]],
    needs: "Gmail and Composio",
  },
];

export function Connectors() {
  const [on, setOn] = useState<Set<ConnectorId>>(
    () => new Set<ConnectorId>(["github", "linkedin", "drive", "gmail"])
  );

  const toggle = (id: ConnectorId) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const met = (a: Ability) => a.requires.some((group) => group.every((id) => on.has(id)));
  const count = ABILITIES.filter(met).length;

  return (
    <div>
      <p className="text-sm leading-relaxed text-foreground mb-4">
        Tick the ones you plan to connect to see what Claude can do for you.{" "}
        <span className="text-muted">
          Ticking a box here doesn&apos;t connect anything. You&apos;ll do that in the setup steps
          below.
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONNECTORS.map((c) => {
          const checked = on.has(c.id);
          return (
            <div
              key={c.id}
              className="rounded-xl border bg-white p-4 flex flex-col transition-colors"
              style={{ borderColor: checked ? "#1A1A1A" : "#E5E1D8" }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-medium text-foreground">{c.name}</h3>
                <span className="text-xs text-muted whitespace-nowrap">{c.label}</span>
              </div>
              <p className="text-sm mt-2 leading-relaxed text-foreground">{c.what}</p>
              <p className="text-xs mt-2 leading-relaxed text-muted">{c.where}</p>
              <div className="mt-auto pt-3">
                {c.locked ? (
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center text-[10px]"
                      style={{ background: "#1A1A1A", color: "#FFF" }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {c.locked}
                  </p>
                ) : (
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(c.id)}
                      className="w-4 h-4 accent-[#1A1A1A]"
                    />
                    I&apos;ll connect this
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-5">
        <p className="text-sm font-medium text-foreground">In a Claude session, Claude can:</p>
        <p className="text-xs text-muted mt-0.5" aria-live="polite">
          {count} of {ABILITIES.length} things, with what you ticked
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {ABILITIES.map((a) => {
            const ok = met(a);
            return (
              <li key={a.text} className="flex gap-3 text-sm leading-relaxed">
                <span
                  className="shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-[11px]"
                  style={
                    ok
                      ? { background: "#1A1A1A", color: "#FFF" }
                      : { border: "1px dashed #8A8A8A", color: "#8A8A8A" }
                  }
                  aria-hidden="true"
                >
                  {ok ? "✓" : ""}
                </span>
                <span style={{ color: ok ? "#1A1A1A" : "#8A8A8A" }}>
                  <span className="sr-only">{ok ? "Yes: " : "Not yet: "}</span>
                  {a.text}
                  {!ok && a.needs && <span className="block text-xs mt-0.5">Needs {a.needs}.</span>}
                  {!ok && a.without && <span className="block text-xs mt-0.5">{a.without}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
