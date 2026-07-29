import { trip, lodging } from "@/lib/babymoon/trip";
import { monthDay } from "@/lib/babymoon/dates";
import HomeDynamic from "./_components/HomeDynamic";
import { WeatherNow } from "./_components/Weather";
import { Link } from "./_components/ui";

export default function BabymoonHome() {
  return (
    <main className="app-main">
      <div className="hero">
        {/* Real photo of Park Hyatt Cabo del Sol */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trip.heroImage} alt="Park Hyatt Cabo Del Sol" />
        <div className="hero-overlay" />
        <div className="hero-text">
          <div className="kicker">Hannah &amp; Sam · Babymoon</div>
          <h1 className="serif">Cabo San Lucas</h1>
          <div className="dates">
            {monthDay(trip.startDate)} – {monthDay(trip.endDate)}, 2026
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <HomeDynamic />
      <WeatherNow />

      <div className="card">
        <div className="eyebrow">Where you&apos;re staying</div>
        <h2 className="mt8">{lodging.name}</h2>
        <div className="sub">{lodging.room}</div>
        <div className="mt12" style={{ display: "flex", gap: 8 }}>
          <Link href="/babymoon/stay" className="btn block">
            Hotel details
          </Link>
          <Link href="/babymoon/travel" className="btn ghost block">
            Flights &amp; transfer
          </Link>
        </div>
      </div>

      <p className="footer-note">Made with 💛 for the babymoon.</p>
    </main>
  );
}
