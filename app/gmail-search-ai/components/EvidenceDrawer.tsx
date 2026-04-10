"use client";

import { useState, useEffect } from "react";
import type { Hypothesis } from "@/lib/gmail-action";

type FeedbackItem = {
  id: string;
  text: string;
  url: string;
  author: string;
  subreddit: string;
  score: number;
  date: string;
};

export function EvidenceDrawer({
  hypothesis,
  onClose,
}: {
  hypothesis: Hypothesis | null;
  onClose: () => void;
}) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!hypothesis) return;
    setLoading(true);
    setItems([]);
    fetch(`/gmail-search-ai/api/feedback?hypothesisId=${hypothesis.id}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hypothesis?.id]);

  if (!hypothesis) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-white mb-2"
              style={{ background: hypothesis.color }}
            >
              {hypothesis.icon} {hypothesis.id}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{hypothesis.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{total} posts matched</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4 mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No posts matched this hypothesis yet.</div>
          )}

          {!loading &&
            items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-gray-100 p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{item.text}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span className="font-medium text-gray-500">r/{item.subreddit}</span>
                  <span>·</span>
                  <span>u/{item.author}</span>
                  <span>·</span>
                  <span>{item.score > 0 ? `↑${item.score.toLocaleString()}` : "—"}</span>
                  <span className="ml-auto group-hover:text-blue-500 transition-colors">↗ View post</span>
                </div>
              </a>
            ))}
        </div>
      </div>
    </>
  );
}
