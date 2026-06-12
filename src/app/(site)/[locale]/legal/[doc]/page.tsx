import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";

const DOCS = ["privacy", "terms", "returns"] as const;
type Doc = (typeof DOCS)[number];

export function generateStaticParams() {
  return DOCS.map((doc) => ({ doc }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; doc: string }>;
}) {
  const { locale, doc } = await params;
  setRequestLocale(locale);
  if (!DOCS.includes(doc as Doc)) notFound();
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="display text-5xl sm:text-6xl">{t(doc as Doc)}</h1>
      <p className="mt-8 text-paper-dim">{t("placeholder")}</p>
    </div>
  );
}
