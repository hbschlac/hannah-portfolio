// Newport, RI weather via Open-Meteo (no API key)
// Coords: 41.4901° N, 71.3128° W

const NEWPORT_LAT = 41.4901;
const NEWPORT_LNG = -71.3128;

export type DayForecast = {
  date: string; // YYYY-MM-DD
  tempMaxF: number;
  tempMinF: number;
  precipitationChance: number; // 0-100
  weatherCode: number;
  windMaxMph: number;
  emoji: string;
  label: string;
};

export type MarineForecast = {
  date: string;
  waveHeightMaxFt: number;
  waveDirection: number;
};

export type WeatherBundle = {
  fetchedAt: string;
  inForecastWindow: boolean; // false if trip is too far out
  daily: Record<string, DayForecast>; // keyed by date
  marine: Record<string, MarineForecast>;
  current?: { tempF: number; weatherCode: number; emoji: string; label: string };
};

const WMO: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "clear" },
  1: { emoji: "🌤️", label: "mostly clear" },
  2: { emoji: "⛅", label: "partly cloudy" },
  3: { emoji: "☁️", label: "overcast" },
  45: { emoji: "🌫️", label: "fog" },
  48: { emoji: "🌫️", label: "fog" },
  51: { emoji: "🌦️", label: "drizzle" },
  53: { emoji: "🌦️", label: "drizzle" },
  55: { emoji: "🌦️", label: "drizzle" },
  61: { emoji: "🌧️", label: "rain" },
  63: { emoji: "🌧️", label: "rain" },
  65: { emoji: "🌧️", label: "heavy rain" },
  71: { emoji: "🌨️", label: "snow" },
  80: { emoji: "🌧️", label: "showers" },
  81: { emoji: "⛈️", label: "showers" },
  82: { emoji: "⛈️", label: "heavy showers" },
  95: { emoji: "⛈️", label: "thunder" },
  96: { emoji: "⛈️", label: "thunder + hail" },
  99: { emoji: "⛈️", label: "thunder + hail" },
};

const codeMeta = (code: number) =>
  WMO[code] || { emoji: "🌡️", label: "weather" };

const cToF = (c: number) => c * 9 / 5 + 32;
const kmhToMph = (k: number) => k * 0.621371;
const mToFt = (m: number) => m * 3.281;

export async function fetchNewportWeather(
  startDate: string,
  endDate: string
): Promise<WeatherBundle> {
  const today = new Date().toISOString().slice(0, 10);
  const tripStart = new Date(startDate);
  const now = new Date();
  const daysOut = Math.floor(
    (tripStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const inWindow = daysOut <= 16;

  const fetchStart = inWindow ? startDate : today;
  const fetchEnd = inWindow
    ? endDate
    : new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);

  const baseParams = `latitude=${NEWPORT_LAT}&longitude=${NEWPORT_LNG}&timezone=America%2FNew_York&temperature_unit=fahrenheit&windspeed_unit=mph`;
  const dailyUrl = `https://api.open-meteo.com/v1/forecast?${baseParams}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max&start_date=${fetchStart}&end_date=${fetchEnd}`;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${NEWPORT_LAT}&longitude=${NEWPORT_LNG}&timezone=America%2FNew_York&daily=wave_height_max,wave_direction_dominant&start_date=${fetchStart}&end_date=${fetchEnd}`;

  const daily: Record<string, DayForecast> = {};
  const marine: Record<string, MarineForecast> = {};
  let current: WeatherBundle["current"];

  try {
    const [dRes, mRes] = await Promise.all([
      fetch(dailyUrl, { next: { revalidate: 1800 } }),
      fetch(marineUrl, { next: { revalidate: 1800 } }),
    ]);
    if (dRes.ok) {
      const d = await dRes.json();
      if (d.current_weather) {
        const code = d.current_weather.weathercode;
        const meta = codeMeta(code);
        current = {
          tempF: Math.round(d.current_weather.temperature),
          weatherCode: code,
          emoji: meta.emoji,
          label: meta.label,
        };
      }
      if (d.daily?.time) {
        d.daily.time.forEach((date: string, i: number) => {
          const code = d.daily.weathercode[i];
          const meta = codeMeta(code);
          daily[date] = {
            date,
            tempMaxF: Math.round(d.daily.temperature_2m_max[i]),
            tempMinF: Math.round(d.daily.temperature_2m_min[i]),
            precipitationChance: d.daily.precipitation_probability_max[i] ?? 0,
            weatherCode: code,
            windMaxMph: Math.round(d.daily.windspeed_10m_max[i]),
            emoji: meta.emoji,
            label: meta.label,
          };
        });
      }
    }
    if (mRes.ok) {
      const m = await mRes.json();
      if (m.daily?.time) {
        m.daily.time.forEach((date: string, i: number) => {
          marine[date] = {
            date,
            waveHeightMaxFt: Math.round(mToFt(m.daily.wave_height_max[i]) * 10) / 10,
            waveDirection: m.daily.wave_direction_dominant[i],
          };
        });
      }
    }
  } catch {
    // swallow — return whatever we got
  }

  return {
    fetchedAt: new Date().toISOString(),
    inForecastWindow: inWindow,
    daily,
    marine,
    current,
  };
}
