"use client";

import { useActionState } from "react";
import { uploadStockFile } from "@/actions/import";

export function UploadStockForm() {
  const [state, action, pending] = useActionState(uploadStockFile, undefined);

  return (
    <form action={action} className="border border-dashed border-paper/30 p-8">
      <label className="block">
        <span className="mb-3 block text-sm text-paper-dim">File magazzino (.xlsx)</span>
        <input
          type="file"
          name="file"
          accept=".xlsx"
          required
          className="block w-full text-sm file:mr-4 file:border-0 file:bg-acid file:px-4 file:py-2 file:text-sm file:font-bold file:uppercase file:text-ink"
        />
      </label>
      {state?.error && (
        <p className="mt-4 border border-danger/50 px-4 py-3 text-sm text-danger">{state.error}</p>
      )}
      <button
        disabled={pending}
        className="mt-6 bg-acid px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
      >
        {pending ? "Analizzo il file…" : "Carica e mostra anteprima"}
      </button>
    </form>
  );
}
