"use client";

import { useState } from "react";

// A phrase the visitor types into Claude, with a Copy button. `hint` is the part
// they fill in themselves (a job link, a name): it is shown but not copied, so
// the pasted text ends with a space, ready for them to add it.
export function CopyText({ text, hint }: { text: string; hint?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hint ? `${text} ` : text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — the text is still there to select by hand
    }
  };

  return (
    <div className="flex items-stretch gap-2">
      <code
        className="flex-1 min-w-0 rounded-lg border border-border bg-white px-3 py-2 text-[13px] leading-relaxed break-words text-foreground"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
      >
        {text}
        {hint && <span className="text-muted"> ‹{hint}›</span>}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg border border-border px-3 text-xs transition-opacity hover:opacity-70"
        style={{
          background: copied ? "#1A1A1A" : "#F8F6F2",
          color: copied ? "#FFF" : "#1A1A1A",
        }}
        aria-label={`Copy “${text}”`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
