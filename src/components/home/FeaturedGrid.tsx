import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "./Reveal";
import type { PublicProduct } from "@/lib/catalog";

export async function FeaturedGrid({ products }: { products: PublicProduct[] }) {
  const t = await getTranslations("home");
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mb-10 flex items-end justify-between">
          <h2 className="display text-4xl sm:text-6xl">{t("featuredTitle")}</h2>
          <Link
            href="/shop"
            className="hidden text-xs uppercase tracking-widest text-paper-dim transition-colors hover:text-acid sm:block"
          >
            {t("ctaShop")} →
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
