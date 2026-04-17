"use client";

import { useState } from "react";

export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — user can still select manually
    }
  };

  return (
    <div className="relative">
      <pre
        className="text-xs leading-relaxed whitespace-pre-wrap p-5 pr-20 rounded overflow-x-auto"
        style={{
          background: "#FFF",
          border: "1px solid #E5E1D8",
          color: "#1A1A1A",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {text}
      </pre>
      <button
        onClick={handleCopy}
        type="button"
        className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-70"
        style={{
          background: copied ? "#1A1A1A" : "#F8F6F2",
          color: copied ? "#FFF" : "#1A1A1A",
          border: "1px solid #E5E1D8",
        }}
        aria-label="Copy prompt"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
