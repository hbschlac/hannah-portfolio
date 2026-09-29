"use client";

import { useState } from "react";

type ConnectorId = "github" | "drive" | "gmail" | "composio" | "linkedin";

type Connector = {
  id: ConnectorId;
  name: string;
  status: string;
  locked?: boolean;
  what: string;
  where: string;
};

// Mirrors the "Connect your tools" table in the kit's README.
const CONNECTORS: Connector[] = [
  {
    id: "github",
    name: "GitHub",
    status: "Required",
    locked: true,
    what: "Lets Claude open your private copy of the kit.",
    where: "You connect it the first time you open claude.ai/code (step 5).",
  },
  {
    id: "drive",
    name: "Google Drive + Docs",
    status: "Recommended",
    what: "Claude edits a copy of your resume right in Google Docs, then saves the PDF.",
    where: "claude.ai/customize/connectors → Google Drive, plus Google Docs if it's listed (step 3).",
  },
  {
    id: "gmail",
    name: "Gmail",
    status: "Recommended",
    what: "Spots interview invites and rejections for the jobs you applied to. Read-only.",
    where: "Same page → Gmail (step 3).",
  },
  {
    id: "composio",
    name: "Composio",
    status: "Optional · free tier",
    what: "Keeps your job tracker in a Google Sheet, and gives Claude a second way to edit your Docs.",
    where: "One link, added on the same connectors page. It makes your free account (step 4).",
  },
  {
    id: "linkedin",
    name: "LinkedIn jobs",
    status: "Built in",
    locked: true,
    what: "Searches LinkedIn job posts and pulls full job descriptions. No login.",
    where: "Nothing to do. It comes with the kit.",
  },
];

type Ability = {
  text: string;
  // Met when every connector in any one of these groups is on.
  requires: ConnectorId[][];
  needs?: string;
  without?: string;
};

const ABILITIES: Ability[] = [
  { text: "Draft resume changes, cover letters and outreach in your voice", requires: [[]] },
  { text: "Score your resume against any job, with fixes ranked", requires: [[]] },
  { text: "Search LinkedIn jobs and pull full job descriptions", requires: [[]] },
  {
    text: "Edit a copy of your resume right in Google Docs, formatting intact",
    requires: [["drive"], ["composio"]],
    needs: "Google Drive or Composio",
    without: "For now, Claude writes the changes in the chat and you paste them in.",
  },
  {
    text: "Find out what happened to your applications: invites, rejections, silence",
    requires: [["gmail"]],
    needs: "Gmail",
  },
  {
    text: "Keep your job tracker in a Google Sheet",
    requires: [["composio"]],
    needs: "Composio",
    without: "For now, your tracker is a simple table inside your copy of the kit.",
  },
  {
    text: "Weekly review: new replies logged to your tracker for you",
    requires: [["gmail", "composio"]],
    needs: "Gmail + Composio",
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONNECTORS.map((c) => {
          const checked = on.has(c.id);
          return (
            <div
              key={c.id}
              className="rounded-xl border bg-white p-4 flex flex-col transition-colors"
              style={{ borderColor: checked ? "#1A1A1A" : "#E5E1D8" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">{c.name}</h3>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                    style={{ background: "#F5E0E6", color: "rgba(26,26,26,0.7)" }}
                  >
                    {c.status}
                  </span>
                </div>
                {c.locked ? (
                  <span className="text-xs text-muted whitespace-nowrap pt-0.5">Always on</span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={`I'll connect ${c.name}`}
                    onClick={() => toggle(c.id)}
                    className="relative shrink-0 w-10 h-6 rounded-full transition-colors"
                    style={{ background: checked ? "#1A1A1A" : "#E5E1D8" }}
                  >
                    <span
                      className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
                    />
                  </button>
                )}
              </div>
              <p className="text-sm mt-3 leading-relaxed text-foreground">{c.what}</p>
              <p className="text-xs mt-2 leading-relaxed text-muted">{c.where}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white p-5">
        <p className="text-xs tracking-widest uppercase text-muted" aria-live="polite">
          With these connected, you can do {count} of {ABILITIES.length} things
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
                  {!ok && a.needs && (
                    <span className="text-xs ml-1.5 whitespace-nowrap">(needs {a.needs})</span>
                  )}
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
