import { Redis } from "@upstash/redis";
import { cacheLife, cacheTag } from "next/cache";
import type { DocBlock } from "@/lib/google";

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
  content?: DocBlock[];
};

export type IdeaCategory = "Memory" | "UI-UX" | "API" | "Agents" | "Tools" | "Other";
export type IdeaStatus = "Draft" | "Active" | "Submitted";

export type Idea = {
  id: string;
  title: string;
  useCase: string;
  category: IdeaCategory[];
  status: IdeaStatus;
  priority: number;
  loe: number;
  impact: number;
  problemSize: string;
  successMetrics: string;
  notes: string;
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

const IDEAS_KEY = "claude-ideas";

export async function getIdeasFromKV(): Promise<Idea[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("claude-ideas");

  const redis = getRedis();
  const raw = await redis.get<string>(IDEAS_KEY);
  if (!raw) return [];
  if (typeof raw === "object") return raw as Idea[];
  return JSON.parse(raw) as Idea[];
}

export async function saveIdeasToKV(ideas: Idea[]): Promise<void> {
  const redis = getRedis();
  await redis.set(IDEAS_KEY, JSON.stringify(ideas));
}

export async function getIdeasFromKVDirect(): Promise<Idea[]> {
  const redis = getRedis();
  const raw = await redis.get<string>(IDEAS_KEY);
  if (!raw) return [];
  if (typeof raw === "object") return raw as Idea[];
  return JSON.parse(raw) as Idea[];
}

export type JobPriority = "high" | "medium" | "low";
export type InterviewStage = "screening" | "onsite" | "offer" | "rejected";
export type CompanyType = "big-tech" | "ai-lab" | "series-c" | "startup" | "other";

export type NoteEntry = {
  text: string;
  date: string; // ISO date string
};

export type Contact = {
  name: string;
  linkedinUrl?: string;
  messaged: boolean;
  dmText?: string;
  dmContext?: string;
};

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  cvReady: boolean;
  outreachDone: boolean;
  applied: boolean;
  notes: string;
  priority: JobPriority;
  activeSession?: string;
  interviewStage?: InterviewStage;
  interviewDate?: string;
  interviewNotes?: string;
  companyType?: CompanyType;
  projectSlug?: string;
  noteLog?: NoteEntry[];
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
};

const JOBS_KEY = "jobs";

export async function getJobsFromKV(): Promise<JobApplication[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("jobs");

  const redis = getRedis();
  const raw = await redis.get<string>(JOBS_KEY);
  if (!raw) return [];
  if (typeof raw === "object") return raw as JobApplication[];
  return JSON.parse(raw) as JobApplication[];
}

export async function getJobsFromKVDirect(): Promise<JobApplication[]> {
  const redis = getRedis();
  const raw = await redis.get<string>(JOBS_KEY);
  if (!raw) return [];
  if (typeof raw === "object") return raw as JobApplication[];
  return JSON.parse(raw) as JobApplication[];
}

export async function saveJobsToKV(jobs: JobApplication[]): Promise<void> {
  const redis = getRedis();
  await redis.set(JOBS_KEY, JSON.stringify(jobs));
}

export type CustomTask = {
  id: string;
  label: string;
  createdAt: string;
};

const CUSTOM_TASKS_KEY = "custom_tasks";

export async function getCustomTasksFromKV(): Promise<CustomTask[]> {
  const redis = getRedis();
  const raw = await redis.get<string>(CUSTOM_TASKS_KEY);
  if (!raw) return [];
  if (typeof raw === "object") return raw as CustomTask[];
  return JSON.parse(raw) as CustomTask[];
}

export async function saveCustomTasksToKV(tasks: CustomTask[]): Promise<void> {
  const redis = getRedis();
  await redis.set(CUSTOM_TASKS_KEY, JSON.stringify(tasks));
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
