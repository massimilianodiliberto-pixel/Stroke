import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const tLegal = await getTranslations("legal");

  return (
    <footer className="border-t border-paper/10 bg-ink-2">
      <div className="stroke-stripe" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="wordmark stroke-gradient-text text-[18vw] leading-none opacity-25 select-none md:text-[10rem]">
          stroke
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-paper-dim">
          streetwear &amp; boards shop — since &rsquo;03
        </p>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 text-sm text-paper-dim">
            <p>Stroke Shop — Salò (BS), Lago di Garda</p>
            <p>
              <a
                href="https://www.instagram.com/strokeshop"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-acid"
              >
                Instagram
              </a>
              {" · "}
              <a
                href="https://www.facebook.com/strokeshop"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-acid"
              >
                Facebook
              </a>
            </p>
          </div>

          <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-paper-dim">
            <Link href="/legal/privacy" className="hover:text-acid">
              {tLegal("privacy")}
            </Link>
            <Link href="/legal/terms" className="hover:text-acid">
              {tLegal("terms")}
            </Link>
            <Link href="/legal/returns" className="hover:text-acid">
              {tLegal("returns")}
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper-dim md:flex-row md:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p>{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
