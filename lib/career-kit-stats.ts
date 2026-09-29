import { getRedis } from "@/lib/kv";

// First-party counts for the /career-kit share page, read on /admin. No names, emails or IPs:
// a visitor is a random id their browser made, and a share code is the first 8 characters of it.
export const KIT_EVENTS = ["view", "share", "copy_kit", "step", "setup_done"] as const;
export type KitEvent = (typeof KIT_EVENTS)[number];

export type KitHit = {
  event: KitEvent;
  vid?: string; // visitor id
  via?: string; // share code of whoever sent them the link
  ref?: string; // ?ref= tag Hannah adds to a link she posts
  src?: string; // referring site's host
  step?: number; // setup step 1-5, for "step"
};

const ID = /^[a-z0-9]{8,24}$/;
const CODE = /^[a-z0-9]{6,12}$/;
const TAG = /^[a-z0-9_-]{1,32}$/i;
const HOST = /^[a-z0-9.-]{1,64}$/i;
const DAY_TTL = 60 * 60 * 24 * 400;
// Preview deployments and local dev write to their own keys so testing never touches the real numbers.
const NS = process.env.VERCEL_ENV === "production" ? "ck" : `ck-${process.env.VERCEL_ENV ?? "dev"}`;

const day = (d = new Date()) => d.toISOString().slice(0, 10);

// Keeps only well-formed fields, so the store never holds free text from the internet.
export function cleanHit(raw: unknown): KitHit | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const event = KIT_EVENTS.find((e) => e === r.event);
  if (!event) return null;
  const pick = (v: unknown, re: RegExp) => (typeof v === "string" && re.test(v) ? v : undefined);
  const step = typeof r.step === "number" && r.step >= 1 && r.step <= 5 ? Math.floor(r.step) : undefined;
  if (event === "step" && !step) return null;
  return {
    event,
    vid: pick(r.vid, ID),
    via: pick(r.via, CODE),
    ref: pick(r.ref, TAG)?.toLowerCase(),
    src: pick(r.src, HOST)?.toLowerCase().replace(/^www\./, ""),
    step,
  };
}

export async function recordKitHit(hit: KitHit): Promise<void> {
  const redis = getRedis();
  const name = hit.event === "step" ? `step${hit.step}` : hit.event;
  const today = `${NS}:d:${day()}`;
  const p = redis.pipeline();
  p.incr(`${NS}:n:${name}`);
  p.hincrby(today, name, 1);
  p.expire(today, DAY_TTL);
  if (hit.vid) p.sadd(`${NS}:u:${name}`, hit.vid);
  if (hit.via) {
    p.incr(`${NS}:via:n:${name}`);
    if (hit.vid) p.sadd(`${NS}:via:u:${name}`, hit.vid);
  }
  if (hit.event === "view") {
    if (hit.ref) p.hincrby(`${NS}:ref`, hit.ref, 1);
    p.hincrby(`${NS}:src`, hit.src || "direct", 1);
  }
  await p.exec();
}

export type KitStats = {
  totals: Record<string, number>;
  people: Record<string, number>;
  viaShare: { views: number; viewers: number; copies: number; copiers: number };
  days: { date: string; view: number; share: number; copy_kit: number; setup_done: number }[];
  refs: [string, number][];
  sources: [string, number][];
};

const NAMES = ["view", "share", "copy_kit", "step1", "step2", "step3", "step4", "step5", "setup_done"];

export async function getKitStats(days = 14): Promise<KitStats> {
  const redis = getRedis();
  const dates = Array.from({ length: days }, (_, i) => day(new Date(Date.now() - i * 86_400_000)));
  const p = redis.pipeline();
  NAMES.forEach((n) => p.get(`${NS}:n:${n}`));
  NAMES.forEach((n) => p.scard(`${NS}:u:${n}`));
  p.get(`${NS}:via:n:view`);
  p.scard(`${NS}:via:u:view`);
  p.get(`${NS}:via:n:copy_kit`);
  p.scard(`${NS}:via:u:copy_kit`);
  dates.forEach((d) => p.hgetall(`${NS}:d:${d}`));
  p.hgetall(`${NS}:ref`);
  p.hgetall(`${NS}:src`);
  const r = (await p.exec()) as unknown[];

  const num = (v: unknown) => Number(v ?? 0) || 0;
  const totals: Record<string, number> = {};
  const people: Record<string, number> = {};
  NAMES.forEach((n, i) => {
    totals[n] = num(r[i]);
    people[n] = num(r[NAMES.length + i]);
  });
  let i = NAMES.length * 2;
  const viaShare = { views: num(r[i++]), viewers: num(r[i++]), copies: num(r[i++]), copiers: num(r[i++]) };
  const dayRows = dates.map((date) => {
    const h = (r[i++] ?? {}) as Record<string, unknown>;
    return { date, view: num(h.view), share: num(h.share), copy_kit: num(h.copy_kit), setup_done: num(h.setup_done) };
  });
  const sorted = (h: unknown) =>
    Object.entries((h ?? {}) as Record<string, unknown>)
      .map(([k, v]) => [k, num(v)] as [string, number])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  const refs = sorted(r[i++]);
  const sources = sorted(r[i++]);
  return { totals, people, viaShare, days: dayRows, refs, sources };
}
