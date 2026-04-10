"use client";

import { useActionState, useState } from "react";
import { createResume, type ActionState } from "@/app/actions";

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateResumeForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createResume,
    {}
  );
  const [slugPreview, setSlugPreview] = useState("");

  return (
    <div>
      <form action={action} className="space-y-6">
        {/* Google Doc URL */}
        <div>
          <label htmlFor="docUrl" className="block text-sm font-medium text-stone-700 mb-1.5">
            Google Doc URL
          </label>
          <input
            id="docUrl"
            name="docUrl"
            type="url"
            required
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            placeholder="https://docs.google.com/document/d/..."
          />
          <p className="mt-1.5 text-xs text-stone-400">
            Share the doc with the service account email first, then paste the link here.
          </p>
        </div>

        {/* Label */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-stone-700 mb-1.5">
            Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            required
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            placeholder="e.g. Anthropic – Claude Consumer PM"
          />
          <p className="mt-1.5 text-xs text-stone-400">
            A human-readable name for this resume (for your reference only).
          </p>
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-stone-700 mb-1.5">
            URL slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            placeholder="e.g. anthropic-claude-consumer"
            onChange={(e) => setSlugPreview(slugify(e.target.value))}
          />
          {slugPreview && (
            <p className="mt-1.5 text-xs text-stone-500">
              Your page will be at:{" "}
              <span className="font-medium text-stone-700">schlacter.me/{slugPreview}</span>
            </p>
          )}
        </div>

        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          {pending ? "Creating page…" : "Create resume page →"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-stone-400">
        Once created, your page will be live immediately at the URL above.
      </p>
    </div>
  );
}
