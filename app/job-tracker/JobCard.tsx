"use client";

import { useState, useRef } from "react";
import type { JobApplication, JobPriority, CompanyType, InterviewStage, NoteEntry } from "@/lib/kv";

export const PROJECT_SLUGS = [
  { slug: "muse", title: "Muse Shopping" },
  { slug: "llm-explainer", title: "LLM Explainer" },
  { slug: "claude-skills", title: "Claude Skills" },
  { slug: "kindle-libby", title: "Kindle/Libby" },
  { slug: "home-design", title: "Home Design" },
  { slug: "claude-wishlist", title: "Claude Wishlist" },
  { slug: "vantara-agent-studio", title: "Vantara Agent Studio" },
  { slug: "ldor", title: "LDOR" },
];

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  "big-tech": "Big Tech",
  "ai-lab": "AI Lab",
  "series-c": "Series C",
  "startup": "Startup",
  "other": "Other",
};

const COMPANY_TYPE_COLORS: Record<CompanyType, string> = {
  "big-tech": "bg-blue-50 text-blue-700 border-blue-200",
  "ai-lab": "bg-purple-50 text-purple-700 border-purple-200",
  "series-c": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "startup": "bg-amber-50 text-amber-700 border-amber-200",
  "other": "bg-stone-100 text-stone-600 border-stone-200",
};

const PRIORITY_DOTS: Record<JobPriority, string> = {
  high: "🔴",
  medium: "🟡",
  low: "⚪",
};

export function nextActionLabel(job: JobApplication): string {
  if (job.applied && job.interviewStage === "screening") return "Interview prep";
  if (job.applied && job.interviewStage === "onsite") return "Onsite prep";
  if (job.applied) return "Waiting / follow up";
  if (job.cvReady) return "Apply now ✦";
  if (job.outreachDone) return "Tailor CV";
  return "Send cold email";
}

function nextActionColor(job: JobApplication): string {
  if (job.applied) return "bg-stone-100 text-stone-500";
  if (job.cvReady) return "bg-green-100 text-green-800 font-semibold";
  if (job.outreachDone) return "bg-amber-100 text-amber-800";
  return "bg-sky-100 text-sky-800";
}

function formatNoteDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function todayIso(): string {
  return new Date().toISOString();
}

// Inline editable field — double-click to edit
function InlineEdit({
  value,
  onChange,
  placeholder,
  className,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(value);
    setEditing(true);
    setTimeout(() => ref.current?.focus(), 0);
  }

  function commit() {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }

  if (editing) {
    const sharedProps = {
      ref,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) { e.preventDefault(); commit(); }
        if (e.key === "Escape") { setEditing(false); setDraft(value); }
      },
      className: `w-full text-sm bg-stone-50 border border-stone-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800 ${className ?? ""}`,
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
    };
    return multiline ? (
      <textarea {...sharedProps} rows={2} style={{ resize: "none" }} />
    ) : (
      <input {...sharedProps} />
    );
  }

  return (
    <span
      onDoubleClick={startEdit}
      title="Double-click to edit"
      className={`cursor-text select-text ${className ?? ""}`}
    >
      {value || <span className="text-stone-300 italic">{placeholder}</span>}
    </span>
  );
}

type Props = {
  job: JobApplication;
  onUpdate: (id: string, field: keyof JobApplication, value: unknown) => void;
  onDelete: (id: string) => void;
  onDragStart?: (jobId: string) => void;
};

