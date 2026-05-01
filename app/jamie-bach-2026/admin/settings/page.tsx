"use client";

import { useState, useEffect } from "react";
import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";

export default function SettingsPage() {
  return (
    <AdminGate>
      <AdminNav />
      <Body />
    </AdminGate>
  );
}

function Body() {
  const { state, error, loading, refresh } = useAdminState();
  const [actor, setActor] = useState<"hannah" | "ellie">("hannah");
  const [photos, setPhotos] = useState("");
  const [chat, setChat] = useState("");
  const [splitwise, setSplitwise] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jamie-admin-actor");
    if (stored === "hannah" || stored === "ellie") setActor(stored);
  }, []);

  useEffect(() => {
    if (state) {
      setPhotos(state.photosUrl || "");
      setChat(state.groupChatUrl || "");
      setSplitwise(state.expenses.splitwiseUrl || "");
    }
  }, [state]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/jamie/admin/settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-pw": "Admin-July2026",
        },
        body: JSON.stringify({
          photosUrl: photos,
          groupChatUrl: chat,
          splitwiseUrl: splitwise,
          actor,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      flash("saved ✿");
      refresh();
    } catch (e) {
      flash(`error: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: fonts.script,
            fontSize: "1.15rem",
            color: colors.coral,
          }}
        >
          paste links once, guests see them everywhere
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "2rem",
            color: colors.navy,
            margin: 0,
            lineHeight: 1,
          }}
        >
          settings
        </h1>
      </header>

      <div
        style={{
          background: "#fff",
          border: `3px solid ${colors.navy}`,
          borderRadius: 14,
          padding: 18,
          boxShadow: stickerShadow,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <UrlField
          emoji="💸"
          label="splitwise group invite link"
          help='create the group in Splitwise → "invite to group via link" → paste here'
          value={splitwise}
          onChange={setSplitwise}
          placeholder="https://splitwise.com/groups/..."
        />
        <UrlField
          emoji="💬"
          label="iMessage group chat link"
          help="from messages app → group chat info → share"
          value={chat}
          onChange={setChat}
          placeholder="https://messages.apple.com/..."
        />
        <UrlField
          emoji="📸"
          label="iCloud shared photo album"
          help="apple photos → shared album → people → public website on/share link"
          value={photos}
          onChange={setPhotos}
          placeholder="https://www.icloud.com/sharedalbum/..."
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginTop: 6,
          }}
        >
          <ActorPicker actor={actor} setActor={(v) => {
            setActor(v);
            localStorage.setItem("jamie-admin-actor", v);
          }} />
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "10px 22px",
              background: colors.coral,
              border: `3px solid ${colors.navy}`,
              borderRadius: 999,
              color: colors.navy,
              fontFamily: fonts.display,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.6 : 1,
              boxShadow: "3px 3px 0 #1F2A44",
            }}
          >
            {saving ? "saving..." : "save 💾"}
          </button>
        </div>
      </div>

      <p
        style={{
          marginTop: 14,
          fontFamily: fonts.script,
          fontSize: "1rem",
          color: colors.navySoft,
          textAlign: "center",
        }}
      >
        leave blank to hide that CTA from guests ✨
      </p>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: colors.navy,
            color: colors.cream,
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 600,
            fontSize: "0.9rem",
            zIndex: 100,
            boxShadow: "4px 4px 0 #00000033",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function UrlField({
  emoji,
  label,
  help,
  value,
  onChange,
  placeholder,
}: {
  emoji: string;
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: "1.1rem" }}>{emoji}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: colors.navy,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: colors.navySoft,
          marginBottom: 6,
          fontFamily: fonts.script,
        }}
      >
        {help}
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `2px solid ${colors.navy}`,
          borderRadius: 10,
          background: colors.cream,
          fontFamily: fonts.mono,
          fontSize: "0.85rem",
          color: colors.navy,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function ActorPicker({
  actor,
  setActor,
}: {
  actor: "hannah" | "ellie";
  setActor: (v: "hannah" | "ellie") => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: "0.78rem", color: colors.navySoft }}>you are</span>
      {(["hannah", "ellie"] as const).map((name) => {
        const active = actor === name;
        return (
          <button
            key={name}
            onClick={() => setActor(name)}
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              border: `2px solid ${colors.navy}`,
              background: active ? colors.coral : "#fff",
              color: colors.navy,
              fontSize: "0.78rem",
              fontWeight: active ? 700 : 600,
              cursor: "pointer",
              boxShadow: active ? "2px 2px 0 #1F2A44" : "none",
            }}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>⚙️</div>
      <p style={{ color: colors.navySoft, marginTop: 12 }}>loading...</p>
    </div>
  );
}

function ErrorView({ error }: { error: string | null }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <p style={{ color: colors.coral }}>oops — {error || "no data"}</p>
    </div>
  );
}
