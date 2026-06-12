import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PublishToggle } from "@/components/admin/PublishToggle";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { id: "asc" } },
    },
  });
  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <Link href="/admin/products" className="text-sm text-paper-dim hover:text-acid">
          ← Prodotti
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="display text-3xl">
            {product.brand.name} {product.name}
          </h1>
          {product.status === "PUBLISHED" && (
            <Link
              href={`/it/shop/${product.slug}`}
              target="_blank"
              className="text-sm text-acid hover:underline"
            >
              Vedi sul sito ↗
            </Link>
          )}
        </div>
        {product.excelQty !== null && (
          <p className="mt-1 text-xs text-paper-dim">
            Quantità ultimo Excel: {product.excelQty} (informativa — fa fede lo stock taglie qui
            sotto)
          </p>
        )}
      </div>

      <section className="border border-paper/15 bg-ink-2 p-5">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-paper-dim">Stato</h2>
        <PublishToggle productId={product.id} status={product.status} />
      </section>

      <section className="border border-paper/15 bg-ink-2 p-5">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-paper-dim">Foto</h2>
        <PhotoUploader
          productId={product.id}
          photos={product.images.map((i) => ({ id: i.id, url: i.url }))}
        />
      </section>

      <section className="border border-paper/15 bg-ink-2 p-5">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-paper-dim">
          Taglie e disponibilità
        </h2>
        <VariantEditor
          productId={product.id}
          initial={product.variants.map((v) => ({ size: v.size, quantity: v.quantity }))}
        />
      </section>

      <section className="border border-paper/15 bg-ink-2 p-5">
        <h2 className="mb-4 text-xs uppercase tracking-widest text-paper-dim">Dati prodotto</h2>
        <ProductForm
          productId={product.id}
          initial={{
            name: product.name,
            brandName: product.brand.name,
            categoryName: product.category?.nameIt ?? "",
            price: (product.priceCents / 100).toFixed(2).replace(".", ","),
            purchasePrice: product.purchasePriceCents
              ? (product.purchasePriceCents / 100).toFixed(2).replace(".", ",")
              : "",
            vatRate: product.vatRate,
            season: product.season,
            year: product.year?.toString() ?? "",
            descriptionIt: product.descriptionIt ?? "",
            descriptionEn: product.descriptionEn ?? "",
            featured: product.featured,
          }}
        />
      </section>
    </div>
  );
}
