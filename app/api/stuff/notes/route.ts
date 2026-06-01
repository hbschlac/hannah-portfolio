import { NextRequest, NextResponse } from "next/server";
import { getNotes, setNotes } from "@/lib/stuff/kv";
import type { Note } from "@/lib/stuff/types";

export async function GET() {
  const notes = await getNotes();
  return NextResponse.json({ notes });
}

export async function PUT(req: NextRequest) {
  const note = (await req.json().catch(() => null)) as Note | null;
  if (!note || typeof note.id !== "string") {
    return NextResponse.json(
      { error: "note with an id is required" },
      { status: 400 }
    );
  }
  const notes = await getNotes();
  const exists = notes.some((n) => n.id === note.id);
  const updated = exists
    ? notes.map((n) => (n.id === note.id ? note : n))
    : [note, ...notes];
  await setNotes(updated);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const notes = await getNotes();
  await setNotes(notes.filter((n) => n.id !== id));
  return NextResponse.json({ ok: true });
}
