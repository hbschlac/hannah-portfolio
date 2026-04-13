import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getJobsFromKVDirect } from "@/lib/kv";
import type { JobApplication } from "@/lib/kv";

function getColumnId(job: JobApplication): string {
  const stage = job.interviewStage;
  if (stage === "offer" || stage === "rejected") return "closed";
  if (stage === "screening" || stage === "onsite") return "interviewing";
  if (job.applied) return "applied";
  if (job.cvReady) return "ready";
  if (job.outreachDone) return "outreach-cv";
  return "radar";
}

function computeFocusTasks(jobs: JobApplication[]): string[] {
  const tasks: string[] = [];

  for (const j of jobs.filter((j) => j.cvReady && !j.applied)) {
    tasks.push(`Apply to ${j.company}${j.jobUrl ? ` → ${j.jobUrl}` : ""}`);
    if (tasks.length >= 3) break;
  }

  for (const j of jobs.filter((j) => j.priority === "high" && !j.cvReady && !j.applied)) {
    if (tasks.length >= 5) break;
    tasks.push(`Tailor CV for ${j.company}`);
  }

  for (const j of jobs.filter((j) => j.priority === "high" && !j.outreachDone && !j.applied)) {
    if (tasks.length >= 5) break;
    if (tasks.some((t) => t.includes(j.company))) continue;
    tasks.push(`Reach out to someone at ${j.company}`);
  }

  return tasks.slice(0, 5);
}

function buildHtmlEmail(jobs: JobApplication[]): string {
  const ready = jobs.filter((j) => getColumnId(j) === "ready");
  const applied = jobs.filter((j) => getColumnId(j) === "applied");
  const interviewing = jobs.filter((j) => getColumnId(j) === "interviewing");
  const radar = jobs.filter((j) => getColumnId(j) === "radar");
  const tasks = computeFocusTasks(jobs);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let motivation = "";
  if (interviewing.length > 0) {
    motivation = `You're actively interviewing at ${interviewing.length} ${interviewing.length === 1 ? "company" : "companies"} 🔥`;
  } else if (ready.length > 0) {
    motivation = `${ready.length} applications ready to go — let's send them!`;
  } else if (applied.length > 0) {
    motivation = `${applied.length} applications out in the world. Keep the momentum.`;
  } else {
    motivation = `${radar.length} companies on your radar. Time to start moving them forward.`;
  }

  const taskHtml = tasks
    .map(
      (t) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #f5f5f4;">
          <span style="display:inline-block;width:16px;height:16px;border:2px solid #44403c;border-radius:4px;vertical-align:middle;margin-right:10px;"></span>
          <span style="font-size:14px;color:#292524;">${t}</span>
        </td></tr>`
    )
    .join("");

  const readyHtml = ready
    .map(
      (j) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #f5f5f4;">
          <strong style="font-size:13px;color:#292524;">${j.company}</strong>
          <span style="font-size:12px;color:#78716c;margin-left:6px;">${j.role}</span>
          ${j.jobUrl ? `<a href="${j.jobUrl}" style="font-size:11px;color:#57534e;margin-left:8px;text-decoration:underline;">Job link →</a>` : ""}
        </td></tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">

    <!-- Header -->
    <div style="background:#1c1917;padding:24px 28px;">
      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#a8a29e;">schlacter.me / job tracker</p>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;color:#ffffff;">Good morning, Hannah ☀️</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#a8a29e;">${today}</p>
    </div>

    <!-- Momentum banner -->
    <div style="background:#f5f5f4;padding:16px 28px;border-bottom:1px solid #e7e5e4;">
      <p style="margin:0;font-size:14px;color:#44403c;font-style:italic;">${motivation}</p>
    </div>

    <!-- Pipeline stats -->
    <div style="padding:20px 28px;display:flex;gap:24px;border-bottom:1px solid #e7e5e4;">
      <table style="width:100%;border-collapse:collapse;"><tr>
        ${[
          { label: "On Radar", count: radar.length, color: "#78716c" },
          { label: "Ready to Apply", count: ready.length, color: "#d97706" },
          { label: "Applied", count: applied.length, color: "#2563eb" },
          { label: "Interviewing", count: interviewing.length, color: "#7c3aed" },
        ]
          .map(
            ({ label, count, color }) =>
              `<td style="text-align:center;padding:0 12px;">
                <div style="font-size:24px;font-weight:700;color:${color};">${count}</div>
                <div style="font-size:10px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">${label}</div>
              </td>`
          )
          .join("")}
      </tr></table>
    </div>

    <!-- Today's focus -->
    <div style="padding:20px 28px;border-bottom:1px solid #e7e5e4;">
      <h2 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#292524;text-transform:uppercase;letter-spacing:0.08em;">Today's Focus</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${taskHtml || `<tr><td style="padding:8px 12px;color:#a8a29e;font-size:13px;font-style:italic;">Nothing urgent — you're all caught up! ✅</td></tr>`}
      </table>
    </div>

    ${ready.length > 0 ? `
    <!-- Ready to apply -->
    <div style="padding:20px 28px;border-bottom:1px solid #e7e5e4;">
      <h2 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#292524;text-transform:uppercase;letter-spacing:0.08em;">Ready to Apply (${ready.length})</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${readyHtml}
      </table>
    </div>` : ""}

    <!-- Footer -->
    <div style="padding:16px 28px;">
      <p style="margin:0;font-size:11px;color:#a8a29e;">
        Manage your tracker at <a href="https://schlacter.me/job-tracker" style="color:#57534e;">schlacter.me/job-tracker</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  const jobs = await getJobsFromKVDirect();
  const html = buildHtmlEmail(jobs);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "schlacter.me <contact@schlacter.me>",
    to: "hbschlac@gmail.com",
    subject: `Job tracker digest — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send email", detail: error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sentAt: new Date().toISOString() });
}
