"use client";

import { colors, fonts } from "@/lib/jamie/brand";
import { useWeather } from "./useWeather";

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
      {day.tempMaxF}° / {day.tempMinF}°
      {day.precipitationChance >= 40 && ` · ${day.precipitationChance}% rain`}
    </span>
  );
}

export function CurrentWeatherChip() {
  const { weather } = useWeather();
  if (!weather?.current) return null;
  return (
    <span
      style={{
        fontFamily: fonts.body,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: colors.inkSoft,
      }}
      title={`Newport now: ${weather.current.label}`}
    >
      Newport · {weather.current.tempF}°
    </span>
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
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: 13,
          color: colors.inkSoft,
        }}
      >
        Marine forecast available ~16 days before the trip.
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
          <span>Wind {day.windMaxMph} mph</span>
          <span>{day.label}</span>
        </>
      )}
      {sea && <span>Waves {sea.waveHeightMaxFt} ft</span>}
    </div>
  );
}
