"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { saveIdeas, type SaveResult } from "./actions";
import type { Idea, IdeaCategory } from "@/lib/kv";

const CATEGORIES: IdeaCategory[] = ["Memory", "UI-UX", "API", "Agents", "Tools", "Other"];

function normalizeIdea(idea: Idea & { category: unknown }): Idea {
  return {
    ...idea,
    category: Array.isArray(idea.category)
      ? (idea.category as IdeaCategory[])
      : idea.category
      ? ([idea.category] as IdeaCategory[])
      : [],
  };
}

function newBlankIdea(): Idea {
  return {
    id: crypto.randomUUID(),
    title: "",
    useCase: "",
    category: [],
    status: "Draft",
    priority: 5,
    loe: 5,
    impact: 5,
    problemSize: "",
    successMetrics: "",
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

function riceScore(idea: Idea): number {
  return Math.round((idea.impact * idea.priority) / Math.max(idea.loe, 1));
}

const textareaCls =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-stone-800 rounded px-1.5 py-1 text-stone-800 placeholder:text-stone-300 text-sm resize-none overflow-hidden leading-snug";

const numInputCls =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-stone-800 rounded px-1.5 py-1 text-stone-800 text-sm text-center";

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export default function IdeasTable({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const normalized = (initialIdeas as Array<Idea & { category: unknown }>).map(normalizeIdea);
    return normalized.length ? normalized : [newBlankIdea()];
  });
  const [saveResult, setSaveResult] = useState<SaveResult>({});
  const [isPending, startTransition] = useTransition();
  const tableRef = useRef<HTMLTableElement>(null);

  // Resize all textareas after render
  useEffect(() => {
    if (!tableRef.current) return;
    tableRef.current.querySelectorAll<HTMLTextAreaElement>("textarea").forEach(autoResize);
  }, [ideas.length]);

  function updateIdea(id: string, field: keyof Idea, value: string | number | IdeaCategory[]) {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
    setSaveResult({});
  }

  function toggleCategory(id: string, cat: IdeaCategory, checked: boolean) {
    setIdeas((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next = checked
          ? [...i.category, cat]
          : i.category.filter((c) => c !== cat);
        return { ...i, category: next };
      })
    );
    setSaveResult({});
  }

  function deleteIdea(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    setSaveResult({});
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveIdeas(ideas);
      setSaveResult(result);
    });
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table ref={tableRef} className="w-max min-w-full text-sm border-collapse">
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 200 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 200 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 40 }} />
          </colgroup>
          <thead>
            <tr className="bg-stone-50 text-xs font-medium text-stone-500 uppercase tracking-wider">
              <th className="px-2 py-3 text-center border-b border-stone-200 sticky left-0 z-20 bg-stone-50">#</th>
              <th className="px-2 py-3 text-left border-b border-stone-200 border-r border-r-stone-200 sticky left-[36px] z-20 bg-stone-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">Title</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Use Case</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Category</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">Priority</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">LoE</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">Impact</th>
              <th className="px-2 py-3 text-center border-b border-stone-200">RICE</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Problem Size</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Success Metrics</th>
              <th className="px-2 py-3 text-left border-b border-stone-200">Notes</th>
              <th className="px-2 py-3 border-b border-stone-200" />
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea, idx) => (
              <tr
                key={idea.id}
                className="border-t border-stone-100 hover:bg-stone-50/50 transition-colors"
              >
                {/* # — sticky */}
                <td className="px-2 py-2 text-center text-stone-400 text-xs align-top sticky left-0 z-10 bg-white">
                  {idx + 1}
                </td>

                {/* Title — sticky */}
                <td className="px-1 py-1 align-top sticky left-[36px] z-10 bg-white border-r border-stone-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                  <textarea
                    className={textareaCls}
                    value={idea.title}
                    rows={1}
                    placeholder="Feature name"
                    onChange={(e) => updateIdea(idea.id, "title", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Use Case */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={idea.useCase}
                    rows={1}
                    placeholder="When I'm doing X…"
                    onChange={(e) => updateIdea(idea.id, "useCase", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Category — multi-checkbox */}
                <td className="px-2 py-1.5 align-top">
                  <div className="flex flex-col gap-0.5">
                    {CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700 leading-snug"
                      >
                        <input
                          type="checkbox"
                          checked={idea.category.includes(cat)}
                          onChange={(e) => toggleCategory(idea.id, cat, e.target.checked)}
                          className="accent-stone-800 shrink-0"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </td>

                {/* Priority */}
                <td className="px-1 py-1 align-top">
                  <input
                    className={numInputCls}
                    type="number"
                    min={1}
                    max={10}
                    value={idea.priority}
                    onChange={(e) => updateIdea(idea.id, "priority", Number(e.target.value))}
                  />
                </td>

                {/* LoE */}
                <td className="px-1 py-1 align-top">
                  <input
                    className={numInputCls}
                    type="number"
                    min={1}
                    max={10}
                    value={idea.loe}
                    onChange={(e) => updateIdea(idea.id, "loe", Number(e.target.value))}
                  />
                </td>

                {/* Impact */}
                <td className="px-1 py-1 align-top">
                  <input
                    className={numInputCls}
                    type="number"
                    min={1}
                    max={10}
                    value={idea.impact}
                    onChange={(e) => updateIdea(idea.id, "impact", Number(e.target.value))}
                  />
                </td>

                {/* RICE */}
                <td className="px-2 py-2 text-center font-mono font-semibold text-stone-600 text-sm align-top">
                  {riceScore(idea)}
                </td>

                {/* Problem Size */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={idea.problemSize}
                    rows={1}
                    placeholder="How often / how many"
                    onChange={(e) => updateIdea(idea.id, "problemSize", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Success Metrics */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={idea.successMetrics}
                    rows={1}
                    placeholder="How you'd know it worked"
                    onChange={(e) => updateIdea(idea.id, "successMetrics", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Notes */}
                <td className="px-1 py-1 align-top">
                  <textarea
                    className={textareaCls}
                    value={idea.notes}
                    rows={1}
                    placeholder="Notes"
                    onChange={(e) => updateIdea(idea.id, "notes", e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                  />
                </td>

                {/* Delete */}
                <td className="px-1 py-2 text-center align-top">
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors text-base leading-none"
                    aria-label="Delete row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={() => setIdeas((prev) => [...prev, newBlankIdea()])}
          className="border border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-800 rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + Add row
        </button>
        {saveResult.error && (
          <span className="text-sm text-red-600">{saveResult.error}</span>
        )}
        {saveResult.savedAt && !saveResult.error && (
          <span className="text-sm text-stone-400">
            Saved {new Date(saveResult.savedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
