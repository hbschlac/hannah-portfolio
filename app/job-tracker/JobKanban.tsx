"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { saveJobs } from "./actions";
import type { JobApplication, CompanyType, InterviewStage, CustomTask } from "@/lib/kv";
import JobCard from "./JobCard";
import TodayFocus from "./TodayFocus";

// ─── Column definitions ───────────────────────────────────────────────────────

type KanbanColumn = {
  id: string;
  label: string;
  description: string;
  border: string;
  headerBg: string;
  headerText: string;
};

const COLUMNS: KanbanColumn[] = [
  { id: "radar",       label: "On Radar",       description: "Tracking — nothing started", border: "border-stone-200",  headerBg: "bg-stone-50",   headerText: "text-stone-600" },
  { id: "outreach-cv", label: "Outreach & CV",  description: "Outreach done · tailoring",  border: "border-sky-200",    headerBg: "bg-sky-50",     headerText: "text-sky-700" },
  { id: "ready",       label: "Ready to Apply", description: "CV done — just submit",       border: "border-amber-200",  headerBg: "bg-amber-50",   headerText: "text-amber-700" },
  { id: "applied",     label: "Applied",        description: "Application submitted",       border: "border-blue-200",   headerBg: "bg-blue-50",    headerText: "text-blue-700" },
  { id: "interviewing",label: "Interviewing",   description: "Active process",              border: "border-violet-200", headerBg: "bg-violet-50",  headerText: "text-violet-700" },
  { id: "closed",      label: "Closed",         description: "Offer or rejected",           border: "border-stone-200",  headerBg: "bg-stone-100",  headerText: "text-stone-500" },
];

export function getColumnId(job: JobApplication): string {
  const stage = job.interviewStage;
  if (stage === "offer" || stage === "rejected") return "closed";
  if (stage === "screening" || stage === "onsite") return "interviewing";
  if (job.applied) return "applied";
  if (job.cvReady) return "ready";
  if (job.outreachDone) return "outreach-cv";
  return "radar";
}

// When a card is dropped onto a column, update its booleans accordingly
function applyColumnMove(job: JobApplication, targetColumnId: string): Partial<JobApplication> {
  switch (targetColumnId) {
    case "radar":
      return { outreachDone: false, cvReady: false, applied: false, interviewStage: undefined };
    case "outreach-cv":
      return { outreachDone: true, cvReady: false, applied: false, interviewStage: undefined };
    case "ready":
      return { cvReady: true, applied: false, interviewStage: undefined };
    case "applied":
      return { cvReady: true, applied: true, interviewStage: undefined };
    case "interviewing":
      return { cvReady: true, applied: true, interviewStage: "screening" as InterviewStage };
    case "closed":
      return { cvReady: true, applied: true, interviewStage: "rejected" as InterviewStage };
    default:
      return {};
  }
}

// ─── Type filter tabs ─────────────────────────────────────────────────────────

const TYPE_TABS: { value: CompanyType | "all"; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "big-tech",  label: "Big Tech" },
  { value: "ai-lab",    label: "AI Labs" },
  { value: "series-c",  label: "Series C" },
  { value: "startup",   label: "Startup" },
];

