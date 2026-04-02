"use client";

import Link from "next/link";
import { useActionState } from "react";
import { sendContactEmail, type ContactState } from "./actions";

const initialState: ContactState = {};

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(
    sendContactEmail,
    initialState
  );

  if (state.success) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#F8F6F2", color: "#1A1A1A" }}
      >
        <main className="flex-grow max-w-2xl mx-auto w-full px-6 pt-20 pb-10">
          <Link
            href="/"
            className="text-xs transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            ← schlacter.me
          </Link>
          <p
            className="text-xs tracking-widest uppercase mt-8"
            style={{ color: "#1A1A1A" }}
          >
            message sent.
          </p>
          <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
            i'll be in touch.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8F6F2", color: "#1A1A1A" }}
    >
      <main className="flex-grow max-w-2xl mx-auto w-full px-6 pt-20 pb-10">
        <Link
          href="/"
          className="text-xs transition-opacity hover:opacity-50"
          style={{ color: "#8A8A8A" }}
        >
          ← schlacter.me
        </Link>

        <p
          className="text-xs tracking-widest uppercase mt-8"
          style={{ color: "#1A1A1A" }}
        >
          say hello
        </p>
        <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
          i read everything.
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="text-xs"
              style={{ color: "#8A8A8A" }}
            >
              name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="text-xs px-3 py-2 rounded-none outline-none transition-colors"
              style={{
                background: "#F0EDE8",
                border: "1px solid #E5E1D8",
                color: "#1A1A1A",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#8A8A8A")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#E5E1D8")
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-xs"
              style={{ color: "#8A8A8A" }}
            >
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="text-xs px-3 py-2 rounded-none outline-none transition-colors"
              style={{
                background: "#F0EDE8",
                border: "1px solid #E5E1D8",
                color: "#1A1A1A",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#8A8A8A")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#E5E1D8")
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="message"
              className="text-xs"
              style={{ color: "#8A8A8A" }}
            >
              message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="text-xs px-3 py-2 rounded-none outline-none resize-none transition-colors"
              style={{
                background: "#F0EDE8",
                border: "1px solid #E5E1D8",
                color: "#1A1A1A",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#8A8A8A")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#E5E1D8")
              }
            />
          </div>

          {state.error && (
            <p className="text-xs" style={{ color: "#C0636B" }}>
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="text-xs self-start transition-opacity hover:opacity-50 disabled:opacity-30"
            style={{ color: "#1A1A1A" }}
          >
            {pending ? "sending..." : "send →"}
          </button>
        </form>
      </main>

      <footer
        className="max-w-2xl mx-auto w-full px-6 py-8"
        style={{ borderTop: "1px solid #E5E1D8" }}
      >
        <p className="text-xs" style={{ color: "#8A8A8A" }}>
          vibed with love | oakland, ca
        </p>
        <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
          © 2026
        </p>
      </footer>
    </div>
  );
}
