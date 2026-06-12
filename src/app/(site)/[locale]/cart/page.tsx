"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/money";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, remove, totalCents } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="display mb-10 text-5xl sm:text-7xl">{t("title")}</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-paper-dim">{t("empty")}</p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink"
          >
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-paper/10 border-y border-paper/10">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-4 py-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-paper/10 bg-ink-3">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-acid">{item.brandName}</p>
                  <Link href={`/shop/${item.productSlug}`} className="block truncate hover:text-acid">
                    {item.name}
                  </Link>
                  <p className="text-xs text-paper-dim">
                    {t("size")}: {item.size}
                  </p>
                </div>
                <p className="font-bold">{formatPrice(item.priceCents, locale)}</p>
                <button
                  onClick={() => remove(item.variantId)}
                  className="text-xs uppercase tracking-widest text-paper-dim hover:text-danger"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm uppercase tracking-widest text-paper-dim">{t("total")}</p>
            <p className="text-2xl font-bold">{formatPrice(totalCents, locale)}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/shop"
              className="border border-paper/30 px-8 py-4 text-center text-sm uppercase tracking-widest hover:border-acid hover:text-acid"
            >
              {t("continueShopping")}
            </Link>
            <Link
              href="/checkout"
              className="bg-acid px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-ink transition-transform hover:scale-[1.02]"
            >
              {t("checkout")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
