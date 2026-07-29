"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trip, days } from "@/lib/babymoon/trip";
import { eventsForDay, EventItem } from "@/lib/babymoon/itinerary";
import { todayInTz, tripStatus, monthDay, weekday } from "@/lib/babymoon/dates";
import { eventIcon } from "./ui";

export default function HomeDynamic() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayInTz()), []);

  if (!today) {
    return (
      <div className="card">
        <div className="eyebrow">Countdown</div>
        <p className="sub mt8">Loading…</p>
      </div>
    );
  }

  const status = tripStatus(trip.startDate, trip.endDate, today);

  if (status.phase === "before") {
    return (
      <>
        <div className="card">
          <div className="eyebrow">Countdown</div>
          <div className="count mt8">
            <span className="n">{status.daysUntil}</span>
            <span className="l">{status.daysUntil === 1 ? "day" : "days"} until Cabo ☀️</span>
          </div>
          <p className="sub mt8">
            {weekday(trip.startDate)}, {monthDay(trip.startDate)} — {monthDay(trip.endDate)}, 2026 · {trip.nights} nights
          </p>
        </div>
        <DayGlance date={trip.startDate} label="First up — arrival day" />
      </>
    );
  }

  if (status.phase === "during") {
    const date = days[Math.min(status.dayIndex, days.length - 1)].date;
    return (
      <>
        <div className="card">
          <div className="eyebrow">You&apos;re in Cabo 🌊</div>
          <div className="count mt8">
            <span className="n">{status.dayIndex + 1}</span>
            <span className="l">of {status.totalDays + 1} · {weekday(today)}, {monthDay(today)}</span>
          </div>
        </div>
        <DayGlance date={date} label="Today" />
      </>
    );
  }

  return (
    <div className="card">
      <div className="eyebrow">Welcome home 💛</div>
      <p className="sub mt8">Hope Cabo was everything you needed. This little app will keep the memories handy.</p>
    </div>
  );
}

function DayGlance({ date, label }: { date: string; label: string }) {
  const events = eventsForDay(date).filter((e) => e.kind !== "note");
  return (
    <div className="card">
      <div className="day-head">
        <span className="eyebrow">{label}</span>
        <Link href="/babymoon/itinerary" className="pill teal">
          Full itinerary →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="sub">Open day — nothing booked. Relax at the resort.</p>
      ) : (
        <div className="tl">
          {events.map((e, i) => (
            <GlanceRow key={i} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function GlanceRow({ e }: { e: EventItem }) {
  return (
    <div className="tl-item">
      <div className="tl-time">{e.time || "—"}</div>
      <div className="tl-body">
        <h3>
          <span className="tl-icon">{eventIcon(e.kind)} </span>
          {e.title}
        </h3>
        {e.tentative ? <div className="tl-tags"><span className="pill tentative">Tentative</span></div> : null}
      </div>
    </div>
  );
}
