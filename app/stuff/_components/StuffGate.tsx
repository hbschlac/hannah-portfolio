"use client";

import { useEffect, useState, type ReactNode } from "react";

// Client-side gate for the mockup. Persists in localStorage so a login on your
// phone survives tab close / browser restart — you stay logged in.
// NOTE: not hardened security (password ships in the bundle). Phase 2 replaces
// this with a server-side cookie gate. See ARCHITECTURE.md §6.
const PASSWORD = process.env.NEXT_PUBLIC_STUFF_PASSWORD || "readlater";
const STORAGE_KEY = "stuff-auth";

export default function StuffGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") setUnlocked(true);
    setChecking(false);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  // Avoid a flash of the gate before localStorage is read.
  if (checking) return <div className="min-h-screen bg-white" />;

  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center bg-white px-8 text-neutral-950">
      <h1 className="text-3xl font-semibold tracking-tight">Stuff</h1>
      <p className="mt-1 text-sm text-neutral-400">Stuff to read later.</p>

      <form onSubmit={submit} className="mt-8 w-full">
        <input
          type="password"
          inputMode="text"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          className={`w-full rounded-xl border px-4 py-3 text-center text-base outline-none ${
            error ? "border-[#DB2777]" : "border-neutral-200 focus:border-[#DB2777]"
          }`}
        />
        {error && (
          <p className="mt-2 text-center text-sm text-[#DB2777]">
            Wrong password.
          </p>
        )}
        <button
          type="submit"
          className="mt-3 w-full rounded-xl bg-[#DB2777] py-3 text-base font-medium text-white"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
