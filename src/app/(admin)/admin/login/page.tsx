"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="w-full max-w-sm space-y-4 border border-paper/15 bg-ink-2 p-8">
      <p className="display text-2xl">
        STROKE <span className="text-acid">ADMIN</span>
      </p>
      <input
        name="user"
        placeholder="Utente"
        autoComplete="username"
        className="w-full border border-paper/20 bg-ink px-4 py-3 focus:border-acid focus:outline-none"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        className="w-full border border-paper/20 bg-ink px-4 py-3 focus:border-acid focus:outline-none"
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full bg-acid px-4 py-3 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
      >
        {pending ? "..." : "Entra"}
      </button>
    </form>
  );
}
