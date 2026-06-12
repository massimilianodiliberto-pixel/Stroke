import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FilterBar } from "@/components/shop/FilterBar";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCatalogFacets, queryProducts } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("shopTitle"), description: t("shopDescription") };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("shop");

  const filters = {
    brand: typeof sp.brand === "string" ? sp.brand : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    size: typeof sp.size === "string" ? sp.size : undefined,
    season: typeof sp.season === "string" ? sp.season : undefined,
    q: typeof sp.q === "string" ? sp.q : undefined,
  };

  const [products, facets] = await Promise.all([queryProducts(filters), getCatalogFacets()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl sm:text-7xl">{t("title")}</h1>
        <p className="text-sm text-paper-dim">{t("results", { count: products.length })}</p>
      </div>

      <div className="mb-8">
        <Suspense>
          <FilterBar facets={facets} />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <p className="py-24 text-center text-paper-dim">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
