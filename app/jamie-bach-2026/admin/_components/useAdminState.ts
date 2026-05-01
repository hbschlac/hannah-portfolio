"use client";

import { useEffect, useState, useCallback } from "react";
import type { AdminState } from "@/lib/jamie/types";

export function useAdminState() {
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/jamie/admin/state", {
      cache: "no-store",
      headers: { "x-admin-pw": "Admin-July2026" },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: AdminState) => {
        if (!cancelled) setState(data);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { state, error, loading: !state && !error, refresh };
}
