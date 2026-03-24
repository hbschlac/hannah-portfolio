import { Redis } from "@upstash/redis";
import { cacheLife, cacheTag } from "next/cache";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
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
