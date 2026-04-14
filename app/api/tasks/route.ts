import { getCustomTasksFromKV, saveCustomTasksToKV, type CustomTask } from "@/lib/kv";

export async function GET() {
  const tasks = await getCustomTasksFromKV();
  return Response.json({ ok: true, tasks });
}

export async function POST(request: Request) {
  let body: { action?: string; id?: string; label?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { action } = body;
  const existing = await getCustomTasksFromKV();

  if (action === "create") {
    if (!body.label?.trim()) {
      return Response.json({ error: "label is required." }, { status: 400 });
    }
    const newTask: CustomTask = {
      id: crypto.randomUUID(),
      label: body.label.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...existing, newTask];
    await saveCustomTasksToKV(updated);
    return Response.json({ ok: true, task: newTask, tasks: updated });
  }

  if (action === "delete") {
    if (!body.id) {
      return Response.json({ error: "id is required." }, { status: 400 });
    }
    const updated = existing.filter((t) => t.id !== body.id);
    await saveCustomTasksToKV(updated);
    return Response.json({ ok: true, tasks: updated });
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
