"use client";

import { useCallback, useEffect, useState } from "react";
import type { FlywheelTheme, FeedbackSource, RawFeedback } from "@/lib/tinker-flywheel";

const SOURCE_LABELS: Record<FeedbackSource, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  "github-issues": "GitHub",
  stackoverflow: "Stack Overflow",
  huggingface: "HF Forums",
  twitter: "X / Twitter",
  curated: "Curated",
};

export function ThemeDrill({ themes }: { themes: FlywheelTheme[] }) {
  const [open, setOpen] = useState<FlywheelTheme | null>(null);
  const max = Math.max(1, ...themes.map((t) => t.frequency));

  return (
    <>
      <div className="space-y-1">
        {[...themes]
          .sort((a, b) => b.frequency - a.frequency)
          .map((theme) => (
            <button
              key={theme.id}
              onClick={() => setOpen(theme)}
              className="w-full flex items-center justify-between py-2 px-2 -mx-2 rounded hover:bg-neutral-100 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    theme.phase === "evaluate" ? "bg-amber-500" : "bg-blue-500"
                  }`}
                />
                <span className="text-sm text-neutral-700 truncate">{theme.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      theme.phase === "evaluate" ? "bg-amber-400" : "bg-blue-400"
                    }`}
                    style={{ width: `${Math.min(100, (theme.frequency / max) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-neutral-400 w-8 text-right">
                  {theme.frequency}
                </span>
                <span className="text-neutral-300 text-xs group-hover:text-neutral-600 transition-colors">
                  →
                </span>
              </div>
            </button>
          ))}
      </div>
      <p className="text-[11px] text-neutral-400 mt-2 italic">
        Click any theme to see the underlying quotes and source links.
      </p>
      {open && <Drawer theme={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Drawer({ theme, onClose }: { theme: FlywheelTheme; onClose: () => void }) {
  const [items, setItems] = useState<RawFeedback[] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/tinker-flywheel/api/feedback?themeId=${encodeURIComponent(theme.id)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setItems(json.data ?? []);
          setCount(json.count ?? 0);
        } else {
          setError(json.error ?? "Failed to load");
        }
      })
      .catch(() => setError("Failed to load"));
  }, [theme.id]);

  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-neutral-200">
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-200">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  theme.phase === "evaluate" ? "bg-amber-500" : "bg-blue-500"
                }`}
              />
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                {theme.phase}
              </span>
            </div>
            <h3 className="text-base font-semibold text-neutral-900 leading-tight">{theme.name}</h3>
            <p className="text-xs text-neutral-500 mt-1">{theme.description}</p>
            {count !== null && (
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {count} matching item{count === 1 ? "" : "s"}
                {count > (items?.length ?? 0) && items ? ` · showing top ${items.length}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-lg leading-none flex-shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!items && !error && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-neutral-100 rounded w-24 mb-2" />
                  <div className="h-4 bg-neutral-100 rounded w-full mb-1" />
                  <div className="h-4 bg-neutral-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {items && items.length === 0 && (
            <p className="text-sm text-neutral-400">No matching items.</p>
          )}
          {items && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-neutral-50 hover:bg-neutral-100 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-neutral-600 normal-case tracking-normal">
                      {SOURCE_LABELS[item.source] ?? item.source}
                    </span>
                    <span>· {item.author || "anon"}</span>
                    <span className="ml-auto">score {item.score}</span>
                  </div>
                  <p className="text-[13px] text-neutral-800 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {item.text}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-2 truncate">↗ {item.url}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function PhaseLegend() {
  return (
    <div className="flex flex-wrap gap-4 mt-3 text-xs text-neutral-500">
      <span className="inline-flex items-start gap-1.5 group relative">
        <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
        <span>
          <span className="font-medium text-neutral-700">Evaluate</span>
          <span className="text-neutral-400">
            {" "}
            — after a run, did it actually get better?
          </span>
        </span>
      </span>
      <span className="inline-flex items-start gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
        <span>
          <span className="font-medium text-neutral-700">Iterate</span>
          <span className="text-neutral-400">
            {" "}
            — between runs, what do I train next?
          </span>
        </span>
      </span>
    </div>
  );
}

export function UserDefinition() {
  return (
    <details className="mt-4 group">
      <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 inline-flex items-center gap-1 list-none">
        <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
        Who&apos;s the developer in this data?
      </summary>
      <p className="text-xs text-neutral-500 mt-2 leading-relaxed pl-4 border-l-2 border-neutral-200">
        ML engineers and researchers fine-tuning open-weight models (Llama, Qwen, Gemma, Mistral) on
        their own data — using Tinker, Axolotl, Unsloth, or raw Hugging Face transformers. They ship
        trained models into production apps, research projects, or internal tools. They&apos;re the
        exact developer Tinker&apos;s API targets: fluent enough to run a fine-tune, but without a
        team to build eval and iteration infrastructure for them.
      </p>
    </details>
  );
}
