import { trip, lodging } from "@/lib/babymoon/trip";
import { weekday, monthDay } from "@/lib/babymoon/dates";
import { MapLink, SectionHead } from "../_components/ui";

export default function Stay() {
  return (
    <main className="app-main">
      <SectionHead title="Where you're staying" />

      <div className="hero" style={{ aspectRatio: "16 / 10", marginTop: 4 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trip.heroImage} alt={lodging.name} />
        <div className="hero-overlay" />
        <div className="hero-text">
          <div className="kicker">Park Hyatt</div>
          <h1 className="serif" style={{ fontSize: 26 }}>
            Cabo Del Sol
          </h1>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <h2>{lodging.name}</h2>
        <div className="sub">{lodging.room}</div>
        <div className="mt12">
          <div className="row-line">
            <span className="k">Check-in</span>
            <span className="v">
              {weekday(lodging.checkIn.date).slice(0, 3)}, {monthDay(lodging.checkIn.date)} · {lodging.checkIn.time}
            </span>
          </div>
          <div className="row-line">
            <span className="k">Check-out</span>
            <span className="v">
              {weekday(lodging.checkOut.date).slice(0, 3)}, {monthDay(lodging.checkOut.date)} · {lodging.checkOut.time}
            </span>
          </div>
          <div className="row-line">
            <span className="k">Confirmation</span>
            <span className="v">#{lodging.confirmation}</span>
          </div>
          <div className="row-line">
            <span className="k">Guest</span>
            <span className="v">{lodging.guest}</span>
          </div>
          <div className="row-line">
            <span className="k">Room</span>
            <span className="v" style={{ maxWidth: 200 }}>
              {lodging.roomDetails}
            </span>
          </div>
        </div>
        <div className="mt12 stack">
          <MapLink query={lodging.mapQuery} label="Open resort in Maps" />
          <a className="btn ghost block" href={`tel:${lodging.phone.replace(/\s/g, "")}`}>
            📞 Call the resort
          </a>
        </div>
        <p className="small muted mt12">{lodging.address}</p>
      </div>

      <div className="card">
        <div className="eyebrow">On-site dining</div>
        <div className="mt8">
          {lodging.dining.map((d) => (
            <div className="row-line" key={d.name}>
              <span className="k" style={{ color: "var(--ink)", fontWeight: 600 }}>
                {d.name}
              </span>
              <span className="v muted" style={{ fontWeight: 400 }}>
                {d.desc}
              </span>
            </div>
          ))}
        </div>
        <p className="small muted mt8">
          Los Cabos&apos; only luxury resort beach club, oceanfront pools, and a full-service spa on property.
        </p>
      </div>
    </main>
  );
}
