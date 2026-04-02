import { revalidateTag } from "next/cache";
import { getIdeasFromKVDirect, saveIdeasToKV, type Idea } from "@/lib/kv";

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  let body: { title?: string; notes?: string; secret?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.secret !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const title = body.title?.trim();
  if (!title) {
    return Response.json({ error: "title is required." }, { status: 400 });
  }

  const existing = await getIdeasFromKVDirect();
  const duplicate = existing.some(
    (i) => i.title.trim().toLowerCase() === title.toLowerCase()
  );
  if (duplicate) {
    return Response.json({ ok: true, duplicate: true });
  }

  const newIdea: Idea = {
    id: crypto.randomUUID(),
    title,
    useCase: "",
    category: [],
    status: "Draft",
    priority: 5,
    loe: 5,
    impact: 5,
    problemSize: "",
    successMetrics: "",
    notes: body.notes?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  await saveIdeasToKV([...existing, newIdea]);
  revalidateTag("claude-ideas", "max");

  return Response.json({ ok: true, id: newIdea.id });
}
