"use client";

import { useState } from "react";
import type { ResumeEntry } from "@/lib/kv";

export default function ResumeDashboard({ resumes }: { resumes: ResumeEntry[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const sorted = [...resumes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function copyUrl(slug: string) {
    navigator.clipboard.writeText(`https://schlacter.me/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-12">
        No resumes yet. Create one using the &ldquo;New Resume&rdquo; tab.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-400">
            <th className="pb-3 pr-4 font-medium">Company / Role</th>
            <th className="pb-3 pr-4 font-medium">URL</th>
            <th className="pb-3 pr-4 font-medium">Created</th>
            <th className="pb-3 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.slug} className="border-b border-stone-100 last:border-0">
              <td className="py-3 pr-4 text-stone-800 font-medium">{r.label}</td>
              <td className="py-3 pr-4">
                <a
                  href={`/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-500 hover:text-stone-800 transition-colors underline underline-offset-2"
                >
                  /{r.slug}
                </a>
              </td>
              <td className="py-3 pr-4 text-stone-400 whitespace-nowrap">
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="py-3">
                <button
                  onClick={() => copyUrl(r.slug)}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  title="Copy full URL"
                >
                  {copied === r.slug ? "Copied!" : "Copy"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
