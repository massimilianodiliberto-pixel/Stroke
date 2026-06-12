"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmImport, discardImport, type ImportPreviewPayload } from "@/actions/import";
import type { DiffEntry } from "@/lib/excel";

function entryKey(entry: DiffEntry): string {
  return entry.kind === "MISSING_IN_FILE" ? entry.productId : entry.row.importKey;
}

export function ImportPreview({
  sessionId,
  payload,
}: {
  sessionId: string;
  payload: ImportPreviewPayload;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const groups = useMemo(() => {
    const g = { NEW: [], UPDATE: [], UNCHANGED: [], MISSING_IN_FILE: [] } as Record<
      DiffEntry["kind"],
      DiffEntry[]
    >;
    for (const e of payload.entries) g[e.kind].push(e);
    return g;
  }, [payload.entries]);

  const [selected, setSelected] = useState<Set<string>>(
    () =>
      new Set(
        [...groups.NEW, ...groups.UPDATE].map((e) => entryKey(e)),
      ),
  );
  const [toArchive, setToArchive] = useState<Set<string>>(new Set());

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  function apply() {
    startTransition(async () => {
      const res = await confirmImport(sessionId, {
        apply: [...selected],
        archive: [...toArchive],
      });
      if (res && "summary" in res && res.summary) {
        setResult(res.summary as unknown as Record<string, number>);
        setTimeout(() => router.push("/admin/products"), 1800);
      }
    });
  }

  if (result) {
    return (
      <div className="border border-acid/50 bg-ink-2 p-6">
        <p className="display text-2xl text-acid">Import completato ✓</p>
        <p className="mt-2 text-sm text-paper-dim">
          {result.created} nuovi (in bozza) · {result.updated} aggiornati · {result.unchanged}{" "}
          invariati · {result.archived} archiviati · {result.skipped} saltati
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="bg-acid px-3 py-1 font-bold text-ink">{groups.NEW.length} nuovi</span>
        <span className="bg-paper/20 px-3 py-1">{groups.UPDATE.length} da aggiornare</span>
        <span className="border border-paper/20 px-3 py-1 text-paper-dim">
          {groups.UNCHANGED.length} invariati
        </span>
        <span className="border border-danger/40 px-3 py-1 text-danger">
          {groups.MISSING_IN_FILE.length} assenti dal file
        </span>
        {payload.invalid.length > 0 && (
          <span className="border border-danger px-3 py-1 text-danger">
            {payload.invalid.length} righe scartate
          </span>
        )}
      </div>

      {groups.NEW.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-acid">
            Nuovi articoli (creati come bozza, senza foto né taglie)
          </h2>
          <ul className="divide-y divide-paper/10 border border-paper/15 text-sm">
            {groups.NEW.map((e) => {
              if (e.kind !== "NEW") return null;
              const key = e.row.importKey;
              return (
                <li key={key} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => toggle(selected, setSelected, key)}
                    className="h-4 w-4 accent-[#d7ff3f]"
                  />
                  <span className="flex-1">
                    <span className="text-acid">{e.row.brand}</span> {e.row.name}
                  </span>
                  <span className="text-paper-dim">
                    {(e.row.priceCents / 100).toFixed(2).replace(".", ",")} € · q.{e.row.quantity}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {groups.UPDATE.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-paper-dim">
            Aggiornamenti (prezzi/IVA/stagione — foto, stato e stock taglie non vengono toccati)
          </h2>
          <ul className="divide-y divide-paper/10 border border-paper/15 text-sm">
            {groups.UPDATE.map((e) => {
              if (e.kind !== "UPDATE") return null;
              const key = e.row.importKey;
              return (
                <li key={key} className="flex items-start gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => toggle(selected, setSelected, key)}
                    className="mt-0.5 h-4 w-4 accent-[#d7ff3f]"
                  />
                  <div className="flex-1">
                    <p>{e.productName}</p>
                    <p className="text-xs text-paper-dim">
                      {e.changes.map((c) => `${c.field}: ${c.from} → ${c.to}`).join(" · ")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {groups.MISSING_IN_FILE.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-danger">
            Nel sito ma assenti dall&apos;Excel — spunta per archiviare (mai cancellati in automatico)
          </h2>
          <ul className="divide-y divide-paper/10 border border-paper/15 text-sm">
            {groups.MISSING_IN_FILE.map((e) => {
              if (e.kind !== "MISSING_IN_FILE") return null;
              return (
                <li key={e.productId} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={toArchive.has(e.productId)}
                    onChange={() => toggle(toArchive, setToArchive, e.productId)}
                    className="h-4 w-4 accent-[#ff4d4d]"
                  />
                  <span>
                    <span className="text-acid">{e.brandName}</span> {e.productName}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {payload.invalid.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-danger">Righe scartate</h2>
          <ul className="divide-y divide-paper/10 border border-danger/30 text-xs text-paper-dim">
            {payload.invalid.map((r) => (
              <li key={r.rowNumber} className="p-2">
                Riga {r.rowNumber}: {r.errors.join(", ")} — <span className="italic">{r.raw}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-3">
        <button
          onClick={apply}
          disabled={pending}
          className="bg-acid px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
        >
          {pending ? "Applico…" : `Applica import (${selected.size + toArchive.size})`}
        </button>
        <button
          onClick={() => startTransition(() => discardImport(sessionId))}
          disabled={pending}
          className="border border-paper/30 px-6 py-3 text-sm uppercase tracking-widest hover:border-danger hover:text-danger disabled:opacity-40"
        >
          Scarta
        </button>
      </div>
    </div>
  );
}
