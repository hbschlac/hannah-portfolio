import { NextRequest, NextResponse } from "next/server";
import {
  getReservations,
  setReservations,
  appendActivity,
} from "@/lib/jamie/kv";
import type { Reservation } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-pw") === ADMIN_PW;
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    id: string;
    patch: Partial<Reservation>;
    actor: "hannah" | "ellie";
  };
  if (!body.id || !body.patch) {
    return NextResponse.json({ error: "Missing id or patch" }, { status: 400 });
  }

  const list = await getReservations();
  const idx = list.findIndex((r) => r.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const before = list[idx];
  const after = { ...before, ...body.patch };
  list[idx] = after;
  await setReservations(list);

  // describe what changed for the activity log
  const changes: string[] = [];
  for (const key of Object.keys(body.patch) as (keyof Reservation)[]) {
    const b = JSON.stringify(before[key]);
    const a = JSON.stringify(body.patch[key]);
    if (b !== a) changes.push(`${String(key)}: ${b} → ${a}`);
  }
  await appendActivity({
    who: body.actor,
    what: `updated reservation "${after.name}" — ${changes.join(", ")}`,
    when: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, reservation: after });
}
