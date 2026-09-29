"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CopyText } from "./CopyText";
import { KitLink } from "./KitLink";
import { track } from "./visitor";

type Status = "todo" | "done" | "skipped";

type Step = {
  title: string;
  sub: string;
  optional?: boolean;
  doneLabel: string;
  body: ReactNode;
};

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:opacity-70 break-words"
    >
      {children} ↗
    </a>
  );
}

// A button or field name exactly as it appears on screen, so it's easy to spot.
function UI({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md border border-border bg-background px-1.5 py-px text-[13px] font-medium leading-snug">
      {children}
    </span>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-4 rounded-lg bg-background px-4 py-3 text-xs leading-relaxed text-muted">{children}</p>;
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal pl-5 flex flex-col gap-2.5 marker:text-muted">{children}</ol>;
}

const STEPS: Step[] = [
  {
    title: "Make a free GitHub account",
    sub: "Skip this if you already have one.",
    doneLabel: "Done, I have an account",
    body: (
      <>
        <p className="mb-3">
          GitHub is a website that stores folders of files. Think: Google Drive for projects like
          this one. You won&apos;t write any code.
        </p>
        <Steps>
          <li>
            Go to <Ext href="https://github.com/signup">github.com/signup</Ext>
          </li>
          <li>Enter your email, make a password, and pick a username. Follow the prompts.</li>
          <li>GitHub emails you a code. Type it in, and you&apos;re in.</li>
        </Steps>
      </>
    ),
  },
  {
    title: "Make your own private copy of the kit",
    sub: "One copy, in your account, that only you can see.",
    doneLabel: "Done, I made my private copy",
    body: (
      <>
        <Steps>
          <li>
            Open the kit on GitHub:{" "}
            <KitLink className="underline underline-offset-2 hover:opacity-70 break-words">
              github.com/hbschlac/career-kit ↗
            </KitLink>
          </li>
          <li>
            Above the list of files, click <UI>Use this template</UI>, then{" "}
            <UI>Create a new repository</UI>. (&ldquo;Repository&rdquo; is GitHub&apos;s word for a
            project folder.)
          </li>
          <li>
            In the <UI>Repository name</UI> box, type <strong>career-kit</strong>
          </li>
          <li>
            Choose <UI>Private</UI>. This one matters: your copy will hold your resume and phone
            number, and Private means only you can see it.
          </li>
          <li>
            Click <UI>Create repository</UI> at the bottom.
          </li>
        </Steps>
        <Note>
          That&apos;s your copy. Nobody else can see it (me included), and nothing you add to it
          comes back to mine.
        </Note>
      </>
    ),
  },
  {
    title: "Connect Google Drive and Gmail",
    sub: "So Claude can read your resumes, edit a copy, and learn how you write.",
    doneLabel: "Done, they're connected",
    body: (
      <>
        <Steps>
          <li>
            Go to{" "}
            <Ext href="https://claude.ai/customize/connectors">claude.ai/customize/connectors</Ext>{" "}
            and sign in to Claude.
          </li>
          <li>
            Find <UI>Google Drive</UI> and click <UI>Connect</UI>. Sign in with the Google account
            that has your resumes, and allow access.
          </li>
          <li>
            If you see <UI>Google Docs</UI> in the list too, connect it the same way.
          </li>
          <li>
            Connect <UI>Gmail</UI> the same way. The kit only reads it: to learn how you write from
            emails you sent, to catch up on a thread before a follow-up, and to spot replies about
            your applications. It never sends, labels or deletes anything.
          </li>
        </Steps>
        <Note>On a work plan (Team or Enterprise)? An admin may need to turn these on for you first.</Note>
      </>
    ),
  },
  {
    title: "Add Composio for your job tracker",
    sub: "Optional. Skip it now and add it any time.",
    optional: true,
    doneLabel: "Done, Composio is connected",
    body: (
      <>
        <p className="mb-3">
          Composio lets Claude keep your job tracker in a Google Sheet. It has a free plan, no credit
          card. Without it, your tracker is a simple table inside your copy of the kit.
        </p>
        <Steps>
          <li>
            On{" "}
            <Ext href="https://claude.ai/customize/connectors">claude.ai/customize/connectors</Ext>
            , click <UI>+</UI>, then <UI>Add custom connector</UI>.
          </li>
          <li>
            For the name, type <strong>Composio</strong>. For the URL, paste this:
            <div className="mt-2">
              <CopyText text="https://connect.composio.dev/mcp" />
            </div>
            <span className="block mt-2">
              Leave <UI>Advanced settings</UI> alone and click <UI>Add</UI>.
            </span>
          </li>
          <li>
            Click <UI>Connect</UI>. In the Composio window, choose <UI>Continue with Google</UI> (or{" "}
            <UI>Sign up</UI>) and approve. That makes your free Composio account.
          </li>
          <li>
            That&apos;s it. The first time Claude needs Google Sheets, Docs or Drive through
            Composio, it gives you a link. Click it, sign in to Google, and approve.
          </li>
        </Steps>
        <Note>
          If Claude asks before each Composio action, click Allow. Tired of clicking? On the
          connectors page, open Composio → Tool permissions → Always allow. On a work plan (Team or
          Enterprise), only an owner can add a custom connector.
        </Note>
      </>
    ),
  },
  {
    title: "Start Claude Code and say “set me up”",
    sub: "About 15 minutes, mostly answering questions.",
    doneLabel: "Done, Claude is setting me up",
    body: (
      <>
        <Steps>
          <li>
            Go to <Ext href="https://claude.ai/code">claude.ai/code</Ext>
          </li>
          <li>
            First time only: click <UI>Sign in with GitHub</UI>{" "}
            and say yes on GitHub&apos;s screen. When Claude asks to install its GitHub app, install it. If GitHub asks which
            repositories, pick <UI>Only select repositories</UI> and choose{" "}
            <strong>career-kit</strong>.
          </li>
          <li>
            Under the message box, click the repository picker and choose{" "}
            <strong>career-kit</strong>. Pick only that one: the kit&apos;s safety checks switch on
            only when it&apos;s alone.
          </li>
          <li>
            Type this and press Enter:
            <div className="mt-2">
              <CopyText text="set me up" />
            </div>
          </li>
          <li>
            Claude checks what&apos;s connected and tells you if anything&apos;s missing. Then it
            offers to read every resume in your Google Drive (or just a date range you pick) and
            any work samples you point it to. It asks a few questions about what you want, and
            learns your voice from things you wrote or emails you sent. Short answers are fine. It
            saves everything to your private copy.
          </li>
        </Steps>
        <details className="mt-4 rounded-lg bg-background px-4 py-3 text-xs leading-relaxed text-muted">
          <summary className="cursor-pointer text-foreground">Stuck? Four quick fixes</summary>
          <ul className="mt-3 flex flex-col gap-2.5">
            <li>
              <strong className="text-foreground">career-kit isn&apos;t in the picker.</strong>{" "}
              Claude&apos;s GitHub app can&apos;t see it yet. Open{" "}
              <Ext href="https://github.com/apps/claude/installations/select_target">
                github.com/apps/claude
              </Ext>
              , pick your account, add career-kit, then reload claude.ai/code.
            </li>
            <li>
              <strong className="text-foreground">It asks you to create an environment.</strong>{" "}
              Keep the defaults and click <UI>Create &amp; finish</UI>.
            </li>
            <li>
              <strong className="text-foreground">You use the Claude desktop app.</strong> Click
              the <UI>Code</UI> tab, choose <UI>Cloud</UI>, and pick career-kit. The rest is the
              same.
            </li>
            <li>
              <strong className="text-foreground">You connected something after starting.</strong>{" "}
              Start a new session. Connections load when a session starts.
            </li>
          </ul>
        </details>
      </>
    ),
  },
];

// Progress lives in this visitor's browser only. A module-level copy keeps the
// checklist working when storage is blocked (private windows, strict settings).
const STORAGE_KEY = "career-kit-setup-v1";
let cached: string | null = null;
const listeners = new Set<() => void>();

function readProgress(): string {
  if (cached === null) {
    try {
      cached = window.localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      cached = "";
    }
  }
  return cached;
}

function writeProgress(statuses: Status[]) {
  cached = JSON.stringify(statuses);
  try {
    window.localStorage.setItem(STORAGE_KEY, cached);
  } catch {
    // storage blocked: the in-memory copy still drives the page
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function parseProgress(raw: string): Status[] {
  const blank: Status[] = STEPS.map(() => "todo");
  if (!raw) return blank;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved)) return blank;
    return blank.map((_, i) => (saved[i] === "done" || saved[i] === "skipped" ? saved[i] : "todo"));
  } catch {
    return blank;
  }
}

