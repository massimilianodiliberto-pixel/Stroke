import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="display text-[8rem] leading-none text-acid sm:text-[14rem]">{t("title")}</h1>
      <p className="mt-6 text-paper-dim">{t("text")}</p>
      <Link
        href="/"
        className="mt-10 border border-paper/30 px-8 py-4 text-sm uppercase tracking-widest hover:border-acid hover:text-acid"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
