import { Suspense } from "react";
import { cookies } from "next/headers";
import LoginForm from "@/app/admin/LoginForm";
import { getJobsFromKV } from "@/lib/kv";
import JobTable from "./JobTable";

export const metadata = { title: "Job Tracker — schlacter.me" };

export default function JobTrackerPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <Suspense fallback={null}>
        <JobTrackerContent />
      </Suspense>
    </main>
  );
}

async function JobTrackerContent() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin_session")?.value === "1";

  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">schlacter.me / job tracker</p>
          <LoginForm redirectTo="/job-tracker" />
        </div>
      </div>
    );
  }

  const initialJobs = await getJobsFromKV();
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">schlacter.me</p>
        <h1 className="text-2xl font-semibold text-stone-800">Job Tracker</h1>
        <p className="text-sm text-stone-500 mt-1">Application pipeline</p>
      </div>
      <JobTable initialJobs={initialJobs} />
    </div>
  );
}
