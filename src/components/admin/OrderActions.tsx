"use client";

import { useState, useTransition } from "react";
import { confirmOrder, cancelOrder } from "@/actions/orders";

export function OrderActions({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<{ error?: string; ok?: boolean }>, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return;
    setError(null);
    startTransition(async () => {
      const result = await action(orderId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          disabled={pending}
          onClick={() =>
            run(
              confirmOrder,
              "Confermi l'ordine? Se c'è un pagamento Stripe verrà incassato ora.",
            )
          }
          className="bg-acid px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
        >
          ✓ Conferma
        </button>
        <button
          disabled={pending}
          onClick={() =>
            run(
              cancelOrder,
              "Annulli l'ordine? Lo stock torna disponibile e l'eventuale autorizzazione di pagamento viene rilasciata.",
            )
          }
          className="border border-danger px-6 py-3 text-sm font-bold uppercase tracking-widest text-danger disabled:opacity-40"
        >
          ✕ Annulla
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
