import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ImportPreviewPayload } from "@/actions/import";
import { ImportPreview } from "@/components/admin/ImportPreview";
import { UploadStockForm } from "@/components/admin/UploadStockForm";

export const dynamic = "force-dynamic";

export default async function AdminImportPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; error?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const session = sp.session
    ? await db.importSession.findUnique({ where: { id: sp.session } })
    : null;

  const recent = await db.importSession.findMany({
    where: { status: "APPLIED" },
    orderBy: { appliedAt: "desc" },
    take: 5,
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="display text-4xl">Import Excel</h1>
        <p className="mt-2 max-w-2xl text-sm text-paper-dim">
          Carica il file del magazzino (.xlsx). Servono almeno le colonne brand, nome articolo e
          prezzo vendita — le altre (tipologia, prezzo acquisto, IVA, quantità, anno, stagione)
          vengono riconosciute se presenti. Prima di applicare qualsiasi modifica vedrai
          un&apos;anteprima.
        </p>
      </div>

      {session && session.status === "PREVIEW" ? (
        <>
          <p className="text-sm text-paper-dim">
            File: <span className="text-paper">{session.filename}</span>
          </p>
          <ImportPreview
            sessionId={session.id}
            payload={JSON.parse(session.payload) as ImportPreviewPayload}
          />
        </>
      ) : (
        <UploadStockForm />
      )}

      {recent.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-paper-dim">
            Import recenti
          </h2>
          <ul className="divide-y divide-paper/10 border border-paper/15 text-sm">
            {recent.map((s) => {
              const summary = s.summary ? (JSON.parse(s.summary) as Record<string, number>) : null;
              return (
                <li key={s.id} className="flex justify-between gap-4 p-3">
                  <span>{s.filename}</span>
                  <span className="text-paper-dim">
                    {summary &&
                      `${summary.created} nuovi · ${summary.updated} aggiornati`}{" "}
                    — {s.appliedAt && new Date(s.appliedAt).toLocaleDateString("it-IT")}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
