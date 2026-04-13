"use client";

import type { JobApplication } from "@/lib/kv";

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
};

export default function TodayFocus({ jobs, onUpdate, completedTaskIds, dismissedTaskIds, onTaskDone, onTaskDismiss }: Props) {
  const allTasks = computeTasks(jobs);
  const tasks = allTasks.filter((t) => !dismissedTaskIds.has(`${t.jobId}:${t.field}`));

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-6 py-4 mb-6">
        <p className="text-sm font-semibold text-emerald-800">
          ✅ All caught up — nothing urgent today!
        </p>
      </div>
    );
  }

  const doneCount = tasks.filter((t) => completedTaskIds.has(`${t.jobId}:${t.field}`)).length;
  const allDone = doneCount === tasks.length;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-stone-50 to-slate-50 border border-stone-200 px-5 py-4 mb-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-stone-800">
          {allDone ? "✅ Day's focus complete!" : "Today's Focus"}
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {doneCount}/{tasks.length} done{allDone ? " — amazing momentum 🎉" : ""}
        </p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
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
      </div>
    </div>
  );
}
