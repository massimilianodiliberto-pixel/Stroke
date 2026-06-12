"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-4 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(215,255,63,0.08), transparent), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(63,140,255,0.06), transparent)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-4 text-xs uppercase tracking-[0.4em] text-acid sm:text-sm"
        >
          {t("heroSince")}
        </motion.p>

        <h1 className="display select-none">
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="block text-[20vw] leading-[0.85] md:text-[12rem]"
          >
            {t("heroLine1")}
          </motion.span>
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="outline-text block text-[20vw] leading-[0.85] md:text-[12rem]"
          >
            {t("heroLine2")}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 max-w-xl text-base text-paper-dim sm:text-lg"
        >
          {t("heroSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href="/shop"
            className="bg-acid px-8 py-4 text-sm font-bold uppercase tracking-widest text-ink transition-transform hover:scale-[1.03]"
          >
            {t("ctaShop")}
          </Link>
          <Link
            href="/about"
            className="border border-paper/30 px-8 py-4 text-sm uppercase tracking-widest transition-colors hover:border-acid hover:text-acid"
          >
            {t("ctaStory")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
