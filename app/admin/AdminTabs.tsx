"use client";

import { useState } from "react";
import type { ResumeEntry } from "@/lib/kv";
import ResumeDashboard from "./ResumeDashboard";
import CreateResumeForm from "./CreateResumeForm";
import { logoutAdmin } from "@/app/actions";

const tabs = ["Dashboard", "New Resume"] as const;
type Tab = (typeof tabs)[number];

export default function AdminTabs({ resumes }: { resumes: ResumeEntry[] }) {
  const [active, setActive] = useState<Tab>("Dashboard");

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">schlacter.me</p>
          <h1 className="text-2xl font-semibold text-stone-800">Admin</h1>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              active === tab
                ? "bg-stone-800 text-white"
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        {active === "Dashboard" ? (
          <ResumeDashboard resumes={resumes} />
        ) : (
          <CreateResumeForm />
        )}
      </div>
    </div>
  );
}
