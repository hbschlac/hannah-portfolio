import { revalidateTag } from "next/cache";
import { getJobsFromKVDirect, saveJobsToKV, type JobApplication, type JobPriority, type InterviewStage } from "@/lib/kv";

export async function GET(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const provided =
    searchParams.get("secret") ?? request.headers.get("x-sync-secret");
  if (provided !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const jobs = await getJobsFromKVDirect();
  return Response.json({ ok: true, jobs });
}

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  let body: { secret?: string; action?: string; job?: Partial<JobApplication> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.secret !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { action, job } = body;
  if (!action || !job) {
    return Response.json({ error: "action and job are required." }, { status: 400 });
  }

  const existing = await getJobsFromKVDirect();
  const now = new Date().toISOString();

  if (action === "create") {
    if (!job.company?.trim() || !job.role?.trim()) {
      return Response.json({ error: "company and role are required." }, { status: 400 });
    }
    const newJob: JobApplication = {
      id: crypto.randomUUID(),
      company: job.company.trim(),
      role: job.role.trim(),
      jobUrl: job.jobUrl ?? "",
      cvReady: job.cvReady ?? false,
      outreachDone: job.outreachDone ?? false,
      applied: job.applied ?? false,
      notes: job.notes ?? "",
      priority: (job.priority as JobPriority) ?? "medium",
      activeSession: job.activeSession ?? "",
      ...(job.interviewStage && { interviewStage: job.interviewStage as InterviewStage }),
      ...(job.interviewDate && { interviewDate: job.interviewDate }),
      ...(job.interviewNotes && { interviewNotes: job.interviewNotes }),
      createdAt: now,
      updatedAt: now,
    };
    await saveJobsToKV([...existing, newJob]);
    revalidateTag("jobs", "max");
    return Response.json({ ok: true, job: newJob });
  }

  if (action === "update") {
    if (!job.id) {
      return Response.json({ error: "job.id is required for update." }, { status: 400 });
    }
    const idx = existing.findIndex((j) => j.id === job.id);
    if (idx === -1) {
      return Response.json({ error: "Job not found." }, { status: 404 });
    }
    const updated = existing.map((j) =>
      j.id === job.id ? { ...j, ...job, updatedAt: now } : j
    );
    await saveJobsToKV(updated);
    revalidateTag("jobs", "max");
    return Response.json({ ok: true, job: updated[idx] });
  }

  if (action === "delete") {
    if (!job.id) {
      return Response.json({ error: "job.id is required for delete." }, { status: 400 });
    }
    const filtered = existing.filter((j) => j.id !== job.id);
    await saveJobsToKV(filtered);
    revalidateTag("jobs", "max");
    return Response.json({ ok: true, deleted: true });
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
