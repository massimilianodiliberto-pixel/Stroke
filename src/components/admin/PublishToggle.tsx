"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProductStatus } from "@/actions/products";

export function PublishToggle({
  productId,
  status,
}: {
  productId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(next: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setError(null);
    startTransition(async () => {
      const result = await setProductStatus(productId, next);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {status !== "PUBLISHED" ? (
          <button
            disabled={pending}
            onClick={() => set("PUBLISHED")}
            className="bg-acid px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
          >
            Pubblica online
          </button>
        ) : (
          <button
            disabled={pending}
            onClick={() => set("DRAFT")}
            className="border border-paper/30 px-5 py-2.5 text-sm uppercase tracking-widest hover:border-acid disabled:opacity-40"
          >
            Togli dal sito
          </button>
        )}
        {status !== "ARCHIVED" && (
          <button
            disabled={pending}
            onClick={() => set("ARCHIVED")}
            className="border border-paper/20 px-5 py-2.5 text-sm uppercase tracking-widest text-paper-dim hover:border-danger hover:text-danger disabled:opacity-40"
          >
            Archivia
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
