"use client";

import { useEffect } from "react";

/**
 * Auto-triggers the print dialog once the page is fully loaded.
 * User can dismiss the dialog and read the page on screen if they prefer.
 */
export function PrintTrigger() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoprint") === "1") {
      // small delay so fonts / layout are settled
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, []);
  return null;
}

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 print:hidden"
    >
      Print / Save as PDF ↓
    </button>
  );
}
