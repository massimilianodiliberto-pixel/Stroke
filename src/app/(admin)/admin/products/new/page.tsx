import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function AdminNewProductPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-paper-dim hover:text-acid">
          ← Prodotti
        </Link>
        <h1 className="display mt-2 text-4xl">Nuovo prodotto</h1>
        <p className="mt-2 text-sm text-paper-dim">
          Il prodotto nasce come bozza: dopo averlo creato potrai aggiungere foto e taglie e
          poi pubblicarlo.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
