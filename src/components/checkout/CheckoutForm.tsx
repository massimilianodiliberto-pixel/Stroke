"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/money";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { items, totalCents, clear } = useCart();
  const [pickup, setPickup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full bg-ink-2 border border-paper/20 px-4 py-3 text-paper placeholder:text-paper/30 focus:border-acid focus:outline-none";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      locale,
      pickupInStore: pickup,
      customerName: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone") || null,
      shippingLine1: pickup ? null : form.get("address"),
      shippingCity: pickup ? null : form.get("city"),
      shippingZip: pickup ? null : form.get("zip"),
      shippingCountry: pickup ? "IT" : form.get("country") || "IT",
      customerNote: form.get("note") || null,
      items: items.map((i) => ({ variantId: i.variantId })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.code === "OUT_OF_STOCK" ? t("errorStock") : t("errorGeneric"));
        setSubmitting(false);
        return;
      }

      if (data.stripeUrl) {
        clear();
        window.location.href = data.stripeUrl;
      } else {
        clear();
        router.push(`/checkout/success?order=${data.orderNumber}`);
      }
    } catch {
      setError(t("errorGeneric"));
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="py-12 text-paper-dim">{t("subtitle")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input name="name" required placeholder={t("name")} className={inputClass} />
      <input name="email" type="email" required placeholder={t("email")} className={inputClass} />
      <input name="phone" type="tel" placeholder={t("phone")} className={inputClass} />

      <div className="flex flex-col gap-2 border border-paper/15 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="radio"
            name="delivery"
            checked={!pickup}
            onChange={() => setPickup(false)}
            className="accent-[#d7ff3f]"
          />
          {t("shipping")}
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="radio"
            name="delivery"
            checked={pickup}
            onChange={() => setPickup(true)}
            className="accent-[#d7ff3f]"
          />
          {t("pickup")}
        </label>
      </div>

      {!pickup && (
        <div className="space-y-5">
          <input name="address" required placeholder={t("address")} className={inputClass} />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" required placeholder={t("city")} className={inputClass} />
            <input name="zip" required placeholder={t("zip")} className={inputClass} />
          </div>
          <input name="country" defaultValue="IT" placeholder={t("country")} className={inputClass} />
        </div>
      )}

      <textarea name="note" rows={3} placeholder={t("note")} className={inputClass} />

      <p className="border-l-2 border-acid pl-3 text-xs text-paper-dim">{t("payNote")}</p>

      {error && <p className="border border-danger/50 px-4 py-3 text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
      >
        {submitting ? t("submitting") : `${t("submit")} — ${formatPrice(totalCents, locale)}`}
      </button>
    </form>
  );
}
