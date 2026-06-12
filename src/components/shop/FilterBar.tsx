"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Facets {
  brands: { name: string; slug: string }[];
  categories: { slug: string; nameIt: string; nameEn: string }[];
  sizes: string[];
}

export function FilterBar({ facets }: { facets: Facets }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const hasFilters =
    !!searchParams.get("brand") ||
    !!searchParams.get("category") ||
    !!searchParams.get("size") ||
    !!searchParams.get("season") ||
    !!searchParams.get("q");

  const selectClass =
    "bg-ink-2 border border-paper/20 px-3 py-2 text-sm text-paper focus:border-acid focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={q}
        placeholder={t("search")}
        onChange={(e) => {
          setQ(e.target.value);
          if (debounce.current) clearTimeout(debounce.current);
          const value = e.target.value;
          debounce.current = setTimeout(() => setParam("q", value), 350);
        }}
        className={`${selectClass} w-44`}
      />

      <select
        value={searchParams.get("brand") ?? ""}
        onChange={(e) => setParam("brand", e.target.value)}
        className={selectClass}
        aria-label={t("filterBrand")}
      >
        <option value="">{t("filterBrand")}: {t("all")}</option>
        {facets.brands.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
        className={selectClass}
        aria-label={t("filterCategory")}
      >
        <option value="">{t("filterCategory")}: {t("all")}</option>
        {facets.categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {locale === "it" ? c.nameIt : c.nameEn}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("size") ?? ""}
        onChange={(e) => setParam("size", e.target.value)}
        className={selectClass}
        aria-label={t("filterSize")}
      >
        <option value="">{t("filterSize")}: {t("all")}</option>
        {facets.sizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("season") ?? ""}
        onChange={(e) => setParam("season", e.target.value)}
        className={selectClass}
        aria-label={t("filterSeason")}
      >
        <option value="">{t("filterSeason")}: {t("all")}</option>
        <option value="summer">{t("seasonSummer")}</option>
        <option value="winter">{t("seasonWinter")}</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => {
            setQ("");
            router.replace(pathname, { scroll: false });
          }}
          className="text-xs uppercase tracking-widest text-acid hover:underline"
        >
          {t("clearFilters")}
        </button>
      )}
    </div>
  );
}