export default function JobCard({ job, onUpdate, onDelete, onDragStart }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [newNote, setNewNote] = useState("");

  const latestNote: NoteEntry | undefined = job.noteLog?.[job.noteLog.length - 1];

  function handleNoteSubmit() {
    const text = newNote.trim();
    if (!text) return;
    const entry: NoteEntry = { text, date: todayIso() };
    const updated = [...(job.noteLog ?? []), entry];
    onUpdate(job.id, "noteLog", updated);
    onUpdate(job.id, "notes", text);
    setNewNote("");
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("jobId", job.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(job.id);
      }}
      className={`rounded-xl border bg-white shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing active:opacity-70 ${
        expanded ? "ring-2 ring-stone-800 ring-offset-1" : ""
      }`}
    >
      {/* Card header — click to expand, double-click fields to edit */}
      <div
        className="px-4 pt-3 pb-2"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <InlineEdit
                value={job.company}
                onChange={(v) => onUpdate(job.id, "company", v)}
                placeholder="Company name"
                className="font-semibold text-stone-900 text-sm leading-tight"
              />
              {job.companyType && (
                <span
                  className={`text-[10px] font-medium border rounded-full px-1.5 py-0.5 leading-none flex-shrink-0 ${
                    COMPANY_TYPE_COLORS[job.companyType]
                  }`}
                >
                  {COMPANY_TYPE_LABELS[job.companyType]}
                </span>
              )}
            </div>
            {(job.role || !expanded) && (
              <div className="text-xs text-stone-500 mt-0.5 leading-tight">
                <InlineEdit
                  value={job.role}
                  onChange={(v) => onUpdate(job.id, "role", v)}
                  placeholder="Role title"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-sm leading-none">{PRIORITY_DOTS[job.priority]}</span>
            <span className="text-stone-300 text-xs">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Progress chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          {(["outreachDone", "cvReady", "applied"] as const).map((field) => (
            <button
              key={field}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(job.id, field, !job[field]);
              }}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border leading-none transition-colors ${
                job[field]
                  ? field === "applied"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100"
              }`}
              title={`Toggle ${field}`}
            >
              {job[field] ? "✓ " : ""}
              {field === "outreachDone" ? "Outreach" : field === "cvReady" ? "CV" : "Applied"}
            </button>
          ))}
        </div>

        {/* Next action */}
        <div className="mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full leading-none ${nextActionColor(job)}`}>
            → {nextActionLabel(job)}
          </span>
        </div>

        {/* Linked project */}
        {job.projectSlug && (
          <a
            href={`/projects/${job.projectSlug}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-800 underline underline-offset-2"
          >
            ↗ {PROJECT_SLUGS.find((p) => p.slug === job.projectSlug)?.title ?? job.projectSlug}
          </a>
        )}

        {/* Latest note */}
        {latestNote && !expanded && (
          <p className="mt-1.5 text-[10px] text-stone-400 italic leading-snug line-clamp-2">
            {formatNoteDate(latestNote.date)}: {latestNote.text}
          </p>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="border-t border-stone-100 px-4 pt-3 pb-4 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Priority + company type */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Priority</label>
              <select
                className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                value={job.priority}
                onChange={(e) => onUpdate(job.id, "priority", e.target.value as JobPriority)}
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Company Type</label>
              <select
                className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                value={job.companyType ?? ""}
                onChange={(e) =>
                  onUpdate(job.id, "companyType", (e.target.value as CompanyType) || undefined)
                }
              >
                <option value="">— None —</option>
                <option value="big-tech">Big Tech</option>
                <option value="ai-lab">AI Lab</option>
                <option value="series-c">Series C</option>
                <option value="startup">Startup</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Interview stage (only when applied) */}
          {job.applied && (
            <div>
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Interview Stage</label>
              <select
                className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                value={job.interviewStage ?? ""}
                onChange={(e) =>
                  onUpdate(job.id, "interviewStage", (e.target.value as InterviewStage) || undefined)
                }
              >
                <option value="">— None yet —</option>
                <option value="screening">Screening</option>
                <option value="onsite">Onsite</option>
                <option value="offer">Offer 🎉</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Job URL + project */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Job URL</label>
              <input
                className="w-full text-xs text-stone-700 border border-stone-200 rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800"
                value={job.jobUrl ?? ""}
                onChange={(e) => onUpdate(job.id, "jobUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Linked Project</label>
              <select
                className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                value={job.projectSlug ?? ""}
                onChange={(e) => onUpdate(job.id, "projectSlug", e.target.value || undefined)}
              >
                <option value="">— None —</option>
                {PROJECT_SLUGS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note history */}
          <div>
            <label className="text-[10px] text-stone-400 uppercase tracking-wider">Notes</label>
            {job.noteLog && job.noteLog.length > 0 && (
              <div className="mt-1.5 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {[...job.noteLog].reverse().map((entry, i) => (
                  <div key={i} className="text-xs text-stone-600 bg-stone-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-stone-400 font-medium mr-1.5">
                      {formatNoteDate(entry.date)}
                    </span>
                    {entry.text}
                  </div>
                ))}
              </div>
            )}
            {(!job.noteLog || job.noteLog.length === 0) && job.notes && (
              <div className="mt-1.5 text-xs text-stone-600 bg-stone-50 rounded-lg px-3 py-2">
                {job.notes}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <textarea
                className="flex-1 text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
                rows={2}
                placeholder="Add a note…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNoteSubmit();
                  }
                }}
              />
              <button
                onClick={handleNoteSubmit}
                disabled={!newNote.trim()}
                className="text-xs bg-stone-800 text-white rounded-lg px-3 py-1.5 hover:bg-stone-700 disabled:opacity-40 self-end"
              >
                Add
              </button>
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                if (confirm(`Remove ${job.company || "this company"}?`)) onDelete(job.id);
              }}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              Remove card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
