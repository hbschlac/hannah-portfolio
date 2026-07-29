"use client";

import { useState } from "react";

export default function Unlock() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/babymoon/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        window.location.href = "/babymoon";
      } else {
        setErr("That code didn't work. Try again.");
      }
    } catch {
      setErr("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bm-lock-wrap">
      <div className="bm-lock-card">
        <div style={{ fontSize: 40 }}>🌴</div>
        <h1 className="serif">Cabo Babymoon</h1>
        <p>Hannah &amp; Sam · Aug 2026</p>
        <form onSubmit={submit}>
          <input
            type="password"
            inputMode="text"
            autoFocus
            placeholder="passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Passcode"
          />
          <button type="submit" disabled={busy}>
            {busy ? "…" : "Enter"}
          </button>
        </form>
        <div className="bm-lock-err">{err}</div>
      </div>
    </div>
  );
}
