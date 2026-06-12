import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  DRAFT: { label: "Bozza", className: "bg-paper/20 text-paper" },
  PUBLISHED: { label: "Online", className: "bg-acid text-ink" },
  ARCHIVED: { label: "Archiviato", className: "bg-paper/10 text-paper-dim" },
} as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const status =
    sp.status === "DRAFT" || sp.status === "PUBLISHED" || sp.status === "ARCHIVED"
      ? sp.status
      : undefined;

  const products = await db.product.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(sp.q
        ? { OR: [{ name: { contains: sp.q } }, { brand: { name: { contains: sp.q } } }] }
        : {}),
    },
    include: { brand: true, images: true, variants: true },
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-4xl">Prodotti</h1>
        <Link
          href="/admin/products/new"
          className="bg-acid px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink"
        >
          + Nuovo
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { href: "/admin/products", label: "Tutti", active: !status },
          { href: "/admin/products?status=PUBLISHED", label: "Online", active: status === "PUBLISHED" },
          { href: "/admin/products?status=DRAFT", label: "Bozze", active: status === "DRAFT" },
          { href: "/admin/products?status=ARCHIVED", label: "Archiviati", active: status === "ARCHIVED" },
        ].map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`px-3 py-1.5 ${f.active ? "bg-acid text-ink font-bold" : "border border-paper/20 hover:border-acid"}`}
          >
            {f.label}
          </Link>
        ))}
        <form className="ml-auto">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Cerca…"
            className="border border-paper/20 bg-ink-2 px-3 py-1.5 focus:border-acid focus:outline-none"
          />
        </form>
      </div>

      <ul className="divide-y divide-paper/10 border border-paper/15">
        {products.map((p) => {
          const stock = p.variants.reduce((s, v) => s + v.quantity, 0);
          const s = STATUS_LABEL[p.status];
          return (
            <li key={p.id}>
              <Link
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-4 p-3 hover:bg-ink-2"
              >
                <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-ink-3">
                  {p.images[0] && (
                    <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <span className="text-acid">{p.brand.name}</span> {p.name}
                  </p>
                  <p className="text-xs text-paper-dim">
                    {p.variants.length === 0
                      ? "Nessuna taglia"
                      : `${stock} pezzi · taglie ${p.variants.map((v) => v.size).join(", ")}`}
                    {p.images.length === 0 && " · senza foto"}
                  </p>
                </div>
                <p className="font-bold">{formatPrice(p.priceCents)}</p>
                <span className={`px-2 py-1 text-xs font-bold uppercase ${s.className}`}>
                  {s.label}
                </span>
              </Link>
            </li>
          );
        })}
        {products.length === 0 && (
          <li className="p-6 text-paper-dim">Nessun prodotto trovato.</li>
        )}
      </ul>
    </div>
  );
}
