"use client";

import { useState } from "react";
import { useStuff } from "./StuffProvider";

export default function AddSheet({ onClose }: { onClose: () => void }) {
  const { addItem } = useStuff();
  const [url, setUrl] = useState("");

  const submit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const withProtocol = /^https?:\/\//.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    addItem({ url: withProtocol });
    setUrl("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative mx-auto w-full max-w-[480px] rounded-t-3xl bg-white px-6 pb-10 pt-5">
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-neutral-200" />
        <h2 className="text-lg font-semibold">Add something to read</h2>

        <div className="mt-5 space-y-4">
          <CaptureMethod
            title="Share from your phone"
            body="In Safari, LinkedIn, or any app, tap Share → Stuff. The link lands in your feed."
            icon="⬆️"
          />
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Or paste a link
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="https://…"
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#DB2777]"
            />
            <button
              onClick={submit}
              className="rounded-xl bg-[#DB2777] px-5 text-sm font-medium text-white"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureMethod({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#FDF2F5] p-4">
      <span className="text-xl leading-none">{icon}</span>
      <div>
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-neutral-500">{body}</p>
      </div>
    </div>
  );
}
