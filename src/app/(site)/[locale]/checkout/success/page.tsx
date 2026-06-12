import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { order } = await searchParams;
  const t = await getTranslations("checkout");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <ClearCartOnMount />
      <p className="text-6xl">✓</p>
      <h1 className="display mt-6 text-4xl text-acid sm:text-6xl">{t("successTitle")}</h1>
      {order && (
        <p className="mt-6 text-sm uppercase tracking-widest text-paper-dim">
          {t("successOrder")}: <span className="font-bold text-paper">{order}</span>
        </p>
      )}
      <p className="mx-auto mt-6 max-w-md text-paper-dim">{t("successText")}</p>
      <Link
        href="/shop"
        className="mt-10 inline-block border border-paper/30 px-8 py-4 text-sm uppercase tracking-widest hover:border-acid hover:text-acid"
      >
        {tc("backToShop")}
      </Link>
    </div>
  );
}
