import { google } from "googleapis";
import { cacheLife, cacheTag } from "next/cache";

function getDocsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!email || !key) {
    throw new Error(
      "Missing Google service account credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in your environment."
    );
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/documents.readonly"],
  });

  return google.docs({ version: "v1", auth });
}

export type RichSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  link?: string;
};

export type DocBlock =
  | { type: "name"; spans: RichSpan[] }
  | { type: "section"; spans: RichSpan[] }
  | { type: "entry-title"; spans: RichSpan[] }
  | { type: "meta"; spans: RichSpan[] }
  | { type: "paragraph"; spans: RichSpan[] }
  | { type: "bullet"; spans: RichSpan[]; level: number };

function parseSpans(elements: any[]): RichSpan[] {
  const spans: RichSpan[] = [];
  for (const el of elements) {
    const run = el.textRun;
    if (!run || !run.content || run.content === "\n") continue;
    spans.push({
      text: run.content,
      bold: run.textStyle?.bold ?? false,
      italic: run.textStyle?.italic ?? false,
      link: run.textStyle?.link?.url,
    });
  }
  return spans;
}

function spansText(spans: RichSpan[]): string {
  return spans.map((s) => s.text).join("").trim();
}

export async function fetchGoogleDoc(docId: string): Promise<DocBlock[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`doc:${docId}`);

  const docs = getDocsClient();
  const res = await docs.documents.get({ documentId: docId });
  const content = res.data.body?.content ?? [];

  const blocks: DocBlock[] = [];

  for (const element of content) {
    const para = element.paragraph;
    if (!para) continue;

    const style = para.paragraphStyle?.namedStyleType ?? "NORMAL_TEXT";
    const spans = parseSpans(para.elements ?? []);
    if (!spansText(spans)) continue;

    const bulletInfo = para.bullet;
    const nestingLevel = bulletInfo?.nestingLevel ?? 0;

    if (style === "HEADING_1" || style === "TITLE") {
      blocks.push({ type: "name", spans });
    } else if (style === "HEADING_2") {
      blocks.push({ type: "section", spans });
    } else if (style === "HEADING_3" || style === "HEADING_4") {
      blocks.push({ type: "entry-title", spans });
    } else if (bulletInfo) {
      blocks.push({ type: "bullet", spans, level: nestingLevel });
    } else {
      // Heuristic: all-italic paragraph = meta (dates, locations)
      const allItalic =
        spans.length > 0 && spans.every((s) => s.italic) && !spans.some((s) => s.bold);
      if (allItalic) {
        blocks.push({ type: "meta", spans });
      } else {
        blocks.push({ type: "paragraph", spans });
      }
    }
  }

  return blocks;
}
