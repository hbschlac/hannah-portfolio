"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { saveResume } from "@/lib/kv";

function extractDocId(url: string): string | null {
  // Matches: https://docs.google.com/document/d/DOCID/...
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ActionState = {
  error?: string;
};

export async function loginAdmin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get("password") as string;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { error: "Admin password not configured. Set ADMIN_PASSWORD in environment variables." };
  }

  if (password !== expected) {
    return { error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function createResume(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") {
    return { error: "Not authenticated." };
  }

  const docUrl = (formData.get("docUrl") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();

  if (!docUrl || !rawSlug || !label) {
    return { error: "All fields are required." };
  }

  const docId = extractDocId(docUrl);
  if (!docId) {
    return { error: "Could not extract a document ID from that URL. Make sure it's a valid Google Docs link." };
  }

  const slug = slugify(rawSlug);
  if (!slug) {
    return { error: "Slug is invalid. Use letters, numbers, and hyphens." };
  }

  await saveResume({
    slug,
    docId,
    label,
    createdAt: new Date().toISOString(),
  });

  revalidateTag(`resume:${slug}`, "max");
  revalidateTag("resume-list", "max");
  redirect(`/${slug}`);
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin");
}
