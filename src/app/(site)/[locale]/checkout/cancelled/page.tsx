import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CheckoutCancelledPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const tCart = await getTranslations("cart");

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="display text-4xl text-danger sm:text-6xl">{t("cancelledTitle")}</h1>
      <p className="mx-auto mt-6 max-w-md text-paper-dim">{t("cancelledText")}</p>
      <Link
        href="/cart"
        className="mt-10 inline-block bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink"
      >
        {tCart("title")}
      </Link>
    </div>
  );
}
