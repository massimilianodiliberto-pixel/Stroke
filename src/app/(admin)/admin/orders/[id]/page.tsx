import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/orders" className="text-sm text-paper-dim hover:text-acid">
          ← Tutti gli ordini
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="display text-3xl">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
          <span className="text-xs uppercase tracking-widest text-paper-dim">
            {order.paymentMode === "STRIPE" ? "Pagamento carta (hold)" : "Senza pagamento online"}
          </span>
        </div>
        <p className="mt-1 text-sm text-paper-dim">
          {new Date(order.createdAt).toLocaleString("it-IT")}
        </p>
      </div>

      <section className="border border-paper/15 bg-ink-2 p-5">
        <h2 className="mb-3 text-xs uppercase tracking-widest text-paper-dim">Cliente</h2>
        <p className="font-bold">{order.customerName}</p>
        <p>
          <a href={`mailto:${order.email}`} className="text-acid hover:underline">
            {order.email}
          </a>
          {order.phone && <span className="ml-3">{order.phone}</span>}
        </p>
        <p className="mt-2 text-sm text-paper-dim">
          {order.pickupInStore
            ? "🏪 Ritiro in negozio"
            : `📦 ${order.shippingLine1}, ${order.shippingZip} ${order.shippingCity} (${order.shippingCountry})`}
        </p>
        {order.customerNote && (
          <p className="mt-2 border-l-2 border-acid pl-3 text-sm">{order.customerNote}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-paper-dim">Articoli</h2>
        <ul className="divide-y divide-paper/10 border border-paper/15">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-ink-3">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold">
                  {item.brandName} {item.productName}
                </p>
                <p className="text-sm text-paper-dim">Taglia {item.size}</p>
              </div>
              <p className="font-bold">{formatPrice(item.priceCents)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-xl font-bold">
          Totale: {formatPrice(order.totalCents)}
        </p>
      </section>

      {order.status === "PENDING_REVIEW" && (
        <section className="border border-acid/40 bg-ink-2 p-5">
          <h2 className="mb-2 text-xs uppercase tracking-widest text-acid">
            Verifica e decidi
          </h2>
          <p className="mb-4 text-sm text-paper-dim">
            Controlla che i capi siano ancora in negozio, poi conferma (incassa) o annulla
            (rilascia il pagamento e ripristina lo stock).
          </p>
          <OrderActions orderId={order.id} />
        </section>
      )}

      {order.adminNote && (
        <p className="text-sm text-paper-dim">Nota interna: {order.adminNote}</p>
      )}
    </div>
  );
}