type SortOption = "priority" | "company" | "recent";
const SORT_LABELS: Record<SortOption, string> = {
  priority: "Priority",
  company: "A–Z",
  recent: "Most recent",
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function sortJobs(jobs: JobApplication[], sort: SortOption): JobApplication[] {
  return [...jobs].sort((a, b) => {
    if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sort === "company") return a.company.localeCompare(b.company);
    if (sort === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return 0;
  });
}

// ─── Pipeline summary ─────────────────────────────────────────────────────────

function PipelineSummary({ jobs }: { jobs: JobApplication[] }) {
  const ready       = jobs.filter((j) => j.cvReady && !j.applied).length;
  const applied     = jobs.filter((j) => j.applied).length;
  const interviewing = jobs.filter((j) => j.interviewStage === "screening" || j.interviewStage === "onsite").length;
  const radar       = jobs.filter((j) => !j.outreachDone && !j.cvReady && !j.applied).length;

  let message = "";
  if (interviewing > 0)    message = `You're actively interviewing at ${interviewing} ${interviewing === 1 ? "company" : "companies"} 🔥`;
  else if (ready > 0)      message = `${ready} ${ready === 1 ? "application is" : "applications are"} ready to submit — let's go!`;
  else if (applied > 0)    message = `${applied} ${applied === 1 ? "application" : "applications"} out there. Keep the momentum.`;
  else                     message = `${radar} companies on your radar. Time to start the pipeline.`;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-5 rounded-2xl border border-stone-100 bg-stone-50 px-5 py-3">
      <div className="flex gap-6 flex-1">
        {([
          { label: "On Radar",       count: radar,       color: "text-stone-600" },
          { label: "Ready to Apply", count: ready,       color: "text-amber-600 font-semibold" },
          { label: "Applied",        count: applied,     color: "text-blue-600" },
          { label: "Interviewing",   count: interviewing, color: "text-violet-600" },
        ] as const).map(({ label, count, color }) => (
          <div key={label} className="text-center">
            <p className={`text-xl font-bold leading-none ${color}`}>{count}</p>
            <p className="text-[10px] text-stone-400 mt-0.5 leading-none whitespace-nowrap">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-500 italic">{message}</p>
    </div>
  );
}

// ─── New blank job ────────────────────────────────────────────────────────────

function newBlankJob(columnId: string): JobApplication {
  const base: JobApplication = {
    id: crypto.randomUUID(),
    company: "",
    role: "",
    jobUrl: "",
    cvReady: false,
    outreachDone: false,
    applied: false,
    notes: "",
    priority: "high",
    activeSession: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    noteLog: [],
  };
  if (columnId === "outreach-cv") base.outreachDone = true;
  if (columnId === "ready")       { base.outreachDone = true; base.cvReady = true; }
  if (columnId === "applied")     { base.cvReady = true; base.applied = true; }
  return base;
}

// ─── Main Kanban ──────────────────────────────────────────────────────────────

export default function JobKanban({ initialJobs }: { initialJobs: JobApplication[] }) {
  const [jobs, setJobs]             = useState<JobApplication[]>(initialJobs);
  const jobsRef                     = useRef<JobApplication[]>(initialJobs);
  const [typeFilter, setTypeFilter] = useState<CompanyType | "all">("all");
  const [sort, setSort]             = useState<SortOption>("priority");
  const [search, setSearch]         = useState("");
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [dismissedTaskIds, setDismissedTaskIds] = useState<Set<string>>(new Set());
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => { if (data.ok) setCustomTasks(data.tasks); })
      .catch(() => {});
  }, []);

  // Keep ref in sync so persistSave always reads the latest jobs
  function setJobsAndRef(updater: JobApplication[] | ((prev: JobApplication[]) => JobApplication[])) {
    if (typeof updater === "function") {
      setJobs((prev) => {
        const next = updater(prev);
        jobsRef.current = next;
        return next;
      });
    } else {
      jobsRef.current = updater;
      setJobs(updater);
    }
  }

  // Apply filter + search
  const displayed = jobs.filter((j) => {
    if (typeFilter !== "all" && j.companyType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        (j.notes ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  function updateJob(id: string, field: keyof JobApplication, value: unknown) {
    setJobsAndRef((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, [field]: value, updatedAt: new Date().toISOString() } : j
      )
    );
    setSaveStatus("idle");
    scheduleSave();
  }

  function deleteJob(id: string) {
    setJobsAndRef((prev) => prev.filter((j) => j.id !== id));
    scheduleSave();
  }

  function addJob(columnId: string) {
    setJobsAndRef((prev) => [...prev, newBlankJob(columnId)]);
  }

  function scheduleSave() {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => persistSave(), 1200);
  }

  function persistSave() {
    setSaveStatus("saving");
    const now = new Date().toISOString();
    const stamped = jobsRef.current.map((j) => ({ ...j, updatedAt: now }));
    setJobsAndRef(stamped);
    startTransition(async () => {
      const result = await saveJobs(stamped);
      setSaveStatus(result.error ? "error" : "saved");
      if (!result.error) setTimeout(() => setSaveStatus("idle"), 2500);
    });
  }

  function handleTaskDone(jobId: string, field: string) {
    setCompletedTaskIds((prev) => new Set([...prev, `${jobId}:${field}`]));
    scheduleSave();
  }

  function handleTaskDismiss(jobId: string, field: string) {
    setDismissedTaskIds((prev) => new Set([...prev, `${jobId}:${field}`]));
  }

  async function handleCustomTaskAdd(label: string) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", label }),
    });
    const data = await res.json();
    if (data.ok) setCustomTasks(data.tasks);
  }

  function handleCustomTaskDelete(id: string) {
    setCustomTasks((prev) => prev.filter((t) => t.id !== id));
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    }).catch(() => {});
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────────
  function handleDrop(e: React.DragEvent, targetColumnId: string) {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    if (!jobId) return;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const currentCol = getColumnId(job);
    if (currentCol === targetColumnId) { setDragOverCol(null); return; }
    const patch = applyColumnMove(job, targetColumnId);
    setJobsAndRef((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, ...patch, updatedAt: new Date().toISOString() }
          : j
      )
    );
    setDragOverCol(null);
    scheduleSave();
  }

  const saveLabel =
    saveStatus === "saving" ? "Saving…" :
    saveStatus === "saved"  ? "Saved ✓" :
    saveStatus === "error"  ? "Save failed" : null;

  return (
    <div>
      <PipelineSummary jobs={jobs} />

      <TodayFocus
        jobs={jobs}
        onUpdate={updateJob}
        completedTaskIds={completedTaskIds}
        dismissedTaskIds={dismissedTaskIds}
        onTaskDone={handleTaskDone}
        onTaskDismiss={handleTaskDismiss}
        customTasks={customTasks}
        onCustomTaskAdd={handleCustomTaskAdd}
        onCustomTaskDelete={handleCustomTaskDelete}
      />

      {/* Toolbar: search + type filter + sort + save */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search companies, roles, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 w-56"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {TYPE_TABS.map((tab) => {
            const count = tab.value === "all"
              ? jobs.length
              : jobs.filter((j) => j.companyType === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  typeFilter === tab.value
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-stone-400">Sort:</span>
          <div className="flex gap-0.5 rounded-lg border border-stone-200 bg-white p-0.5">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  sort === s ? "bg-stone-800 text-white" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {SORT_LABELS[s]}
              </button>
            ))}
          </div>

          {saveLabel && (
            <span className={`text-xs ml-2 ${saveStatus === "error" ? "text-red-500" : "text-stone-400"}`}>
              {saveLabel}
            </span>
          )}
          <button
            onClick={persistSave}
            disabled={isPending}
            className="text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-colors ml-1"
          >
            Save
          </button>
        </div>
      </div>

      {/* Search results hint */}
      {search && (
        <p className="text-xs text-stone-400 mb-3">
          Showing {displayed.length} of {jobs.length} companies matching &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-8" style={{ minHeight: "60vh" }}>
        {COLUMNS.map((col) => {
          const colJobs = sortJobs(
            displayed.filter((j) => getColumnId(j) === col.id),
            sort
          );
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={(e) => {
                // only clear if leaving the column itself
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol(null);
                }
              }}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-shrink-0 w-72 rounded-2xl border-2 transition-colors ${
                isOver ? "border-stone-400 bg-stone-50" : `${col.border} bg-white/50`
              }`}
            >
              {/* Column header */}
              <div className={`rounded-t-xl px-4 py-3 ${col.headerBg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-semibold leading-none ${col.headerText}`}>
                      {col.label}
                    </h3>
                    <p className={`text-[10px] opacity-70 mt-0.5 ${col.headerText}`}>
                      {col.description}
                    </p>
                  </div>
                  <span className={`text-sm font-bold opacity-50 ${col.headerText}`}>
                    {colJobs.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="px-3 py-3 space-y-2.5 min-h-[80px]">
                {colJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onUpdate={updateJob}
                    onDelete={deleteJob}
                  />
                ))}

                {isOver && (
                  <div className="h-12 rounded-xl border-2 border-dashed border-stone-400 bg-stone-100 flex items-center justify-center">
                    <span className="text-xs text-stone-400">Drop here</span>
                  </div>
                )}

                <button
                  onClick={() => addJob(col.id)}
                  className="w-full text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl border border-dashed border-stone-200 py-2 transition-colors"
                >
                  + Add company
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
