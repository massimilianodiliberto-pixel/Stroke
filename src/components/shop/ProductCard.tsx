import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/money";
import type { PublicProduct } from "@/lib/catalog";

export function ProductCard({ product }: { product: PublicProduct }) {
  const locale = useLocale();
  const image = product.images[0];
  const available = product.variants.some((v) => v.quantity > 0);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block border border-paper/10 bg-ink-2 transition-colors hover:border-acid/60"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
        {image && (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!available && (
          <span className="absolute left-2 top-2 bg-ink/90 px-2 py-1 text-[10px] uppercase tracking-widest text-danger">
            {locale === "it" ? "Esaurito" : "Sold out"}
          </span>
        )}
        {product.featured && available && (
          <span className="absolute left-2 top-2 bg-acid px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
            ★
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-[11px] uppercase tracking-widest text-acid">{product.brand.name}</p>
        <p className="truncate text-sm text-paper">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">{formatPrice(product.priceCents, locale)}</p>
          <p className="text-[11px] text-paper-dim">
            {product.variants
              .filter((v) => v.quantity > 0)
              .map((v) => v.size)
              .join(" · ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
