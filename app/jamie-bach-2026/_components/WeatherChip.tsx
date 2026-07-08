"use client";

import { colors, fonts } from "@/lib/jamie/brand";
import { useWeather } from "./useWeather";

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

// Enumerate the YYYY-MM-DD dates from start to end (inclusive), TZ-safe.
function tripDates(startDate: string, endDate: string): string[] {
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const out: string[] = [];
  const cur = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  for (let d = cur; d <= end; d.setDate(d.getDate() + 1)) out.push(fmt(new Date(d)));
  return out;
}

const weekdayLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });

/**
 * The forecast shown next to the countdown on the home page. Once the trip is
 * inside the forecast window, we show the actual Fri→Sun outlook for Newport.
 * Until then, we fall back to the "typical July" climate normals.
 */
export function CurrentWeatherChip({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { weather } = useWeather();
  const days = weather?.inForecastWindow
    ? tripDates(startDate, endDate)
        .map((date) => ({ date, day: weather.daily[date] }))
        .filter((x): x is { date: string; day: NonNullable<typeof x.day> } =>
          Boolean(x.day)
        )
    : [];

  return (
    <div style={{ fontFamily: fonts.body, color: colors.inkSoft }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: colors.brass,
          marginBottom: 8,
        }}
      >
        This weekend in Newport
      </div>
      {days.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {days.map(({ date, day }) => (
            <div
              key={date}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                fontSize: 14,
                color: colors.ink,
              }}
            >
              <span
                style={{
                  minWidth: 36,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                {weekdayLabel(date)}
              </span>
              <span>
                {day.emoji} {day.tempMaxF}° / {day.tempMinF}°
              </span>
              {day.precipitationChance >= 30 && (
                <span style={{ fontSize: 12, color: colors.inkSoft }}>
                  · {day.precipitationChance}% rain
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, letterSpacing: "0.04em" }}>
          ☀️ Typical July in Newport: {TYPICAL_JULY_HIGH_F}° high ·{" "}
          {TYPICAL_JULY_LOW_F}° low
        </div>
      )}
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
