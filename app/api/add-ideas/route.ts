import { revalidateTag } from "next/cache";
import { getIdeasFromKVDirect, saveIdeasToKV, type Idea } from "@/lib/kv";

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  let body: { text?: string; secret?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.secret !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  console.log("add-ideas body.text:", JSON.stringify(body.text?.slice(0, 500)));

  if (!body.text?.trim()) {
    return Response.json({ error: "text is required." }, { status: 400 });
  }

  const lines = body.text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (!lines.length) {
    return Response.json({ ok: true, added: 0 });
  }

  const existing = await getIdeasFromKVDirect();
  const existingTitles = new Set(existing.map((i) => i.title.trim().toLowerCase()));

  const newIdeas: Idea[] = lines
    .filter((line) => !existingTitles.has(line.toLowerCase()))
    .map((title) => ({
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
      notes: "",
      createdAt: new Date().toISOString(),
    }));

  if (newIdeas.length) {
    await saveIdeasToKV([...existing, ...newIdeas]);
    revalidateTag("claude-ideas", "max");
  }

  return Response.json({ ok: true, added: newIdeas.length });
}
