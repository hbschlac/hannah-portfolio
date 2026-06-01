import { NextRequest, NextResponse } from "next/server";
import { getItems, setItems } from "@/lib/stuff/kv";

export async function GET() {
  const items = await getItems();
  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  const status = body?.status;
  if (!id || !["inbox", "read", "saved"].includes(status)) {
    return NextResponse.json(
      { error: "id and a valid status are required" },
      { status: 400 }
    );
  }
  const items = await getItems();
  await setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const items = await getItems();
  await setItems(items.filter((i) => i.id !== id));
  return NextResponse.json({ ok: true });
}
