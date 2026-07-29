import { NextRequest, NextResponse } from "next/server";
import { BM_COOKIE, BABYMOON_PASSCODE, checkPasscode } from "@/lib/babymoon/auth";

export async function POST(req: NextRequest) {
  let code = "";
  try {
    const body = await req.json();
    code = (body?.code || "").toString().trim();
  } catch {
    code = "";
  }

  if (!checkPasscode(code)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(BM_COOKIE, BABYMOON_PASSCODE, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
