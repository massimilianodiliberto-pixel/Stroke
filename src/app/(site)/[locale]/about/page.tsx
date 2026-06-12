import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/home/Reveal";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tContact = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Reveal>
        <h1 className="display text-6xl sm:text-8xl">{t("title")}</h1>
      </Reveal>

      <div className="mt-12 space-y-8 text-lg leading-relaxed text-paper-dim">
        <Reveal delay={0.1}>
          <p className="border-l-2 border-acid pl-6 text-xl text-paper">{t("p1")}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <p>{t("p2")}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <p>{t("p3")}</p>
        </Reveal>
      </div>

      <Reveal delay={0.25}>
        <div className="mt-16 border border-paper/15 bg-ink-2 p-8">
          <h2 className="display text-3xl sm:text-4xl">{t("visitTitle")}</h2>
          <p className="mt-4 text-paper-dim">{t("visitText")}</p>
          <Link
            href="/contact"
            className="mt-6 inline-block bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink"
          >
            {tContact("title")}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
