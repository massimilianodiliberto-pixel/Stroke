import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="display text-5xl sm:text-7xl">{t("title")}</h1>
      <p className="mt-4 mb-10 text-paper-dim">{t("subtitle")}</p>
      <CheckoutForm />
    </div>
  );
}
