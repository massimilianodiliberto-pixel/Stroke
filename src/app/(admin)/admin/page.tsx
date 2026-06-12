import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sweepStaleOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const stalePending = await sweepStaleOrders();

  const [pendingOrders, draftCount, publishedCount, lastImport] = await Promise.all([
    db.order.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    db.product.count({ where: { status: "DRAFT" } }),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.importSession.findFirst({ where: { status: "APPLIED" }, orderBy: { appliedAt: "desc" } }),
  ]);

  const staleIds = new Set(stalePending.map((o) => o.id));

  return (
    <div className="space-y-8">
      <h1 className="display text-4xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-paper/15 bg-ink-2 p-5">
          <p className="text-3xl font-bold text-acid">{pendingOrders.length}</p>
          <p className="text-sm text-paper-dim">Ordini da confermare</p>
        </div>
        <div className="border border-paper/15 bg-ink-2 p-5">
          <p className="text-3xl font-bold">{publishedCount}</p>
          <p className="text-sm text-paper-dim">Prodotti online</p>
        </div>
        <div className="border border-paper/15 bg-ink-2 p-5">
          <p className="text-3xl font-bold">{draftCount}</p>
          <p className="text-sm text-paper-dim">Bozze (senza foto/taglie)</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest text-paper-dim">
          Prenotazioni in attesa
        </h2>
        {pendingOrders.length === 0 ? (
          <p className="text-paper-dim">Nessun ordine da gestire. 🎉</p>
        ) : (
          <ul className="divide-y divide-paper/10 border border-paper/15">
            {pendingOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-ink-2"
                >
                  <div>
                    <p className="font-bold">
                      {o.orderNumber}
                      {staleIds.has(o.id) && (
                        <span className="ml-2 bg-danger px-2 py-0.5 text-xs text-ink">
                          SCADE PRESTO
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-paper-dim">
                      {o.customerName} · {o.items.length} articoli ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <p className="font-bold">{formatPrice(o.totalCents)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lastImport && (
        <p className="text-sm text-paper-dim">
          Ultimo import: {lastImport.filename} —{" "}
          {lastImport.appliedAt && new Date(lastImport.appliedAt).toLocaleString("it-IT")}
        </p>
      )}
    </div>
  );
}
