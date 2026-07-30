import { flights, transfer } from "@/lib/babymoon/trip";
import { weekday, monthDay } from "@/lib/babymoon/dates";
import { SectionHead } from "../_components/ui";

export default function Travel() {
  return (
    <main className="app-main">
      <SectionHead title="Getting there" subtitle="Flights & airport transfer" />

      {flights.map((f) => (
        <div className="card" key={f.flightNo}>
          <div className="eyebrow">
            {f.label} · {f.airline}
          </div>
          <div
            className="mt12"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{f.fromCode}</div>
              <div className="small muted">{f.departTime}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: 12 }}>✈️ {f.flightNo}</div>
              <div style={{ borderTop: "1px dashed var(--line)", margin: "6px 12px 0" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{f.toCode}</div>
              <div className="small muted">{f.arriveTime}</div>
            </div>
          </div>
          <div className="row-line mt12">
            <span className="k">Date</span>
            <span className="v">
              {weekday(f.date)}, {monthDay(f.date)}
            </span>
          </div>
          <div className="row-line">
            <span className="k">Route</span>
            <span className="v">
              {f.fromCity} → {f.toCity}
            </span>
          </div>
          {f.note ? <p className="small muted mt8">{f.note}</p> : null}
        </div>
      ))}

      <div className="card">
        <div className="eyebrow">{transfer.provider} · Airport transfer</div>
        <h2 className="mt8">{transfer.route}</h2>
        <div className="sub">{transfer.note}</div>
        <div className="mt12">
          <div className="row-line">
            <span className="k">Date</span>
            <span className="v">
              {weekday(transfer.date).slice(0, 3)}, {monthDay(transfer.date)}
            </span>
          </div>
          <div className="row-line">
            <span className="k">Travelers</span>
            <span className="v">{transfer.pax}</span>
          </div>
          <div className="row-line">
            <span className="k">Price</span>
            <span className="v">{transfer.price}</span>
          </div>
          <div className="row-line">
            <span className="k">Booking ref</span>
            <span className="v">{transfer.bookingRef}</span>
          </div>
          <div className="row-line">
            <span className="k">Confirmation</span>
            <span className="v">#{transfer.confirmation}</span>
          </div>
        </div>
      </div>

      <p className="footer-note">Driver tip for a private transfer over 30 min: ~$15–20.</p>
    </main>
  );
}
