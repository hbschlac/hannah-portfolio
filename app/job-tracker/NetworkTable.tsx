"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { saveNetwork, type SaveNetworkResult } from "./networkActions";
import type { NetworkContact } from "@/lib/kv";

function newBlankContact(): NetworkContact {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "",
    linkedinUrl: "",
    messaged: false,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

const inputCls =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-stone-800 rounded px-1.5 py-1 text-stone-800 placeholder:text-stone-300 text-sm";
const textareaCls =
  "w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-stone-800 rounded px-1.5 py-1 text-stone-800 placeholder:text-stone-300 text-sm resize-none overflow-hidden leading-snug";

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export default function NetworkTable({
  initialContacts,
}: {
  initialContacts: NetworkContact[];
}) {
  const [contacts, setContacts] = useState<NetworkContact[]>(() =>
    initialContacts.length ? initialContacts : [newBlankContact()]
  );
  const [saveResult, setSaveResult] = useState<SaveNetworkResult>({});
  const [isPending, startTransition] = useTransition();
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;
    tableRef.current.querySelectorAll<HTMLTextAreaElement>("textarea").forEach(autoResize);
  }, [contacts.length]);

  function updateContact(id: string, field: keyof NetworkContact, value: unknown) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  function addRow() {
    setContacts((prev) => [...prev, newBlankContact()]);
  }

  function deleteRow(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function commit() {
    const cleaned = contacts.filter((c) => c.name.trim() || c.linkedinUrl.trim());
    startTransition(async () => {
      const result = await saveNetwork(cleaned);
      setSaveResult(result);
      if (!result.error) {
        setContacts(cleaned.length ? cleaned : [newBlankContact()]);
      }
    });
  }

  const messagedCount = contacts.filter((c) => c.messaged && c.name.trim()).length;
  const totalCount = contacts.filter((c) => c.name.trim()).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          {totalCount} people · {messagedCount} messaged
        </p>
        <div className="flex items-center gap-2">
          {saveResult.error && (
            <span className="text-xs text-red-600">{saveResult.error}</span>
          )}
          {saveResult.savedAt && !saveResult.error && (
            <span className="text-xs text-stone-400">
              Saved {new Date(saveResult.savedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={addRow}
            className="text-xs px-3 py-1.5 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            + Add
          </button>
          <button
            onClick={commit}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-md bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-stone-200 rounded-lg">
        <table ref={tableRef} className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="text-left px-3 py-2 w-10">✓</th>
              <th className="text-left px-3 py-2 w-48">Name</th>
              <th className="text-left px-3 py-2 w-72">LinkedIn</th>
              <th className="text-left px-3 py-2">Notes</th>
              <th className="text-left px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className={`border-t border-stone-100 ${c.messaged ? "bg-green-50" : "bg-white"}`}
              >
                <td className="px-3 py-2 align-top">
                  <input
                    type="checkbox"
                    checked={c.messaged}
                    onChange={(e) => updateContact(c.id, "messaged", e.target.checked)}
                    className="accent-stone-800"
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateContact(c.id, "name", e.target.value)}
                    placeholder="Name"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  {c.linkedinUrl ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={c.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate max-w-[180px]"
                        title={c.linkedinUrl}
                      >
                        {c.linkedinUrl.replace("https://www.linkedin.com/in/", "").replace(/\/$/, "")}
                      </a>
                      <input
                        type="text"
                        value={c.linkedinUrl}
                        onChange={(e) => updateContact(c.id, "linkedinUrl", e.target.value)}
                        className={`${inputCls} text-xs text-stone-400`}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={c.linkedinUrl}
                      onChange={(e) => updateContact(c.id, "linkedinUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/…"
                      className={inputCls}
                    />
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <textarea
                    value={c.notes}
                    onChange={(e) => {
                      updateContact(c.id, "notes", e.target.value);
                      autoResize(e.currentTarget);
                    }}
                    placeholder="Draft message, context, follow-up date…"
                    rows={1}
                    className={textareaCls}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <button
                    onClick={() => deleteRow(c.id)}
                    className="text-stone-300 hover:text-red-600 text-sm"
                    title="Delete"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
