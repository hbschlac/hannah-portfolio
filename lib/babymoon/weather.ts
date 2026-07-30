// Open-Meteo weather (keyless, CORS-friendly). Fetched client-side.
import { trip } from "./trip";

export type CurrentWeather = { temp: number; code: number; wind: number };
export type DailyWeather = { date: string; code: number; tMax: number; tMin: number; precip: number };
export type WeatherData = { current: CurrentWeather; daily: DailyWeather[] };

export function weatherUrl(): string {
  const { lat, lon } = trip.weather;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: trip.timezone,
    forecast_days: "16",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(weatherUrl());
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = await res.json();
  const current: CurrentWeather = {
    temp: Math.round(j.current.temperature_2m),
    code: j.current.weather_code,
    wind: Math.round(j.current.wind_speed_10m),
  };
  const daily: DailyWeather[] = (j.daily.time as string[]).map((d: string, i: number) => ({
    date: d,
    code: j.daily.weather_code[i],
    tMax: Math.round(j.daily.temperature_2m_max[i]),
    tMin: Math.round(j.daily.temperature_2m_min[i]),
    precip: j.daily.precipitation_probability_max?.[i] ?? 0,
  }));
  return { current, daily };
}

// WMO weather codes → emoji + short label.
export function weatherIcon(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Clear" };
  if (code === 1) return { icon: "🌤️", label: "Mostly sunny" };
  if (code === 2) return { icon: "⛅", label: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", label: "Cloudy" };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Fog" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", label: "Rain" };
  if (code >= 71 && code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Showers" };
  if (code >= 95) return { icon: "⛈️", label: "Thunderstorm" };
  return { icon: "🌡️", label: "—" };
}
