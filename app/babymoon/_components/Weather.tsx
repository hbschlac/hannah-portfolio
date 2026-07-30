"use client";

import { useEffect, useState } from "react";
import { fetchWeather, weatherIcon, WeatherData } from "@/lib/babymoon/weather";
import { trip } from "@/lib/babymoon/trip";
import { shortWeekday } from "@/lib/babymoon/dates";

function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let ok = true;
    fetchWeather()
      .then((d) => ok && setData(d))
      .catch(() => ok && setError(true));
    return () => {
      ok = false;
    };
  }, []);
  return { data, error };
}

function inTrip(date: string) {
  return date >= trip.startDate && date <= trip.endDate;
}

export function WeatherNow() {
  const { data, error } = useWeather();

  if (error)
    return (
      <div className="card">
        <div className="eyebrow">Weather · {trip.weather.label}</div>
        <p className="sub mt8">Couldn&apos;t load the forecast right now.</p>
      </div>
    );

  if (!data)
    return (
      <div className="card">
        <div className="eyebrow">Weather · {trip.weather.label}</div>
        <p className="sub mt8">Loading forecast…</p>
      </div>
    );

  const now = weatherIcon(data.current.code);
  const week = data.daily.slice(0, 10);

  return (
    <div className="card">
      <div className="eyebrow">Weather · {trip.weather.label}</div>
      <div className="wx-now mt12">
        <div className="big">{now.icon}</div>
        <div>
          <div className="temp">{data.current.temp}°</div>
          <div className="meta">
            {now.label} · wind {data.current.wind} mph
          </div>
        </div>
      </div>
      <div className="wx-week mt12">
        {week.map((d) => {
          const wi = weatherIcon(d.code);
          return (
            <div key={d.date} className={"wx-day" + (inTrip(d.date) ? " trip" : "")}>
              <div className="d">{shortWeekday(d.date)}</div>
              <div className="i">{wi.icon}</div>
              <div className="hi">{d.tMax}°</div>
              <div className="lo">{d.tMin}°</div>
              {d.precip >= 30 ? <div className="pp">💧{d.precip}%</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeatherFull() {
  const { data, error } = useWeather();

  if (error) return <p className="sub">Couldn&apos;t load the forecast right now. Check back later.</p>;
  if (!data) return <p className="sub">Loading forecast…</p>;

  const tripDays = data.daily.filter((d) => inTrip(d.date));
  const list = tripDays.length ? tripDays : data.daily.slice(0, 7);

  return (
    <div>
      {list.map((d) => {
        const wi = weatherIcon(d.code);
        return (
          <div className="row-line" key={d.date}>
            <span className="k">
              {shortWeekday(d.date)} · {wi.icon} {wi.label}
            </span>
            <span className="v">
              {d.tMax}° / {d.tMin}°{d.precip >= 20 ? `  ·  💧${d.precip}%` : ""}
            </span>
          </div>
        );
      })}
      {!tripDays.length ? (
        <p className="sub mt8">
          Trip dates are outside the 16-day forecast window — full daily weather will appear closer to departure.
        </p>
      ) : null}
    </div>
  );
}

export function DayWeather({ date }: { date: string }) {
  const { data } = useWeather();
  if (!data) return null;
  const d = data.daily.find((x) => x.date === date);
  if (!d) return null;
  const wi = weatherIcon(d.code);
  return (
    <span className="wx">
      {wi.icon} {d.tMax}°/{d.tMin}°
    </span>
  );
}
