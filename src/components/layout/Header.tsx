"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="display text-2xl tracking-tight hover:text-acid transition-colors">
          STROKE<span className="text-acid">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm uppercase tracking-widest transition-colors hover:text-acid ${
                pathname.startsWith(l.href) ? "text-acid" : "text-paper"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex gap-1 text-xs uppercase tracking-widest">
            {(["it", "en"] as const).map((l) => (
              <Link
                key={l}
                href={pathname}
                locale={l}
                className={`px-1.5 py-0.5 transition-colors ${
                  locale === l ? "bg-acid text-ink font-bold" : "text-paper-dim hover:text-paper"
                }`}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>

          <Link
            href="/cart"
            className="relative flex items-center gap-2 border border-paper/30 px-3 py-1.5 text-sm uppercase tracking-widest transition-colors hover:border-acid hover:text-acid"
          >
            {t("cart")}
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center bg-acid text-xs font-bold text-ink">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-paper text-2xl leading-none"
            aria-label="Menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-paper/10 bg-ink px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-lg uppercase tracking-widest hover:text-acid"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
