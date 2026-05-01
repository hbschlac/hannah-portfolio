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
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        background: colors.lavender,
        border: `2px solid ${colors.navy}`,
        borderRadius: 999,
        fontSize: "0.75rem",
        fontFamily: fonts.mono,
        fontWeight: 700,
        color: colors.navy,
      }}
      title={`${day.label} · wind ${day.windMaxMph} mph · ${day.precipitationChance}% rain`}
    >
      {day.emoji} {day.tempMaxF}°/{day.tempMinF}°
      {day.precipitationChance >= 40 && (
        <span style={{ marginLeft: 4 }}>💧 {day.precipitationChance}%</span>
      )}
    </span>
  );
}

export function CurrentWeatherChip() {
  const { weather } = useWeather();
  if (!weather?.current) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        background: "#fff",
        border: `2px solid ${colors.navy}`,
        borderRadius: 999,
        fontSize: "0.75rem",
        fontFamily: fonts.mono,
        fontWeight: 700,
        color: colors.navy,
        boxShadow: "2px 2px 0 #1F2A44",
      }}
      title={`Newport now: ${weather.current.label}`}
    >
      {weather.current.emoji} newport · {weather.current.tempF}°
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
          marginTop: 10,
          padding: "10px 12px",
          background: colors.lavender,
          border: `2px solid ${colors.navy}`,
          borderRadius: 10,
          fontSize: "0.82rem",
          fontFamily: fonts.script,
        }}
      >
        🌊 marine forecast available ~16 days before the trip
      </div>
    );
  }
  const day = weather.daily[date];
  const sea = weather.marine[date];
  if (!day && !sea) return null;
  return (
    <div
      style={{
        marginTop: 10,
        padding: "10px 12px",
        background: colors.lavender,
        border: `2px solid ${colors.navy}`,
        borderRadius: 10,
        fontSize: "0.82rem",
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <strong style={{ fontFamily: fonts.body, fontSize: "0.85rem" }}>
        🌊 marine
      </strong>
      {day && (
        <>
          <span>💨 wind {day.windMaxMph} mph</span>
          <span>{day.emoji} {day.label}</span>
        </>
      )}
      {sea && <span>🌊 waves {sea.waveHeightMaxFt} ft</span>}
    </div>
  );
}
