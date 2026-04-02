import { NextRequest, NextResponse } from "next/server";
import { saveResume } from "@/lib/kv";
import type { DocBlock } from "@/lib/google";

// One-time seed route protected by SYNC_SECRET.
// Called after deploy to write inline resume content directly to Redis.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { slug, label, content } = body as {
    slug: string;
    label: string;
    content: DocBlock[];
  };

  if (!slug || !label || !content?.length) {
    return NextResponse.json({ error: "Missing slug, label, or content" }, { status: 400 });
  }

  await saveResume({
    slug,
    docId: "",
    label,
    createdAt: new Date().toISOString(),
    content,
  });

  return NextResponse.json({ ok: true, slug, blocks: content.length });
}
