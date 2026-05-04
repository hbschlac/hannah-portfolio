import { NextRequest, NextResponse } from "next/server";
import { getFlights, setFlights, appendActivity } from "@/lib/jamie/kv";
import type { Flight } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

export async function PUT(req: NextRequest) {
  if (req.headers.get("x-admin-pw") !== ADMIN_PW)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { attendeeId: string; patch: Partial<Flight>; actor: "hannah" | "ellie" };
  const flights = await getFlights();
  const before = flights[body.attendeeId] || { attendeeId: body.attendeeId as Flight["attendeeId"], status: "tbd" };
  const after: Flight = { ...before, ...body.patch };
  flights[body.attendeeId] = after;
  await setFlights(flights);
  await appendActivity({
    who: body.actor,
    what: `updated flight for ${body.attendeeId}`,
    when: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, flight: after });
}
