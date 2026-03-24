"use client";

import { useActionState } from "react";
import { loginAdmin, type ActionState } from "@/app/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAdmin,
    {}
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">schlacter.me</p>
        <h1 className="text-2xl font-semibold text-stone-800">Admin</h1>
      </div>

      <form action={action} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
            placeholder="Enter admin password"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
