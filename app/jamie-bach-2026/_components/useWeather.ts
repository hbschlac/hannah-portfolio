"use client";

import { useEffect, useState } from "react";
import type { WeatherBundle } from "@/lib/jamie/weather";

export function useWeather() {
  const [weather, setWeather] = useState<WeatherBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/jamie/weather")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: WeatherBundle) => {
        if (!cancelled) setWeather(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { weather, error };
}
