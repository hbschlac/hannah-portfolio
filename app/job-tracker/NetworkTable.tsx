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
  const contactsRef = useRef<NetworkContact[]>(contacts);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!tableRef.current) return;
    tableRef.current.querySelectorAll<HTMLTextAreaElement>("textarea").forEach(autoResize);
  }, [contacts.length]);

  // Flush any pending debounced save when the component unmounts (e.g. view switch).
  // Gated on `saveTimerRef.current` being a *pending* timer — we null the ref after
  // the timer fires, so this only triggers when there's genuinely unsaved work.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== undefined) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = undefined;
        const cleaned = contactsRef.current.filter((c) => c.name.trim() || c.linkedinUrl.trim());
        // Fire-and-forget: keep KV in sync even if user navigates away mid-edit.
        void saveNetwork(cleaned);
      }
    };
  }, []);

  function setContactsAndRef(updater: NetworkContact[] | ((prev: NetworkContact[]) => NetworkContact[])) {
    setContacts((prev) => {
      const next = typeof updater === "function" ? (updater as (p: NetworkContact[]) => NetworkContact[])(prev) : updater;
      contactsRef.current = next;
      return next;
    });
  }

  function scheduleSave() {
    if (saveTimerRef.current !== undefined) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = undefined;
      persistSave();
    }, 1200);
  }

  function persistSave() {
    const cleaned = contactsRef.current.filter((c) => c.name.trim() || c.linkedinUrl.trim());
    startTransition(async () => {
      const result = await saveNetwork(cleaned);
      setSaveResult(result);
    });
  }

  function updateContact(id: string, field: keyof NetworkContact, value: unknown) {
    setContactsAndRef((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value, updatedAt: new Date().toISOString() } : c))
    );
    scheduleSave();
  }

  function addRow() {
    setContactsAndRef((prev) => [...prev, newBlankContact()]);
    // No save yet — blank row gets filtered out anyway. First edit will trigger save.
  }

  function deleteRow(id: string) {
    setContactsAndRef((prev) => prev.filter((c) => c.id !== id));
    scheduleSave();
  }

  function commit() {
    if (saveTimerRef.current !== undefined) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = undefined;
    }
    const cleaned = contactsRef.current.filter((c) => c.name.trim() || c.linkedinUrl.trim());
    startTransition(async () => {
      const result = await saveNetwork(cleaned);
      setSaveResult(result);
      // Only seed a blank row when the cleaned set is empty — don't overwrite
      // the live `contacts` with the stale `cleaned` snapshot, which would
      // clobber any edits the user made during the in-flight save.
      if (!result.error && cleaned.length === 0) {
        setContactsAndRef([newBlankContact()]);
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
