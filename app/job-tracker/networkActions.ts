"use server";

import { updateTag } from "next/cache";
import { saveNetworkToKV, type NetworkContact } from "@/lib/kv";

export type SaveNetworkResult = { error?: string; savedAt?: string };

export async function saveNetwork(contacts: NetworkContact[]): Promise<SaveNetworkResult> {
  if (!Array.isArray(contacts) || contacts.some((c) => !c.id)) {
    return { error: "Invalid data." };
  }
  try {
    await saveNetworkToKV(contacts);
    updateTag("network");
    return { savedAt: new Date().toISOString() };
  } catch {
    return { error: "Failed to save. Please try again." };
  }
}
