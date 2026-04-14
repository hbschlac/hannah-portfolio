"use client";

import { useState, useRef } from "react";
import type { JobApplication, JobPriority, CompanyType, InterviewStage, NoteEntry, Contact, Artifact } from "@/lib/kv";
import ArtifactsModal from "./ArtifactsModal";

export const PROJECT_SLUGS: { slug: string; title: string; url?: string }[] = [
  { slug: "muse", title: "Muse Shopping" },
  { slug: "llm-explainer", title: "LLM Explainer" },
  { slug: "claude-skills", title: "Claude Skills" },
  { slug: "kindle-libby", title: "Kindle/Libby" },
  { slug: "home-design", title: "Home Design" },
  { slug: "claude-wishlist", title: "Claude Wishlist" },
  { slug: "vantara-agent-studio", title: "Vantara Agent Studio" },
  { slug: "ldor", title: "LDOR" },
  { slug: "tinker-flywheel", title: "Tinker Flywheel", url: "/tinker-flywheel" },
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

// ── Note entry row: editable + deletable ──────────────────────────────────────
function NoteEntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: NoteEntry;
  onEdit: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);
  const ref = useRef<HTMLTextAreaElement>(null);

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(entry.text);
    setEditing(true);
    setTimeout(() => ref.current?.focus(), 0);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== entry.text) onEdit(trimmed);
    else setDraft(entry.text);
  }

  return (
    <div className="group flex items-start gap-1.5 bg-stone-50 rounded-lg px-3 py-2">
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-stone-400 font-medium mr-1.5">
          {formatNoteDate(entry.date)}
        </span>
        {editing ? (
          <textarea
            ref={ref}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
              if (e.key === "Escape") { setEditing(false); setDraft(entry.text); }
            }}
            rows={2}
            className="w-full mt-0.5 text-xs text-stone-700 bg-white border border-stone-300 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-xs text-stone-600 cursor-text"
            onDoubleClick={startEdit}
            title="Double-click to edit"
          >
            {entry.text}
          </span>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
        {!editing && (
          <button
            onClick={startEdit}
            className="text-[10px] text-stone-400 hover:text-stone-700 leading-none"
            title="Edit"
          >
            ✎
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-[10px] text-stone-400 hover:text-red-500 leading-none"
          title="Delete note"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Contact row: checkbox + name (linked) + DM draft + delete ────────────────
function ContactRow({
  contact,
  onUpdate,
  onToggleMessaged,
  onDelete,
}: {
  contact: Contact;
  onUpdate: (patch: Partial<Contact>) => void;
  onToggleMessaged: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(!!contact.dmText);
  const [copied, setCopied] = useState(false);
  const [editingDm, setEditingDm] = useState(false);
  const [dmDraft, setDmDraft] = useState(contact.dmText ?? "");
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(contact.linkedinUrl ?? "");

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!contact.dmText) return;
    try {
      await navigator.clipboard.writeText(contact.dmText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group bg-stone-50 rounded-lg">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <input
          type="checkbox"
          checked={contact.messaged}
          onChange={(e) => { e.stopPropagation(); onToggleMessaged(); }}
          className="accent-stone-800 flex-shrink-0"
          title={contact.messaged ? "Messaged" : "Not messaged"}
        />
        <div className="flex-1 min-w-0 truncate">
          {contact.linkedinUrl ? (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`text-xs hover:underline underline-offset-2 ${
                contact.messaged ? "text-stone-400 line-through" : "text-sky-700"
              }`}
            >
              {contact.name} ↗
            </a>
          ) : (
            <span className={`text-xs ${contact.messaged ? "text-stone-400 line-through" : "text-stone-700"}`}>
              {contact.name}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="text-[10px] text-stone-400 hover:text-stone-700 leading-none flex-shrink-0"
          title={expanded ? "Hide DM" : "Show DM"}
        >
          {expanded ? "▲" : "▼"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-[10px] text-stone-400 hover:text-red-500 leading-none opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Remove contact"
        >
          ✕
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
          {/* LinkedIn URL editor */}
          {!contact.linkedinUrl || editingUrl ? (
            <div className="flex gap-1.5">
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="LinkedIn URL…"
                className="flex-1 text-[11px] border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-800"
              />
              <button
                onClick={() => {
                  onUpdate({ linkedinUrl: urlDraft.trim() || undefined });
                  setEditingUrl(false);
                }}
                className="text-[10px] bg-stone-800 text-white rounded px-2 py-1 hover:bg-stone-700"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setUrlDraft(contact.linkedinUrl ?? ""); setEditingUrl(true); }}
              className="text-[10px] text-stone-400 hover:text-stone-700"
            >
              ✎ Edit LinkedIn URL
            </button>
          )}

          {/* DM context / hook */}
          {contact.dmContext && (
            <p className="text-[10px] text-stone-500 italic leading-snug">
              Hook: {contact.dmContext}
            </p>
          )}

          {/* DM text + copy */}
          {editingDm ? (
            <div className="space-y-1.5">
              <textarea
                value={dmDraft}
                onChange={(e) => setDmDraft(e.target.value)}
                rows={6}
                className="w-full text-xs text-stone-700 bg-white border border-stone-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800 resize-y"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => { setDmDraft(contact.dmText ?? ""); setEditingDm(false); }}
                  className="text-[10px] text-stone-500 hover:text-stone-800 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdate({ dmText: dmDraft.trim() || undefined });
                    setEditingDm(false);
                  }}
                  className="text-[10px] bg-stone-800 text-white rounded px-2 py-1 hover:bg-stone-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : contact.dmText ? (
            <div className="relative">
              <pre className="text-[11px] text-stone-700 bg-white border border-stone-200 rounded px-2 py-2 whitespace-pre-wrap font-sans leading-snug">
                {contact.dmText}
              </pre>
              <div className="flex gap-1.5 mt-1.5 justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); setDmDraft(contact.dmText ?? ""); setEditingDm(true); }}
                  className="text-[10px] text-stone-500 hover:text-stone-800 px-2 py-1"
                >
                  ✎ Edit
                </button>
                <button
                  onClick={handleCopy}
                  className={`text-[10px] rounded px-2 py-1 transition-colors ${
                    copied
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-800 text-white hover:bg-stone-700"
                  }`}
                >
                  {copied ? "✓ Copied" : "Copy DM"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setDmDraft(""); setEditingDm(true); }}
              className="text-[10px] text-stone-500 hover:text-stone-800 border border-dashed border-stone-300 rounded px-2 py-1 w-full"
            >
              + Add DM draft
            </button>
          )}
        </div>
      )}
    </div>
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
  const [artifactsOpen, setArtifactsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactUrl, setNewContactUrl] = useState("");
  const artifactCount = job.artifacts?.length ?? 0;
  const isCustomProject = !!job.projectSlug && !PROJECT_SLUGS.some((p) => p.slug === job.projectSlug);
  const [showCustomProject, setShowCustomProject] = useState(isCustomProject);

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

        {/* Artifacts button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setArtifactsOpen(true);
          }}
          className={`mt-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full leading-none border transition-colors ${
            artifactCount > 0
              ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
              : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
          }`}
          title="Open artifacts"
        >
          <span>📎</span>
          <span>
            Artifacts{artifactCount > 0 ? ` (${artifactCount})` : ""}
          </span>
        </button>

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
          {job.cvReady && !job.applied && job.jobUrl ? (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`text-[10px] px-2 py-0.5 rounded-full leading-none ${nextActionColor(job)}`}
            >
              → {nextActionLabel(job)}
            </a>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded-full leading-none ${nextActionColor(job)}`}>
              → {nextActionLabel(job)}
            </span>
          )}
        </div>

        {/* Linked project */}
        {job.projectSlug && (() => {
          const linked = PROJECT_SLUGS.find((p) => p.slug === job.projectSlug);
          const href = linked?.url ?? `/projects/${job.projectSlug}`;
          return (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-800 underline underline-offset-2"
            >
              ↗ {linked?.title ?? job.projectSlug}
            </a>
          );
        })()}

        {/* Latest note */}
        {latestNote && !expanded && (
          <p className="mt-1.5 text-[10px] text-stone-400 italic leading-snug line-clamp-2">
            {formatNoteDate(latestNote.date)}: {latestNote.text}
          </p>
        )}

        {/* Contacts indicator */}
        {job.contacts && job.contacts.length > 0 && !expanded && (
          <p className="mt-1 text-[10px] text-stone-400 leading-snug">
            {job.contacts.filter((c) => c.messaged).length}/{job.contacts.length} contacts messaged
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
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Job URL</label>
              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                <input
                  className="flex-1 min-w-0 text-xs text-stone-700 border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800 truncate"
                  value={job.jobUrl ?? ""}
                  onChange={(e) => onUpdate(job.id, "jobUrl", e.target.value)}
                  placeholder="https://…"
                />
                {job.jobUrl && (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg px-2 py-1.5 transition-colors"
                    title="Open job posting"
                  >
                    ↗
                  </a>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-[10px] text-stone-400 uppercase tracking-wider">Linked Project</label>
              <select
                className="w-full text-sm border border-stone-200 rounded-lg px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                value={showCustomProject ? "__custom__" : (job.projectSlug ?? "")}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setShowCustomProject(true);
                    onUpdate(job.id, "projectSlug", undefined);
                  } else {
                    setShowCustomProject(false);
                    onUpdate(job.id, "projectSlug", e.target.value || undefined);
                  }
                }}
              >
                <option value="">— None —</option>
                {PROJECT_SLUGS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
                <option value="__custom__">Other (type slug below)</option>
              </select>
              {showCustomProject && (
                <input
                  className="w-full mt-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  placeholder="e.g. workspace-ai-gaps"
                  value={job.projectSlug ?? ""}
                  onChange={(e) => onUpdate(job.id, "projectSlug", e.target.value || undefined)}
                />
              )}
            </div>
          </div>

          {/* Contacts */}
          <div>
            <label className="text-[10px] text-stone-400 uppercase tracking-wider">
              Contacts
              {job.contacts && job.contacts.length > 0 && (
                <span className="ml-1.5 normal-case text-stone-300 font-normal">
                  {job.contacts.filter((c) => c.messaged).length}/{job.contacts.length} messaged
                </span>
              )}
            </label>
            {job.contacts && job.contacts.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {job.contacts.map((contact, i) => (
                  <ContactRow
                    key={i}
                    contact={contact}
                    onUpdate={(patch) => {
                      const updated = job.contacts!.map((c, idx) =>
                        idx === i ? { ...c, ...patch } : c
                      );
                      onUpdate(job.id, "contacts", updated);
                    }}
                    onToggleMessaged={() => {
                      const updated = job.contacts!.map((c, idx) =>
                        idx === i ? { ...c, messaged: !c.messaged } : c
                      );
                      onUpdate(job.id, "contacts", updated);
                      // Auto-set outreachDone when first contact is messaged
                      if (!job.outreachDone && !contact.messaged) {
                        onUpdate(job.id, "outreachDone", true);
                      }
                    }}
                    onDelete={() => {
                      const updated = job.contacts!.filter((_, idx) => idx !== i);
                      onUpdate(job.id, "contacts", updated);
                    }}
                  />
                ))}
              </div>
            )}
            <div className="mt-2 space-y-1.5">
              <input
                className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800"
                placeholder="Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const name = newContactName.trim();
                    if (!name) return;
                    const newContact: Contact = { name, linkedinUrl: newContactUrl.trim() || undefined, messaged: false };
                    onUpdate(job.id, "contacts", [...(job.contacts ?? []), newContact]);
                    setNewContactName("");
                    setNewContactUrl("");
                  }
                }}
              />
              <div className="flex gap-1.5">
                <input
                  className="flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  placeholder="LinkedIn URL (optional)"
                  value={newContactUrl}
                  onChange={(e) => setNewContactUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = newContactName.trim();
                      if (!name) return;
                      const newContact: Contact = { name, linkedinUrl: newContactUrl.trim() || undefined, messaged: false };
                      onUpdate(job.id, "contacts", [...(job.contacts ?? []), newContact]);
                      setNewContactName("");
                      setNewContactUrl("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const name = newContactName.trim();
                    if (!name) return;
                    const newContact: Contact = { name, linkedinUrl: newContactUrl.trim() || undefined, messaged: false };
                    onUpdate(job.id, "contacts", [...(job.contacts ?? []), newContact]);
                    setNewContactName("");
                    setNewContactUrl("");
                  }}
                  disabled={!newContactName.trim()}
                  className="text-xs bg-stone-800 text-white rounded-lg px-3 py-1.5 hover:bg-stone-700 disabled:opacity-40 flex-shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Note history */}
          <div>
            <label className="text-[10px] text-stone-400 uppercase tracking-wider">Notes</label>
            {job.noteLog && job.noteLog.length > 0 && (
              <div className="mt-1.5 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {[...job.noteLog].map((_entry, i) => {
                  const displayEntry = [...job.noteLog!].reverse()[i];
                  return (
                    <NoteEntryRow
                      key={displayEntry.date + i}
                      entry={displayEntry}
                      onEdit={(text) => {
                        const updated = job.noteLog!.map((e, idx) =>
                          idx === job.noteLog!.length - 1 - i ? { ...e, text } : e
                        );
                        onUpdate(job.id, "noteLog", updated);
                      }}
                      onDelete={() => {
                        const updated = job.noteLog!.filter(
                          (_, idx) => idx !== job.noteLog!.length - 1 - i
                        );
                        onUpdate(job.id, "noteLog", updated);
                        if (updated.length > 0) {
                          onUpdate(job.id, "notes", updated[updated.length - 1].text);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
            {(!job.noteLog || job.noteLog.length === 0) && (
              <div className="mt-1.5">
                <textarea
                  className="w-full text-xs text-stone-700 border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
                  rows={3}
                  placeholder="No notes yet…"
                  defaultValue={job.notes ?? ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val !== (job.notes ?? "").trim()) {
                      onUpdate(job.id, "notes", val);
                    }
                  }}
                />
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

          {/* Artifacts (expanded shortcut) */}
          <div>
            <label className="text-[10px] text-stone-400 uppercase tracking-wider">Artifacts</label>
            <button
              onClick={() => setArtifactsOpen(true)}
              className="mt-1 w-full text-xs text-stone-600 border border-dashed border-stone-300 rounded-lg px-3 py-2 hover:border-stone-800 hover:text-stone-900 transition-colors"
            >
              {artifactCount === 0
                ? "+ Add artifact (intro-call notes, transcripts, pre-reads…)"
                : `Open ${artifactCount} artifact${artifactCount === 1 ? "" : "s"}`}
            </button>
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

      {artifactsOpen && (
        <ArtifactsModal
          company={job.company}
          artifacts={job.artifacts ?? []}
          onChange={(next: Artifact[]) => onUpdate(job.id, "artifacts", next)}
          onClose={() => setArtifactsOpen(false)}
        />
      )}
    </div>
  );
}
