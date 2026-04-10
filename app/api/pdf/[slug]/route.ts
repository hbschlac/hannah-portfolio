import { NextRequest, NextResponse } from "next/server";
import { getResume } from "@/lib/kv";
import { exportDocAsPdf } from "@/lib/google";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const entry = await getResume(slug);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!entry.docId) return NextResponse.json({ error: "No Google Doc linked" }, { status: 400 });

  let pdf: ArrayBuffer;
  try {
    pdf = await exportDocAsPdf(entry.docId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pdf-export] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
    },
  });
}
