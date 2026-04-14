"use client";

import { useState, useRef } from "react";
import type { JobApplication, CustomTask } from "@/lib/kv";

type FocusTask = {
  label: string;
  jobId: string;
  field: "cvReady" | "outreachDone" | "applied";
  value: boolean;
  company: string;
  jobUrl?: string;
};

function computeTasks(jobs: JobApplication[]): FocusTask[] {
  const tasks: FocusTask[] = [];

  for (const j of jobs.filter((j) => j.cvReady && !j.applied)) {
    tasks.push({ label: `Apply to ${j.company}`, jobId: j.id, field: "applied", value: true, company: j.company, jobUrl: j.jobUrl });
    if (tasks.length >= 3) break;
  }

  for (const j of jobs.filter((j) => j.priority === "high" && !j.cvReady && !j.applied)) {
    if (tasks.length >= 5) break;
    tasks.push({ label: `Tailor CV for ${j.company}`, jobId: j.id, field: "cvReady", value: true, company: j.company });
  }

  for (const j of jobs.filter((j) => j.priority === "high" && !j.outreachDone && !j.applied)) {
    if (tasks.length >= 5) break;
    if (tasks.some((t) => t.jobId === j.id)) continue;
    tasks.push({ label: `Reach out to someone at ${j.company}`, jobId: j.id, field: "outreachDone", value: true, company: j.company });
  }

  return tasks.slice(0, 5);
}

type Props = {
  jobs: JobApplication[];
  onUpdate: (id: string, field: keyof JobApplication, value: unknown) => void;
  completedTaskIds: Set<string>;
  dismissedTaskIds: Set<string>;
  onTaskDone: (jobId: string, field: string) => void;
  onTaskDismiss: (jobId: string, field: string) => void;
  customTasks: CustomTask[];
  onCustomTaskAdd: (label: string) => Promise<void>;
  onCustomTaskDelete: (id: string) => void;
};

export default function TodayFocus({
  jobs,
  onUpdate,
  completedTaskIds,
  dismissedTaskIds,
  onTaskDone,
  onTaskDismiss,
  customTasks,
  onCustomTaskAdd,
  onCustomTaskDelete,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allJobTasks = computeTasks(jobs);
  const jobTasks = allJobTasks.filter((t) => !dismissedTaskIds.has(`${t.jobId}:${t.field}`));
  const totalTasks = jobTasks.length + customTasks.length;

  async function handleAdd() {
    const label = inputVal.trim();
    if (!label) return;
    setAdding(true);
    await onCustomTaskAdd(label);
    setInputVal("");
    setAdding(false);
    setShowAdd(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setShowAdd(false); setInputVal(""); }
  }

  function handleShowAdd() {
    setShowAdd(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (totalTasks === 0 && !showAdd) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-emerald-800">
            ✅ All caught up — nothing urgent today!
          </p>
          <button
            onClick={handleShowAdd}
            className="text-xs text-emerald-600 hover:text-emerald-800 border border-emerald-300 hover:border-emerald-500 rounded-lg px-2.5 py-1 transition-colors"
          >
            + Add task
          </button>
        </div>
        {showAdd && (
          <div className="mt-3 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you need to do?"
              className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !inputVal.trim()}
              className="text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAdd(false); setInputVal(""); }}
              className="text-xs text-stone-400 hover:text-stone-700 px-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  const doneJobCount = jobTasks.filter((t) => completedTaskIds.has(`${t.jobId}:${t.field}`)).length;
  const doneCustomCount = customTasks.filter((t) => completedTaskIds.has(`custom:${t.id}`)).length;
  const doneCount = doneJobCount + doneCustomCount;
  const allDone = totalTasks > 0 && doneCount === totalTasks;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-stone-50 to-slate-50 border border-stone-200 px-5 py-4 mb-6">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">
            {allDone ? "✅ Day's focus complete!" : "Today's Focus"}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {doneCount}/{totalTasks} done{allDone ? " — amazing momentum 🎉" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Custom tasks */}
        {customTasks.map((task) => {
          const key = `custom:${task.id}`;
          const done = completedTaskIds.has(key);
          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                done ? "bg-emerald-50 border-emerald-200" : "bg-white border-stone-100"
              } border`}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={(e) => {
                  if (e.target.checked) onTaskDone(`custom:${task.id}`, "custom");
                }}
                className="accent-stone-800 w-4 h-4 flex-shrink-0 cursor-pointer"
              />
              <span className={`text-sm flex-1 ${done ? "line-through text-stone-400" : "text-stone-700"}`}>
                {task.label}
              </span>
              <button
                onClick={() => onCustomTaskDelete(task.id)}
                className="text-stone-300 hover:text-stone-500 text-sm leading-none flex-shrink-0"
                title="Delete task"
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Auto-generated job tasks */}
        {jobTasks.map((task) => {
          const key = `${task.jobId}:${task.field}`;
          const done = completedTaskIds.has(key);
          return (
            <div
              key={key}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                done ? "bg-emerald-50 border-emerald-200" : "bg-white border-stone-100"
              } border`}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={(e) => {
                  if (e.target.checked) {
                    onUpdate(task.jobId, task.field, task.value);
                    onTaskDone(task.jobId, task.field);
                  }
                }}
                className="accent-stone-800 w-4 h-4 flex-shrink-0 cursor-pointer"
              />
              <span className={`text-sm flex-1 ${done ? "line-through text-stone-400" : "text-stone-700"}`}>
                {task.label}
              </span>
              {task.jobUrl && !done && (
                <a
                  href={task.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-stone-400 hover:text-stone-700 underline flex-shrink-0"
                >
                  Job ↗
                </a>
              )}
              {!done && (
                <button
                  onClick={() => onTaskDismiss(task.jobId, task.field)}
                  className="text-stone-300 hover:text-stone-500 text-sm leading-none flex-shrink-0"
                  title="Remove from today's list"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Add task row */}
        {showAdd ? (
          <div className="flex gap-2 pt-1">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you need to do?"
              className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !inputVal.trim()}
              className="text-xs bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAdd(false); setInputVal(""); }}
              className="text-xs text-stone-400 hover:text-stone-700 px-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleShowAdd}
            className="w-full text-left text-xs text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
