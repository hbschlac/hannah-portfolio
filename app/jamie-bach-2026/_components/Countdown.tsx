"use client";

import { useEffect, useState } from "react";
import { colors, fonts } from "@/lib/jamie/brand";

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const target = new Date(targetDate + "T00:00:00").getTime();
      const now = Date.now();
      const d = Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
      setDays(d);
    };
    compute();
    const id = setInterval(compute, 1000 * 60 * 60);
    return () => clearInterval(id);
  }, [targetDate]);

  if (days === null) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 10,
        color: colors.ink,
        fontFamily: fonts.body,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: colors.brass,
        }}
      >
        Countdown
      </span>
      <span
        style={{
          fontFamily: fonts.display,
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: "-0.005em",
        }}
      >
        {days} {days === 1 ? "day" : "days"}
      </span>
    </div>
  );
}
