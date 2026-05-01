import { NextRequest, NextResponse } from "next/server";
import { getAdminState } from "@/lib/jamie/kv";

const ADMIN_PW = "Admin-July2026";

export async function GET(req: NextRequest) {
  const pw = req.headers.get("x-admin-pw");
  if (pw !== ADMIN_PW) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const state = await getAdminState();
  return NextResponse.json(state);
}
