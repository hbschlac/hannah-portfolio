import { NextRequest, NextResponse } from "next/server";
import { getRooms, setRooms, appendActivity } from "@/lib/jamie/kv";
import type { AttendeeId } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

export async function PUT(req: NextRequest) {
  if (req.headers.get("x-admin-pw") !== ADMIN_PW)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    floor: 1 | 2 | 3;
    bed: string;
    attendeeId: AttendeeId | null;
    actor: "hannah" | "ellie";
  };
  const rooms = await getRooms();
  const idx = rooms.assignments.findIndex(
    (a) => a.floor === body.floor && a.bed === body.bed
  );
  if (idx === -1) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  // remove this attendee from any other bed first (one bed each)
  if (body.attendeeId) {
    rooms.assignments = rooms.assignments.map((a) =>
      a.attendeeId === body.attendeeId ? { ...a, attendeeId: null } : a
    );
  }
  rooms.assignments[idx].attendeeId = body.attendeeId;
  await setRooms(rooms);
  await appendActivity({
    who: body.actor,
    what: body.attendeeId
      ? `assigned ${body.attendeeId} to floor ${body.floor} ${body.bed}`
      : `cleared floor ${body.floor} ${body.bed}`,
    when: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
