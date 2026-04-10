"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { saveJobs, type SaveJobsResult } from "./actions";
import type { JobApplication, JobPriority } from "@/lib/kv";

function newBlankJob(): JobApplication {
  return {
    id: crypto.randomUUID(),
    company: "",
    role: "",
    jobUrl: "",
    cvReady: false,
    outreachDone: false,
    applied: false,
    notes: "",
    priority: "medium",
    activeSession: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function rowBg(job: JobApplication): string {
  const allDone = job.cvReady && job.outreachDone && job.applied;
  const anyDone = job.cvReady || job.outreachDone || job.applied;
  if (allDone) return "bg-green-50";
  if (anyDone) return "bg-amber-50";
  return "bg-white";
}

const textareaCls =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-stone-800 rounded px-1.5 py-1 text-stone-800 placeholder:text-stone-300 text-sm resize-none overflow-hidden leading-snug";

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

const PRIORITY_STYLES: Record<JobPriority, string> = {
  high: "text-red-700 bg-red-50",
  medium: "text-amber-700 bg-amber-50",
  low: "text-stone-500 bg-stone-100",
};

export default function JobTable({ initialJobs }: { initialJobs: JobApplication[] }) {
  const [jobs, setJobs] = useState<JobApplication[]>(() =>
    initialJobs.length ? initialJobs : [newBlankJob()]
  );
  const [saveResult, setSaveResult] = useState<SaveJobsResult>({});
  const [isPending, startTransition] = useTransition();
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;
    tableRef.current.querySelectorAll<HTMLTextAreaElement>("textarea").forEach(autoResize);
  }, [jobs.length]);

  function updateJob(id: string, field: keyof JobApplication, value: unknown) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, [field]: value } : j)));
    setSaveResult({});
  }

  function deleteJob(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSaveResult({});
  }

  function handleSave() {
    const now = new Date().toISOString();
    const stamped = jobs.map((j) => ({ ...j, updatedAt: now }));
    startTransition(async () => {
      const result = await saveJobs(stamped);
      setSaveResult(result);
      if (!result.error) setJobs(stamped);
    });
  }

  // Banner counts
  const needsOutreach = jobs.filter((j) => !j.outreachDone && !j.applied).length;
  const needsCV = jobs.filter((j) => !j.cvReady && !j.applied).length;
  const readyToApply = jobs.filter((j) => j.cvReady && !j.applied).length;
  const allCaughtUp = needsOutreach === 0 && needsCV === 0 && readyToApply === 0 && jobs.some((j) => j.company);

  return (
    <div>
      {/* Smart banner */}
      {jobs.some((j) => j.company) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {needsOutreach > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2">
              <span className="text-lg">✉️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {needsOutreach} {needsOutreach === 1 ? "company needs" : "companies need"} outreach
                </p>
                <p className="text-xs text-amber-600">Contact someone at the company</p>
              </div>
            </div>
          )}
          {needsCV > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2">
              <span className="text-lg">📄</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {needsCV} CV{needsCV === 1 ? "" : "s"} to tailor
                </p>
                <p className="text-xs text-amber-600">Resume not yet ready for this role</p>
              </div>
            </div>
          )}
          {readyToApply > 0 && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  {readyToApply} ready to submit
                </p>
                <p className="text-xs text-blue-600">CV done — just needs application</p>
              </div>
            </div>
          )}
          {allCaughtUp && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <p className="text-sm font-semibold text-green-800">All caught up</p>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table ref={tableRef} className="w-max min-w-full text-sm border-collapse">
          <colgroup>
            <col style={{ width: 30 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 40 }} />
          </colgroup>
          <thead>
            <tr className="bg-stone-50 text-xs font-medium text-stone-500 uppercase tracking-wider">
              <th className="px-2 py-3 text-center border-b border-stone-200 sticky left-0 z-20 bg-stone-50">
                #
              </th>
              <th className="px-2 py-3 text-left border-b border-stone-200 sticky left-[30px] z-20 bg-stone-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                Company
              </th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Role</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Priority</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">CV ✓</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">Outreach ✓</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">Applied ✓</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Session</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Notes</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Job URL</th>
              <th className="px-2 py-3 border-b border-stone-200" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, idx) => (
              <tr
                key={job.id}
                className={`border-t border-stone-100 transition-colors ${rowBg(job)}`}
              >
                {/* # — sticky */}
                <td className={`px-2 py-2 text-center text-stone-400 text-xs align-top sticky left-0 z-10 ${rowBg(job)}`}>
                  {idx + 1}
                </td>

                {/* Company — sticky */}
                <td className={`px-1 py-1 align-top sticky left-[30px] z-10 ${rowBg(job)} border-r border-stone-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}>
                  <textarea
                    className={textareaCls}
                    value={job.company}
                    rows={1}
                    placeholder="Company"
                    onChange={(e) => updateJob(job.id, "company", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Role */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={job.role}
                    rows={1}
                    placeholder="Role title"
                    onChange={(e) => updateJob(job.id, "role", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Priority */}
                <td className="px-2 py-2 align-top">
                  <select
                    value={job.priority}
                    onChange={(e) => updateJob(job.id, "priority", e.target.value as JobPriority)}
                    className={`text-xs font-medium rounded-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-stone-800 cursor-pointer ${PRIORITY_STYLES[job.priority]}`}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </td>

                {/* CV Ready */}
                <td className="px-2 py-2 text-center align-top">
                  <input
                    type="checkbox"
                    checked={job.cvReady}
                    onChange={(e) => updateJob(job.id, "cvReady", e.target.checked)}
                    className="accent-stone-800 w-4 h-4 cursor-pointer"
                    aria-label="CV ready"
                  />
                </td>

                {/* Outreach Done */}
                <td className="px-2 py-2 text-center align-top">
                  <input
                    type="checkbox"
                    checked={job.outreachDone}
                    onChange={(e) => updateJob(job.id, "outreachDone", e.target.checked)}
                    className="accent-stone-800 w-4 h-4 cursor-pointer"
                    aria-label="Outreach done"
                  />
                </td>

                {/* Applied */}
                <td className="px-2 py-2 text-center align-top">
                  <input
                    type="checkbox"
                    checked={job.applied}
                    onChange={(e) => updateJob(job.id, "applied", e.target.checked)}
                    className="accent-stone-800 w-4 h-4 cursor-pointer"
                    aria-label="Applied"
                  />
                </td>

                {/* Active Session */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={job.activeSession ?? ""}
                    rows={1}
                    placeholder="e.g. session-1"
                    onChange={(e) => updateJob(job.id, "activeSession", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Notes */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={job.notes}
                    rows={1}
                    placeholder="Notes"
                    onChange={(e) => updateJob(job.id, "notes", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Job URL */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={job.jobUrl ?? ""}
                    rows={1}
                    placeholder="https://…"
                    onChange={(e) => updateJob(job.id, "jobUrl", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Delete */}
                <td className="px-1 py-2 text-center align-top">
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors text-base leading-none"
                    aria-label="Delete row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={() => setJobs((prev) => [...prev, newBlankJob()])}
          className="border border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-800 rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + Add row
        </button>
        {saveResult.error && (
          <span className="text-sm text-red-600">{saveResult.error}</span>
        )}
        {saveResult.savedAt && !saveResult.error && (
          <span className="text-sm text-stone-400">
            Saved {new Date(saveResult.savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
