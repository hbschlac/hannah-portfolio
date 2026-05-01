"use client";

import { useEffect, useState } from "react";
import type { GuestState } from "@/lib/jamie/types";

export function useGuestState() {
  const [state, setState] = useState<GuestState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/jamie/state", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: GuestState) => {
        if (!cancelled) setState(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { state, error, loading: !state && !error };
}
