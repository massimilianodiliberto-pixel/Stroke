import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { env } from "@/env";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const staticPaths = ["", "/shop", "/about", "/contact"];

  const entries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const products = await db.product.findMany({
    where: { status: "PUBLISHED", images: { some: {} } },
    select: { slug: true, updatedAt: true },
  });

  for (const locale of routing.locales) {
    for (const p of products) {
      entries.push({
        url: `${base}/${locale}/shop/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  return entries;
}
