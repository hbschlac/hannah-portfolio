import { NextResponse } from "next/server";
import { getGuestState } from "@/lib/jamie/kv";

export async function GET() {
  const state = await getGuestState();
  return NextResponse.json(state);
}
