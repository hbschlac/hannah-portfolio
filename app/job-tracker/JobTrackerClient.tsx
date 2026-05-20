"use client";

import { useState } from "react";
import type { JobApplication, NetworkContact } from "@/lib/kv";
import JobKanban from "./JobKanban";
import JobTable from "./JobTable";
import NetworkTable from "./NetworkTable";

type Props = {
  initialJobs: JobApplication[];
  initialContacts: NetworkContact[];
};

export default function JobTrackerClient({ initialJobs, initialContacts }: Props) {
  const [view, setView] = useState<"kanban" | "table" | "network">("kanban");

  const tabCls = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-md transition-colors ${
      active ? "bg-stone-800 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"
    }`;

  return (
    <div>
      <div className="flex gap-1 mb-5 w-fit rounded-lg border border-stone-200 p-0.5 bg-stone-50">
        <button onClick={() => setView("kanban")} className={tabCls(view === "kanban")}>
          ⬛ Kanban
        </button>
        <button onClick={() => setView("table")} className={tabCls(view === "table")}>
          ≡ Table
        </button>
        <button onClick={() => setView("network")} className={tabCls(view === "network")}>
          ◎ Network
        </button>
      </div>

      {/*
        All three views stay mounted; we toggle visibility instead of
        conditional-rendering. Unmounting on view switch was wiping the
        components' local state (custom to-dos, in-flight network edits,
        unsaved kanban tweaks), forcing a refetch that could return stale
        data and confusing the user when "newest items disappeared."
      */}
      <div className={view === "kanban" ? "" : "hidden"}>
        <JobKanban initialJobs={initialJobs} />
      </div>
      <div className={view === "table" ? "" : "hidden"}>
        <JobTable initialJobs={initialJobs} />
      </div>
      <div className={view === "network" ? "" : "hidden"}>
        <NetworkTable initialContacts={initialContacts} />
      </div>
    </div>
  );
}
