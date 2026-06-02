import { NextRequest, NextResponse } from "next/server";
import { getItems, setItems } from "@/lib/stuff/kv";
import { scrapeUrl, summarize } from "@/lib/stuff/scrape";
import type { StuffItem } from "@/lib/stuff/types";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawUrl = body?.url;
  if (!rawUrl || typeof rawUrl !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  const url = normalizeUrl(rawUrl);
  const via: "share" | "email" | "paste" = ["share", "email", "paste"].includes(
    body?.via
  )
    ? body.via
    : "paste";

  // Dedupe by URL so client-side migration and multi-device captures don't
  // create copies. If the URL is already saved, just return the existing item.
  const existingItems = await getItems();
  const dupe = existingItems.find((i) => i.url === url);
  if (dupe) {
    return NextResponse.json({ item: dupe, deduped: true });
  }

  const preview = await scrapeUrl(url);
  const summary = await summarize(preview);

  const item: StuffItem = {
    id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url,
    title:
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : preview.title,
    source: preview.source,
    type: preview.type,
    image: preview.image,
    summary,
    length: preview.length,
    publishedAt: preview.publishedAt,
    savedAt: new Date().toISOString(),
    via,
    status: "inbox",
  };

  await setItems([item, ...existingItems]);

  return NextResponse.json({ item });
}
