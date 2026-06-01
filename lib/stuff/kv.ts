import { Redis } from "@upstash/redis";
import type { StuffItem, Note } from "./types";

const PREFIX = "stuff";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Missing KV credentials");
  return new Redis({ url, token });
}

async function getKey<T>(key: string, fallback: T): Promise<T> {
  const redis = getRedis();
  const raw = await redis.get<string>(`${PREFIX}:${key}`);
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === "object") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setKey<T>(key: string, value: T): Promise<void> {
  const redis = getRedis();
  await redis.set(`${PREFIX}:${key}`, JSON.stringify(value));
}

export async function getItems(): Promise<StuffItem[]> {
  return getKey<StuffItem[]>("items", []);
}

export async function setItems(items: StuffItem[]): Promise<void> {
  await setKey("items", items);
}

export async function getNotes(): Promise<Note[]> {
  return getKey<Note[]>("notes", []);
}

export async function setNotes(notes: Note[]): Promise<void> {
  await setKey("notes", notes);
}