const firstTodo = (statuses: Status[], from = 0) => {
  const i = statuses.findIndex((s, idx) => idx >= from && s === "todo");
  return i === -1 ? null : i;
};

export function SetupSteps() {
  const raw = useSyncExternalStore(subscribe, readProgress, () => "");
  const statuses = useMemo(() => parseProgress(raw), [raw]);
  // undefined = follow progress (open the first unfinished step); null = all closed.
  const [openOverride, setOpenOverride] = useState<number | null | undefined>(undefined);
  const open = openOverride === undefined ? firstTodo(statuses) : openOverride;
  const items = useRef<(HTMLLIElement | null)[]>([]);

  const finished = statuses.filter((s) => s !== "todo").length;
  const allDone = finished === STEPS.length;

  const setStatus = (i: number, status: Status) => {
    const next = [...statuses];
    const was = next[i];
    next[i] = status;
    writeProgress(next);
    if (status === "done" && was !== "done") track("step", { step: i + 1 });
    if (was === "todo" && next.every((st) => st !== "todo")) track("setup_done");
    if (status === "todo") return;
    const after = firstTodo(next, i + 1) ?? firstTodo(next);
    setOpenOverride(after);
    if (after !== null) {
      requestAnimationFrame(() =>
        items.current[after]?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  };

  const startOver = () => {
    writeProgress(STEPS.map(() => "todo"));
    setOpenOverride(0);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-muted" aria-live="polite">
          {finished} of {STEPS.length} steps done
        </p>
        {finished > 0 && (
          <button type="button" onClick={startOver} className="text-xs text-muted underline hover:opacity-70">
            Start over
          </button>
        )}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${(finished / STEPS.length) * 100}%` }}
        />
      </div>

      <ol className="mt-5 flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const status = statuses[i];
          const isOpen = open === i;
          return (
            <li
              key={step.title}
              ref={(el) => {
                items.current[i] = el;
              }}
              className="scroll-mt-6 rounded-xl border bg-white"
              style={{ borderColor: isOpen ? "#1A1A1A" : "#E5E1D8" }}
            >
              <button
                type="button"
                onClick={() => setOpenOverride(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`setup-step-${i}`}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <StepBadge n={i + 1} status={status} />
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {step.title}
                    {step.optional && (
                      <span
                        className="ml-2 align-middle text-xs font-normal px-2 py-0.5 rounded-full"
                        style={{ background: "#F5E0E6", color: "rgba(26,26,26,0.7)" }}
                      >
                        Optional
                      </span>
                    )}
                  </span>
                  <span className="block text-xs mt-0.5 text-muted">
                    {status === "skipped" ? "Skipped for now. Open it any time." : step.sub}
                  </span>
                </span>
                <span
                  className="shrink-0 text-muted text-xs transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div id={`setup-step-${i}`} className="px-4 pb-5 sm:pl-14 text-sm leading-relaxed text-foreground">
                  {step.body}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {status === "done" ? (
                      <button
                        type="button"
                        onClick={() => setStatus(i, "todo")}
                        className="text-xs px-4 py-2 rounded-lg border border-border bg-white hover:opacity-70"
                      >
                        Mark as not done
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatus(i, "done")}
                        className="text-xs px-4 py-2 rounded-lg hover:opacity-80"
                        style={{ background: "#1A1A1A", color: "#FFF" }}
                      >
                        ✓ {step.doneLabel}
                      </button>
                    )}
                    {step.optional && status === "todo" && (
                      <button
                        type="button"
                        onClick={() => setStatus(i, "skipped")}
                        className="text-xs px-4 py-2 rounded-lg border border-border bg-white hover:opacity-70"
                      >
                        Skip for now
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {allDone && (
        <div className="mt-5 rounded-xl bg-accent-light p-5">
          <p className="text-sm font-medium text-foreground">You&apos;re set up.</p>
          <p className="text-sm mt-1 leading-relaxed text-foreground">
            From now on: open claude.ai/code, pick career-kit, and ask for what you need. Try this
            first:
          </p>
          <div className="mt-3">
            <CopyText text="Tailor my resume for this job:" hint="paste the job link" />
          </div>
          <p className="text-xs mt-3 leading-relaxed" style={{ color: "rgba(26,26,26,0.7)" }}>
            When Claude gets something wrong, correct it, then say &ldquo;learn from this.&rdquo; It
            saves the fix as a rule.
          </p>
        </div>
      )}
    </div>
  );
}

function StepBadge({ n, status }: { n: number; status: Status }) {
  if (status === "done") {
    return (
      <span
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
        style={{ background: "#1A1A1A", color: "#FFF" }}
        aria-label={`Step ${n}, done`}
      >
        ✓
      </span>
    );
  }
  return (
    <span
      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs tabular-nums"
      style={
        status === "skipped"
          ? { border: "1px dashed #8A8A8A", color: "#8A8A8A" }
          : { border: "1px solid #1A1A1A", color: "#1A1A1A" }
      }
      aria-label={`Step ${n}${status === "skipped" ? ", skipped" : ""}`}
    >
      {n}
    </span>
  );
}
