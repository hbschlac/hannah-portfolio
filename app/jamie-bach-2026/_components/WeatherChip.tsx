"use client";

import { colors, fonts } from "@/lib/jamie/brand";
import { useWeather } from "./useWeather";

// Newport, RI 7-day forecast on Open-Meteo (the same data source our useWeather
// hook polls). Used for the "Newport · XX°" chip click-through so guests can
// see the full upcoming forecast.
const NEWPORT_FORECAST_URL =
  "https://open-meteo.com/en/docs?latitude=41.49&longitude=-71.31&hourly=temperature_2m&forecast_days=7";

// Newport, RI climate normals — average high/low and sunny-day fraction for the
// second week of July. Source: NOAA Newport State Airport normals (1991-2020).
export const TYPICAL_JULY_HIGH_F = 76;
export const TYPICAL_JULY_LOW_F = 64;
export const TYPICAL_JULY_SUN_PCT = 60;

export function EventWeatherChip({ date }: { date: string }) {
  const { weather } = useWeather();
  if (!weather) return null;
  if (!weather.inForecastWindow) return null;
  const day = weather.daily[date];
  if (!day) return null;
  return (
    <span
      style={{
        fontFamily: fonts.body,
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: colors.inkSoft,
        fontWeight: 500,
      }}
      title={`${day.label} · wind ${day.windMaxMph} mph · ${day.precipitationChance}% rain`}
    >
      {day.emoji} {day.tempMaxF}° / {day.tempMinF}°
      {day.precipitationChance >= 40 && ` · ${day.precipitationChance}% rain`}
    </span>
  );
}

/**
 * The chip shown next to the countdown on the home page. Always renders a
 * "typical July in Newport" line so guests don't have to guess whether the
 * temp is today's or the trip's. If a current Newport reading is available,
 * we layer it on top.
 */
export function CurrentWeatherChip() {
  const { weather } = useWeather();
  const current = weather?.current;
  return (
    <div
      style={{
        textAlign: "right",
        fontFamily: fonts.body,
        color: colors.inkSoft,
      }}
    >
      {current && (
        <a
          href={NEWPORT_FORECAST_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.ink,
            textDecoration: "none",
            borderBottom: `1px solid ${colors.brass}`,
            paddingBottom: 2,
          }}
          title={`Newport now: ${current.label}. Tap for 7-day forecast.`}
        >
          {current.emoji} Newport now · {current.tempF}°
        </a>
      )}
      <div
        style={{
          marginTop: current ? 6 : 0,
          fontSize: 11,
          letterSpacing: "0.08em",
          color: colors.inkSoft,
        }}
      >
        ☀️ Typical July: {TYPICAL_JULY_HIGH_F}° high · {TYPICAL_JULY_LOW_F}° low
      </div>
    </div>
  );
}

export function MarineCard({ date }: { date: string }) {
  const { weather } = useWeather();
  if (!weather) return null;
  if (!weather.inForecastWindow) {
    return (
      <div
        style={{
          marginTop: 14,
          padding: "12px 0",
          borderTop: `1px solid ${colors.mist}`,
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.inkSoft,
        }}
      >
        🌊 Marine forecast available ~16 days before the trip.
      </div>
    );
  }
  const day = weather.daily[date];
  const sea = weather.marine[date];
  if (!day && !sea) return null;
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 0",
        borderTop: `1px solid ${colors.mist}`,
        fontFamily: fonts.body,
        fontSize: 12,
        color: colors.inkSoft,
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        letterSpacing: "0.04em",
      }}
    >
      <span
        style={{
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: colors.brass,
          fontSize: 11,
        }}
      >
        Marine
      </span>
      {day && (
        <>
          <span>💨 Wind {day.windMaxMph} mph</span>
          <span>{day.emoji} {day.label}</span>
        </>
      )}
      {sea && <span>🌊 Waves {sea.waveHeightMaxFt} ft</span>}
    </div>
  );
}
