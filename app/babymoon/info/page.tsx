import { info, reservations } from "@/lib/babymoon/trip";
import { SectionHead } from "../_components/ui";
import { WeatherFull } from "../_components/Weather";

export default function Info() {
  const confirmations = reservations.filter((r) => r.confirmation);
  return (
    <main className="app-main">
      <SectionHead title="Good to know" subtitle="Weather, tips & essentials" />

      <div className="card">
        <div className="eyebrow">Forecast · trip week</div>
        <div className="mt8">
          <WeatherFull />
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">{info.packing.title}</div>
        <div className="mt8">
          {info.packing.items.map((it) => (
            <div className="row-line" key={it}>
              <span className="k" style={{ color: "var(--ink)" }}>
                ☐ {it}
              </span>
              <span className="v" />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">{info.tipping.title}</div>
        <div className="mt8">
          {info.tipping.rows.map(([k, v]) => (
            <div className="row-line" key={k}>
              <span className="k" style={{ maxWidth: 190, color: "var(--ink)" }}>
                {k}
              </span>
              <span className="v">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">{info.recommendations.title}</div>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, listStyleType: "disc" }}>
          {info.recommendations.lines.map((l) => (
            <li key={l} style={{ marginBottom: 6, fontSize: 14 }}>
              {l}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="eyebrow">{info.currency.title}</div>
        <div className="mt8 stack">
          {info.currency.lines.map((l) => (
            <p key={l} style={{ margin: 0, fontSize: 14 }} className="muted">
              {l}
            </p>
          ))}
        </div>
      </div>

      {confirmations.length ? (
        <div className="card">
          <div className="eyebrow">Confirmation numbers</div>
          <div className="mt8">
            {confirmations.map((r) => (
              <div className="row-line" key={r.name}>
                <span className="k" style={{ color: "var(--ink)" }}>
                  {r.name}
                </span>
                <span className="v">#{r.confirmation}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="eyebrow">{info.emergency.title}</div>
        <div className="mt8 stack">
          {info.emergency.lines.map((l) => (
            <p key={l} style={{ margin: 0, fontSize: 14 }}>
              {l}
            </p>
          ))}
        </div>
      </div>

      <p className="footer-note">Have the best time. 🌅</p>
    </main>
  );
}
