"use server";

import { updateTag } from "next/cache";
import { saveIdeasToKV, type Idea } from "@/lib/kv";

export type SaveResult = { error?: string; savedAt?: string };

export async function saveIdeas(ideas: Idea[]): Promise<SaveResult> {
  if (!Array.isArray(ideas) || ideas.some((i) => !i.id)) {
    return { error: "Invalid data." };
  }
  try {
    await saveIdeasToKV(ideas);
    updateTag("claude-ideas");
    return { savedAt: new Date().toISOString() };
  } catch {
    return { error: "Failed to save. Please try again." };
  }
}
