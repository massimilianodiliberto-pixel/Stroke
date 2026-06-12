"use client";

import { useState, useTransition } from "react";
import { setVariants } from "@/actions/products";

interface VariantRow {
  size: string;
  quantity: number;
}

const QUICK_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function VariantEditor({
  productId,
  initial,
}: {
  productId: string;
  initial: VariantRow[];
}) {
  const [rows, setRows] = useState<VariantRow[]>(
    initial.length > 0 ? initial : [{ size: "", quantity: 1 }],
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function update(index: number, patch: Partial<VariantRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await setVariants(productId, rows);
      setSaved(true);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_SIZES.filter((s) => !rows.some((r) => r.size === s)).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRows((prev) => [...prev.filter((r) => r.size), { size: s, quantity: 1 }])}
            className="border border-paper/20 px-3 py-1 text-xs hover:border-acid"
          >
            + {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { size: "", quantity: 1 }])}
          className="border border-paper/20 px-3 py-1 text-xs hover:border-acid"
        >
          + altra taglia
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-widest text-paper-dim">
            <th className="pb-2">Taglia</th>
            <th className="pb-2">Pezzi</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="pr-2 pb-2">
                <input
                  value={row.size}
                  onChange={(e) => update(i, { size: e.target.value.toUpperCase() })}
                  placeholder="es. M o 42"
                  className="w-28 border border-paper/20 bg-ink px-3 py-2 focus:border-acid focus:outline-none"
                />
              </td>
              <td className="pr-2 pb-2">
                <input
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                  className="w-20 border border-paper/20 bg-ink px-3 py-2 focus:border-acid focus:outline-none"
                />
              </td>
              <td className="pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setRows((prev) => prev.filter((_, j) => j !== i));
                    setSaved(false);
                  }}
                  className="text-paper-dim hover:text-danger"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending}
          className="bg-acid px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
        >
          {pending ? "…" : "Salva taglie"}
        </button>
        {saved && <span className="text-sm text-acid">Salvato ✓</span>}
      </div>
      <p className="text-xs text-paper-dim">
        Un pezzo per taglia: di solito quantità 1. Le taglie rimosse vengono azzerate, non
        cancellate (per non rompere ordini passati).
      </p>
    </div>
  );
}
