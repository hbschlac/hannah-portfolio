// Date helpers. All trip dates are calendar dates in the destination timezone
// (America/Mazatlan ≈ PDT in August).

export const TZ = "America/Mazatlan";

export function todayInTz(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseISO(d: string): Date {
  return new Date(d + "T12:00:00Z");
}

export function daysBetween(a: string, b: string): number {
  const ms = parseISO(b).getTime() - parseISO(a).getTime();
  return Math.round(ms / 86400000);
}

const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MO = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function weekday(d: string): string {
  return WD[parseISO(d).getUTCDay()];
}

export function shortWeekday(d: string): string {
  return weekday(d).slice(0, 3);
}

export function monthDay(d: string): string {
  const dt = parseISO(d);
  return `${MO[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
}

export type TripStatus =
  | { phase: "before"; daysUntil: number }
  | { phase: "during"; dayIndex: number; totalDays: number }
  | { phase: "after" };

export function tripStatus(start: string, end: string, today: string): TripStatus {
  const toStart = daysBetween(today, start);
  const toEnd = daysBetween(today, end);
  if (toStart > 0) return { phase: "before", daysUntil: toStart };
  if (toEnd < 0) return { phase: "after" };
  return { phase: "during", dayIndex: daysBetween(start, today), totalDays: daysBetween(start, end) };
}
