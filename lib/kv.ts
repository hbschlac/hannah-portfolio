import { Redis } from "@upstash/redis";
import { cacheLife, cacheTag } from "next/cache";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing Redis credentials. Set KV_REST_API_URL and KV_REST_API_TOKEN in environment variables."
    );
  }
  return new Redis({ url, token });
}

export type ResumeEntry = {
  slug: string;
  docId: string;
  label: string;
  createdAt: string;
};

export async function saveResume(entry: ResumeEntry): Promise<void> {
  const redis = getRedis();
  await redis.set(`resume:${entry.slug}`, JSON.stringify(entry));
}

export async function getResume(slug: string): Promise<ResumeEntry | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`resume:${slug}`);

  const redis = getRedis();
  const raw = await redis.get<string>(`resume:${slug}`);
  if (!raw) return null;
  // Upstash may auto-parse JSON
  if (typeof raw === "object") return raw as ResumeEntry;
  return JSON.parse(raw);
}

export async function listResumes(): Promise<ResumeEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("resume-list");

  const redis = getRedis();
  const keys = await redis.keys("resume:*");
  if (!keys.length) return [];
  const values = await redis.mget<string[]>(...keys);
  return values
    .filter(Boolean)
    .map((v) => (typeof v === "object" ? (v as ResumeEntry) : JSON.parse(v!)));
}
