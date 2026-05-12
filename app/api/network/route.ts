import { revalidateTag } from "next/cache";
import {
  getNetworkFromKVDirect,
  saveNetworkToKV,
  type NetworkContact,
} from "@/lib/kv";

export async function GET(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const provided =
    searchParams.get("secret") ?? request.headers.get("x-sync-secret");
  if (provided !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contacts = await getNetworkFromKVDirect();
  return Response.json({ ok: true, contacts });
}

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) {
    return Response.json({ error: "Server misconfigured." }, { status: 500 });
  }

  let body: {
    secret?: string;
    action?: string;
    contact?: Partial<NetworkContact>;
    contacts?: Partial<NetworkContact>[];
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.secret !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { action } = body;
  if (!action) {
    return Response.json({ error: "action is required." }, { status: 400 });
  }

  const existing = await getNetworkFromKVDirect();
  const now = new Date().toISOString();

  if (action === "create") {
    const c = body.contact;
    if (!c?.name?.trim()) {
      return Response.json({ error: "name is required." }, { status: 400 });
    }
    const newContact: NetworkContact = {
      id: crypto.randomUUID(),
      name: c.name.trim(),
      linkedinUrl: c.linkedinUrl?.trim() ?? "",
      messaged: c.messaged ?? false,
      notes: c.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };
    await saveNetworkToKV([...existing, newContact]);
    revalidateTag("network", "max");
    return Response.json({ ok: true, contact: newContact });
  }

  if (action === "bulkCreate") {
    if (!Array.isArray(body.contacts)) {
      return Response.json({ error: "contacts array is required." }, { status: 400 });
    }
    const existingUrls = new Set(existing.map((c) => c.linkedinUrl));
    const fresh = body.contacts
      .filter((c) => c.name?.trim())
      .filter((c) => !c.linkedinUrl || !existingUrls.has(c.linkedinUrl))
      .map<NetworkContact>((c) => ({
        id: crypto.randomUUID(),
        name: c.name!.trim(),
        linkedinUrl: c.linkedinUrl?.trim() ?? "",
        messaged: c.messaged ?? false,
        notes: c.notes ?? "",
        createdAt: now,
        updatedAt: now,
      }));
    await saveNetworkToKV([...existing, ...fresh]);
    revalidateTag("network", "max");
    return Response.json({ ok: true, added: fresh.length, contacts: fresh });
  }

  if (action === "update") {
    const c = body.contact;
    if (!c?.id) {
      return Response.json({ error: "contact.id is required for update." }, { status: 400 });
    }
    const idx = existing.findIndex((x) => x.id === c.id);
    if (idx === -1) {
      return Response.json({ error: "Contact not found." }, { status: 404 });
    }
    const updated = existing.map((x) =>
      x.id === c.id ? { ...x, ...c, updatedAt: now } : x
    );
    await saveNetworkToKV(updated);
    revalidateTag("network", "max");
    return Response.json({ ok: true, contact: updated[idx] });
  }

  if (action === "delete") {
    const c = body.contact;
    if (!c?.id) {
      return Response.json({ error: "contact.id is required for delete." }, { status: 400 });
    }
    const filtered = existing.filter((x) => x.id !== c.id);
    await saveNetworkToKV(filtered);
    revalidateTag("network", "max");
    return Response.json({ ok: true, deleted: true });
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
