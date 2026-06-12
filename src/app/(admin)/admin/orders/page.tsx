import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">Ordini</h1>

      {orders.length === 0 ? (
        <p className="text-paper-dim">Ancora nessun ordine.</p>
      ) : (
        <ul className="divide-y divide-paper/10 border border-paper/15">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-ink-2"
              >
                <div>
                  <p className="font-bold">{o.orderNumber}</p>
                  <p className="text-sm text-paper-dim">
                    {o.customerName} · {o.items.length} articoli ·{" "}
                    {new Date(o.createdAt).toLocaleString("it-IT")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={o.status} />
                  <p className="font-bold">{formatPrice(o.totalCents)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
