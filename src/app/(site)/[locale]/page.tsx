import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/home/Hero";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { Reveal } from "@/components/home/Reveal";
import { getFeaturedProducts, getPublishedBrandNames } from "@/lib/catalog";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [featured, brands] = await Promise.all([
    getFeaturedProducts(8),
    getPublishedBrandNames(),
  ]);

  return (
    <>
      <Hero />
      <BrandMarquee brands={brands} />
      <FeaturedGrid products={featured} />

      <section className="border-t border-paper/10 bg-ink-2">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <h2 className="display max-w-3xl text-5xl sm:text-7xl">{t("storyTitle")}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-lg text-paper-dim">{t("storyText")}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl border-l-2 border-acid pl-4 text-sm text-paper-dim">
              {t("reservationNote")}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/about"
              className="mt-10 inline-block border border-paper/30 px-8 py-4 text-sm uppercase tracking-widest transition-colors hover:border-acid hover:text-acid"
            >
              {t("storyCta")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
