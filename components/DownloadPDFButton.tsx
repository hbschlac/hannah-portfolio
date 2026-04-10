"use client";

import { useState } from "react";

export default function DownloadPDFButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf/${slug}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="fixed top-4 right-4 px-3 py-1.5 text-xs text-muted border border-border rounded hover:text-foreground hover:border-foreground transition-colors bg-white/90 backdrop-blur-sm disabled:opacity-50"
    >
      {loading ? "Downloading…" : "Download as PDF"}
    </button>
  );
}
