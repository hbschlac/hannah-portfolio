"use client";

import { useEffect, useState } from "react";
import type { Artifact } from "@/lib/kv";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `a_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function excerpt(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max).trimEnd() + "…";
}

type Props = {
  company: string;
  artifacts: Artifact[];
  onChange: (next: Artifact[]) => void;
  onClose: () => void;
};

export default function ArtifactsModal({
  company,
  artifacts,
  onChange,
  onClose,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (openId) setOpenId(null);
        else onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, onClose]);

  function addArtifact() {
    const now = new Date().toISOString();
    const next: Artifact = {
      id: newId(),
      title: "Untitled artifact",
      kind: "",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    onChange([...(artifacts ?? []), next]);
    setOpenId(next.id);
  }

  function updateArtifact(id: string, patch: Partial<Artifact>) {
    const now = new Date().toISOString();
    onChange(
      artifacts.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: now } : a))
    );
  }

  function deleteArtifact(id: string) {
    if (!confirm("Delete this artifact?")) return;
    onChange(artifacts.filter((a) => a.id !== id));
    if (openId === id) setOpenId(null);
  }

  const openArtifact = openId ? artifacts.find((a) => a.id === openId) : null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${company} artifacts`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <div className="min-w-0">
              <p className="text-[10px] tracking-widest uppercase text-stone-400">
                Artifacts · {company}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {artifacts.length === 0
                  ? "No artifacts yet."
                  : `${artifacts.length} artifact${artifacts.length === 1 ? "" : "s"} — double-click to open.`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-800 text-lg leading-none px-2"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body — either list or open view */}
          {openArtifact ? (
            <ArtifactFullView
              artifact={openArtifact}
              onUpdate={(patch) => updateArtifact(openArtifact.id, patch)}
              onDelete={() => deleteArtifact(openArtifact.id)}
              onBack={() => setOpenId(null)}
            />
          ) : (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {artifacts.length === 0 && (
                <p className="text-xs text-stone-400 italic py-8 text-center">
                  Drop intro-call notes, interview transcripts, pre-reads, or any richer context here.
                </p>
              )}
              {artifacts.map((a) => (
                <ArtifactCardRow
                  key={a.id}
                  artifact={a}
                  onOpen={() => setOpenId(a.id)}
                  onDelete={() => deleteArtifact(a.id)}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          {!openArtifact && (
            <div className="px-5 py-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={addArtifact}
                className="text-xs bg-stone-800 text-white rounded-lg px-3 py-1.5 hover:bg-stone-700"
              >
                + New artifact
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ArtifactCardRow({
  artifact,
  onOpen,
  onDelete,
}: {
  artifact: Artifact;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onDoubleClick={onOpen}
      className="group rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-colors cursor-pointer select-none"
      title="Double-click to open"
    >
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-stone-900 truncate">
                {artifact.title || "Untitled artifact"}
              </h4>
              {artifact.kind && (
                <span className="text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200 rounded-full px-1.5 py-0.5 leading-none">
                  {artifact.kind}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-snug">
              {excerpt(artifact.content) || (
                <span className="italic text-stone-400">(empty)</span>
              )}
            </p>
            <p className="text-[10px] text-stone-400 mt-1.5">
              {formatDate(artifact.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="text-[10px] text-stone-500 hover:text-stone-900 border border-stone-200 rounded px-2 py-1"
            >
              Open
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[10px] text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-1"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactFullView({
  artifact,
  onUpdate,
  onDelete,
  onBack,
}: {
  artifact: Artifact;
  onUpdate: (patch: Partial<Artifact>) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(artifact.title);
  const [kind, setKind] = useState(artifact.kind ?? "");
  const [content, setContent] = useState(artifact.content);

  // Sync local state if artifact ref changes (e.g. switching artifacts)
  useEffect(() => {
    setTitle(artifact.title);
    setKind(artifact.kind ?? "");
    setContent(artifact.content);
  }, [artifact.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function saveIfChanged() {
    const patch: Partial<Artifact> = {};
    if (title !== artifact.title) patch.title = title;
    if (kind !== (artifact.kind ?? "")) patch.kind = kind;
    if (content !== artifact.content) patch.content = content;
    if (Object.keys(patch).length > 0) onUpdate(patch);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-4 pb-3 border-b border-stone-100 space-y-2">
        <button
          onClick={() => {
            saveIfChanged();
            onBack();
          }}
          className="text-[11px] text-stone-500 hover:text-stone-900"
        >
          ← Back to list
        </button>
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-stone-400">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveIfChanged}
            placeholder="Artifact title…"
            className="mt-0.5 w-full text-base font-medium text-stone-900 bg-white border border-stone-200 rounded-md px-2 py-1.5 hover:border-stone-400 focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
          />
        </label>
        <input
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          onBlur={saveIfChanged}
          placeholder="Kind (e.g. intro-call, transcript, research)"
          className="w-full text-xs text-stone-600 bg-transparent border-b border-transparent focus:border-stone-200 focus:outline-none pb-1"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveIfChanged}
          placeholder="Paste notes, transcripts, or anything worth keeping. Markdown supported."
          className="w-full min-h-[50vh] text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-stone-800 resize-y"
        />
      </div>
      <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
        <button
          onClick={onDelete}
          className="text-xs text-stone-400 hover:text-red-500"
        >
          Delete artifact
        </button>
        <button
          onClick={() => {
            saveIfChanged();
            onBack();
          }}
          className="text-xs bg-stone-800 text-white rounded-lg px-3 py-1.5 hover:bg-stone-700"
        >
          Save &amp; close
        </button>
      </div>
    </div>
  );
}
