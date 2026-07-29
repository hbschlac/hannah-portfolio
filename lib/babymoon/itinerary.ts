import { flights, transfer, reservations, dayNotes, lodging } from "./trip";

export type EventItem = {
  time: string;
  sortTime: number;
  title: string;
  detail?: string;
  kind: "flight" | "transfer" | "lodging" | "dining" | "activity" | "spa" | "note";
  tentative?: boolean;
  conflict?: string;
  confirmation?: string;
  phone?: string;
  address?: string;
  mapQuery?: string;
};

function toMinutes(human: string): number {
  const m = human.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 24 * 60 + 1;
  let h = parseInt(m[1], 10) % 12;
  if (/PM/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}

export function eventsForDay(date: string): EventItem[] {
  const out: EventItem[] = [];

  for (const f of flights) {
    if (f.date !== date) continue;
    out.push({
      time: f.departTime,
      sortTime: toMinutes(f.departTime),
      title: `${f.flightNo} · ${f.fromCode} → ${f.toCode}`,
      detail: `${f.airline} · ${f.fromCity} to ${f.toCity} · lands ${f.arriveTime}. ${f.note ?? ""}`.trim(),
      kind: "flight",
    });
  }

  if (transfer.date === date) {
    out.push({
      time: "After landing",
      sortTime: 12 * 60 + 30,
      title: transfer.name,
      detail: `${transfer.route}. ${transfer.note}`,
      kind: "transfer",
      confirmation: transfer.confirmation,
    });
  }

  if (lodging.checkIn.date === date) {
    out.push({
      time: lodging.checkIn.time,
      sortTime: toMinutes(lodging.checkIn.time),
      title: "Check in — Park Hyatt Cabo Del Sol",
      detail: `${lodging.room}. Confirmation ${lodging.confirmation}.`,
      kind: "lodging",
      mapQuery: lodging.mapQuery,
    });
  }
  if (lodging.checkOut.date === date) {
    out.push({
      time: lodging.checkOut.time,
      sortTime: toMinutes(lodging.checkOut.time),
      title: "Check out — Park Hyatt Cabo Del Sol",
      detail: "Arrange early checkout / bag hold if you need the morning.",
      kind: "lodging",
    });
  }

  for (const r of reservations) {
    if (r.date !== date) continue;
    out.push({
      time: r.time,
      sortTime: toMinutes(r.time),
      title: r.name,
      detail: r.note,
      kind: r.kind,
      tentative: r.tentative,
      conflict: r.conflict,
      confirmation: r.confirmation,
      phone: r.phone,
      address: r.address,
      mapQuery: r.mapQuery,
    });
  }

  for (const n of dayNotes[date] ?? []) {
    out.push({ time: "", sortTime: 24 * 60 + 2, title: n, kind: "note" });
  }

  out.sort((a, b) => a.sortTime - b.sortTime);
  return out;
}
