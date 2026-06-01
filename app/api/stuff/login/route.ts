import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, checkPassword } from "@/lib/stuff/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password: string | undefined = body?.password;

  if (!process.env.STUFF_PASSWORD) {
    return NextResponse.json(
      { error: "server misconfigured" },
      { status: 500 }
    );
  }
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, process.env.STUFF_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
