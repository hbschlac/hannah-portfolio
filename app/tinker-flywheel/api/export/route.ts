import { NextResponse } from "next/server";
import { getRawFeedback } from "@/lib/tinker-flywheel";

export async function GET() {
  try {
    const feedback = await getRawFeedback();
    return NextResponse.json({
      ok: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Export failed", details: String(error) },
      { status: 500 }
    );
  }
}
