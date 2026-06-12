import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="display text-6xl sm:text-8xl">{t("title")}</h1>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-acid">{t("address")}</h2>
            <p className="mt-2 text-lg">
              Stroke Shop
              <br />
              Salò (BS) — {t("mapNote")}
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest text-acid">{t("hours")}</h2>
            <p className="mt-2 text-lg">{t("hoursValue")}</p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest text-acid">{t("social")}</h2>
            <div className="mt-2 flex gap-4 text-lg">
              <a
                href="https://www.instagram.com/strokeshop"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-acid underline-offset-4 hover:text-acid"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/strokeshop"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-acid underline-offset-4 hover:text-acid"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border border-paper/15">
          <iframe
            title="Stroke Shop — Salò"
            src="https://www.openstreetmap.org/export/embed.html?bbox=10.5085%2C45.5965%2C10.5485%2C45.6165&layer=mapnik&marker=45.6065%2C10.5285"
            className="h-80 w-full md:h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
