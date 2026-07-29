import { days } from "@/lib/babymoon/trip";
import { eventsForDay, EventItem } from "@/lib/babymoon/itinerary";
import { weekday, monthDay } from "@/lib/babymoon/dates";
import { eventIcon, mapsHref, SectionHead } from "../_components/ui";
import { DayWeather } from "../_components/Weather";

export default function Itinerary() {
  return (
    <main className="app-main">
      <SectionHead title="Itinerary" subtitle="Day by day — flights, stays, meals & plans" />
      {days.map((d, i) => (
        <DayCard key={d.date} date={d.date} title={d.title} index={i} />
      ))}
      <p className="footer-note">Times pulled from your booking confirmations. Tap ⚠️ items to reconcile.</p>
    </main>
  );
}

function DayCard({ date, title, index }: { date: string; title: string; index: number }) {
  const events = eventsForDay(date);
  return (
    <div className="card">
      <div className="day-head">
        <span className="dnum">Day {index + 1}</span>
        <DayWeather date={date} />
      </div>
      <h2 className="serif">{title}</h2>
      <div className="sub">
        {weekday(date)}, {monthDay(date)}
      </div>
      <div className="tl mt12">
        {events.length === 0 ? (
          <p className="sub">Open day — nothing booked yet.</p>
        ) : (
          events.map((e, i) => <EventRow key={i} e={e} />)
        )}
      </div>
    </div>
  );
}

function EventRow({ e }: { e: EventItem }) {
  if (e.kind === "note") {
    return (
      <div className="tl-item">
        <div className="tl-time">·</div>
        <div className="tl-body">
          <p style={{ margin: 0 }}>{e.title}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="tl-item">
      <div className="tl-time">{e.time || "—"}</div>
      <div className="tl-body">
        <h3>
          <span className="tl-icon">{eventIcon(e.kind)} </span>
          {e.title}
        </h3>
        {e.detail ? <p>{e.detail}</p> : null}
        {e.address ? <p>📍 {e.address}</p> : null}
        <div className="tl-tags">
          {e.tentative ? <span className="pill tentative">Tentative</span> : null}
          {e.confirmation ? <span className="pill">Conf #{e.confirmation}</span> : null}
          {e.phone ? (
            <a className="pill" href={`tel:${e.phone.replace(/\s/g, "")}`}>
              📞 {e.phone}
            </a>
          ) : null}
          {e.mapQuery ? (
            <a className="pill" href={mapsHref(e.mapQuery)} target="_blank" rel="noreferrer">
              📍 Map
            </a>
          ) : null}
        </div>
        {e.conflict ? (
          <div className="tl-tags">
            <span className="pill conflict">⚠️ {e.conflict}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
