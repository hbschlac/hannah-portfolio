"use client";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/stuff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        // Land on whatever path the middleware redirected from, defaulting to /stuff.
        const next =
          new URLSearchParams(window.location.search).get("next") || "/stuff";
        window.location.replace(next);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center bg-white px-8 text-neutral-950">
      <h1 className="text-3xl font-semibold tracking-tight">Stuff</h1>
      <p className="mt-1 text-sm text-neutral-400">Stuff to read later.</p>

      <form onSubmit={submit} className="mt-8 w-full">
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          className={`w-full rounded-xl border px-4 py-3 text-center text-base outline-none ${
            error
              ? "border-[#DB2777]"
              : "border-neutral-200 focus:border-[#DB2777]"
          }`}
        />
        {error && (
          <p className="mt-2 text-center text-sm text-[#DB2777]">
            Wrong password.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !pwd}
          className="mt-3 w-full rounded-xl bg-[#DB2777] py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {loading ? "…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
