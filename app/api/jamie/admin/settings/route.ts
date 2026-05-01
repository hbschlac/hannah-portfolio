import { NextRequest, NextResponse } from "next/server";
import {
  setPhotosUrl,
  setGroupChatUrl,
  setExpenses,
  getExpenses,
  appendActivity,
} from "@/lib/jamie/kv";

const ADMIN_PW = "Admin-July2026";

export async function PUT(req: NextRequest) {
  if (req.headers.get("x-admin-pw") !== ADMIN_PW) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    photosUrl?: string;
    groupChatUrl?: string;
    splitwiseUrl?: string;
    actor: "hannah" | "ellie";
  };

  const changes: string[] = [];

  if (body.photosUrl !== undefined) {
    await setPhotosUrl(body.photosUrl);
    changes.push("photos url");
  }
  if (body.groupChatUrl !== undefined) {
    await setGroupChatUrl(body.groupChatUrl);
    changes.push("group chat url");
  }
  if (body.splitwiseUrl !== undefined) {
    const expenses = await getExpenses();
    await setExpenses({ ...expenses, splitwiseUrl: body.splitwiseUrl });
    changes.push("splitwise url");
  }

  if (changes.length) {
    await appendActivity({
      who: body.actor,
      what: `updated settings — ${changes.join(", ")}`,
      when: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, changed: changes });
}
