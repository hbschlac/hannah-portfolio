"use server";

import { updateTag } from "next/cache";
import { saveJobsToKV, type JobApplication } from "@/lib/kv";

export type SaveJobsResult = { error?: string; savedAt?: string };

export async function saveJobs(jobs: JobApplication[]): Promise<SaveJobsResult> {
  if (!Array.isArray(jobs) || jobs.some((j) => !j.id)) {
    return { error: "Invalid data." };
  }
  try {
    await saveJobsToKV(jobs);
    updateTag("jobs");
    return { savedAt: new Date().toISOString() };
  } catch {
    return { error: "Failed to save. Please try again." };
  }
}
