import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { getProductBySlug } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { env } from "@/env";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = `${product.brand.name} ${product.name}`;
  return {
    title,
    openGraph: {
      title,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("product");
  const tc = await getTranslations("common");
  const description = locale === "it" ? product.descriptionIt : (product.descriptionEn ?? product.descriptionIt);
  const available = product.variants.some((v) => v.quantity > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand.name} ${product.name}`,
    brand: { "@type": "Brand", name: product.brand.name },
    image: product.images.map((i) => `${env.NEXT_PUBLIC_SITE_URL}${i.url}`),
    description: description ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${env.NEXT_PUBLIC_SITE_URL}/${locale}/shop/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/shop" className="text-xs uppercase tracking-widest text-paper-dim hover:text-acid">
        ← {tc("backToShop")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          {product.images.map((image, i) => (
            <div key={i} className="relative aspect-[4/5] overflow-hidden border border-paper/10 bg-ink-3">
              <Image
                src={image.url}
                alt={image.alt ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm uppercase tracking-widest text-acid">{product.brand.name}</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-bold">{formatPrice(product.priceCents, locale)}</p>
            <p className="text-xs text-paper-dim">{t("vatIncluded")}</p>
          </div>

          {description && <p className="mt-6 text-paper-dim">{description}</p>}

          <div className="mt-4 flex gap-4 text-xs uppercase tracking-widest text-paper-dim">
            {product.category && (
              <span>{locale === "it" ? product.category.nameIt : product.category.nameEn}</span>
            )}
            {product.season !== "ALL" && (
              <span>
                {t("season")}: {product.season === "SUMMER" ? "Summer" : "Winter"}
                {product.year ? ` ${product.year}` : ""}
              </span>
            )}
          </div>

          <div className="mt-8">
            {available ? (
              <ProductPurchase
                variants={product.variants}
                product={{
                  slug: product.slug,
                  name: product.name,
                  brandName: product.brand.name,
                  priceCents: product.priceCents,
                  imageUrl: product.images[0]?.url ?? null,
                }}
              />
            ) : (
              <p className="border border-danger/40 px-4 py-3 text-sm uppercase tracking-widest text-danger">
                {tc("soldOut")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
