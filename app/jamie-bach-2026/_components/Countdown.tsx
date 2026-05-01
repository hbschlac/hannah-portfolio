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
    const id = setInterval(compute, 1000 * 60 * 60); // hourly
    return () => clearInterval(id);
  }, [targetDate]);

  if (days === null) return null;

  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: "0.8rem",
        letterSpacing: "0.1em",
        color: colors.navy,
        background: colors.lime,
        display: "inline-block",
        padding: "5px 12px",
        borderRadius: "999px",
        border: `2px solid ${colors.navy}`,
        fontWeight: 700,
      }}
    >
      T-MINUS {days} DAYS
    </div>
  );
}
