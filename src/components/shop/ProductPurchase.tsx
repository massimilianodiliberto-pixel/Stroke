"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";

interface Variant {
  id: string;
  size: string;
  quantity: number;
}

export function ProductPurchase({
  variants,
  product,
}: {
  variants: Variant[];
  product: {
    slug: string;
    name: string;
    brandName: string;
    priceCents: number;
    imageUrl: string | null;
  };
}) {
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const router = useRouter();
  const { add, items } = useCart();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selected);
  const inCart = (id: string) => items.some((i) => i.variantId === id);

  function handleAdd() {
    if (!selectedVariant) return;
    add({
      variantId: selectedVariant.id,
      productSlug: product.slug,
      name: product.name,
      brandName: product.brandName,
      size: selectedVariant.size,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
    });
    setFeedback(true);
    setTimeout(() => router.push("/cart"), 600);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-paper-dim">{t("selectSize")}</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const out = v.quantity <= 0 || inCart(v.id);
            return (
              <button
                key={v.id}
                disabled={out}
                onClick={() => setSelected(v.id)}
                className={`min-w-12 border px-4 py-3 text-sm font-bold transition-colors ${
                  out
                    ? "cursor-not-allowed border-paper/10 text-paper/25 line-through"
                    : selected === v.id
                      ? "border-acid bg-acid text-ink"
                      : "border-paper/30 text-paper hover:border-acid"
                }`}
              >
                {v.size}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-paper-dim">{t("onePerSize")}</p>
      </div>

      <button
        onClick={handleAdd}
        disabled={!selectedVariant || feedback}
        className="w-full bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-opacity disabled:opacity-40"
      >
        {feedback ? t("added") + " ✓" : tc("addToCart")}
      </button>

      <p className="border-l-2 border-acid pl-3 text-xs text-paper-dim">{t("reservationInfo")}</p>
    </div>
  );
}
