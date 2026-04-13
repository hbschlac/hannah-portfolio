"use client";

import { useState } from "react";
import type { JobApplication } from "@/lib/kv";
import JobKanban from "./JobKanban";
import JobTable from "./JobTable";

type Props = {
  initialJobs: JobApplication[];
};

export default function JobTrackerClient({ initialJobs }: Props) {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-1 mb-5 w-fit rounded-lg border border-stone-200 p-0.5 bg-stone-50">
        <button
          onClick={() => setView("kanban")}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            view === "kanban"
              ? "bg-stone-800 text-white shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          ⬛ Kanban
        </button>
        <button
          onClick={() => setView("table")}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            view === "table"
              ? "bg-stone-800 text-white shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          ≡ Table
        </button>
      </div>

      {view === "kanban" ? (
        <JobKanban initialJobs={initialJobs} />
      ) : (
        <JobTable initialJobs={initialJobs} />
      )}
    </div>
  );
}
