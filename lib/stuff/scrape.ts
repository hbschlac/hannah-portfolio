import Anthropic from "@anthropic-ai/sdk";
import type { ItemType } from "./types";

export type Preview = {
  title: string;
  source: string;
  image?: string;
  description?: string;
  type: ItemType;
  length: string;
  publishedAt?: string; // ISO
};

function detectType(host: string): ItemType {
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(host)) return "video";
  if (
    /overcast\.fm|spotify\.com\/episode|podcasts\.apple\.com|pca\.st|castro\.fm/.test(
      host
    )
  )
    return "podcast";
  return "article";
}

function matchOg(html: string, prop: string): string | undefined {
  const re1 = new RegExp(
    `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`,
    "i"
  );
  const re3 = new RegExp(
    `<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  return (
    html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? html.match(re3)?.[1]
  );
}

// Extract a published date from common OG / schema patterns. Returns ISO or undefined.
function extractPublished(html: string): string | undefined {
  const candidates = [
    matchOg(html, "article:published_time"),
    matchOg(html, "og:article:published_time"),
    matchOg(html, "og:pubdate"),
    matchOg(html, "pubdate"),
    matchOg(html, "date"),
    matchOg(html, "DC.date.issued"),
    html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1],
    // JSON-LD: look for the first "datePublished":"..."
    html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1],
  ].filter((x): x is string => !!x);

  for (const raw of candidates) {
    const t = Date.parse(raw);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
  }
  return undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'");
}

export async function scrapeUrl(url: string): Promise<Preview> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      title: "link",
      source: "link",
      type: "article",
      length: "—",
    };
  }
  const source = parsed.hostname.replace(/^www\./, "");
  const type = detectType(parsed.hostname);
  const fallback: Preview = {
    title: source,
    source,
    type,
    length: "—",
  };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; StuffBot/1.0; +https://schlacter.me/stuff)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return fallback;
    const html = (await res.text()).slice(0, 200_000); // cap to be safe

    const ogTitle = matchOg(html, "og:title");
    const titleTag = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const title = decodeEntities((ogTitle || titleTag || source).trim());
    const image = matchOg(html, "og:image");
    const description = matchOg(html, "og:description")
      ? decodeEntities(matchOg(html, "og:description")!.trim())
      : undefined;
    const siteName = matchOg(html, "og:site_name") || source;

    return {
      title,
      source: siteName,
      image,
      description,
      type,
      length: "—",
      publishedAt: extractPublished(html),
    };
  } catch {
    return fallback;
  }
}

export async function summarize(preview: Preview): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  // Graceful fallback if no key configured: use OG description.
  if (!key) return preview.description || "";

  const client = new Anthropic({ apiKey: key });
  const input = [
    `Title: ${preview.title}`,
    `Source: ${preview.source}`,
    preview.description ? `Description: ${preview.description}` : null,
    `Type: ${preview.type}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system:
        "You write a 1-2 sentence preview for a personal read-later app. Use the article metadata to describe what the piece is actually about. Be concrete and crisp. No filler. Do not start with 'This article…' or 'In this post…'.",
      messages: [{ role: "user", content: input }],
    });
    const text = msg.content
      .filter(
        (b): b is Anthropic.Messages.TextBlock => b.type === "text"
      )
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || preview.description || "";
  } catch {
    return preview.description || "";
  }
}
