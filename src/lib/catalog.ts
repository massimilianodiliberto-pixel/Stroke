import { Prisma, Season } from "@prisma/client";
import { db } from "./db";

// Select pubblica esplicita: purchasePriceCents NON è incluso e non può
// trapelare nelle props delle pagine pubbliche.
export const publicProductSelect = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  season: true,
  year: true,
  featured: true,
  descriptionIt: true,
  descriptionEn: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { slug: true, nameIt: true, nameEn: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" as const } },
  variants: {
    select: { id: true, size: true, quantity: true },
    orderBy: { id: "asc" as const },
  },
} satisfies Prisma.ProductSelect;

export type PublicProduct = Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>;

export interface CatalogFilters {
  brand?: string;
  category?: string;
  size?: string;
  season?: string;
  q?: string;
}

function whereFor(filters: CatalogFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    images: { some: {} },
  };
  if (filters.brand) where.brand = { slug: filters.brand };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.size) where.variants = { some: { size: filters.size, quantity: { gt: 0 } } };
  if (filters.season === "summer") where.season = Season.SUMMER;
  if (filters.season === "winter") where.season = Season.WINTER;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { brand: { name: { contains: filters.q } } },
    ];
  }
  return where;
}

export async function queryProducts(filters: CatalogFilters) {
  return db.product.findMany({
    where: whereFor(filters),
    select: publicProductSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { status: "PUBLISHED", images: { some: {} } },
    select: publicProductSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: publicProductSelect,
  });
}

/** Facet per la barra filtri: solo valori effettivamente presenti a catalogo. */
export async function getCatalogFacets() {
  const [brands, categories, sizes] = await Promise.all([
    db.brand.findMany({
      where: { products: { some: { status: "PUBLISHED", images: { some: {} } } } },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    db.category.findMany({
      where: { products: { some: { status: "PUBLISHED", images: { some: {} } } } },
      select: { slug: true, nameIt: true, nameEn: true },
      orderBy: { nameIt: "asc" },
    }),
    db.productVariant.findMany({
      where: { quantity: { gt: 0 }, product: { status: "PUBLISHED", images: { some: {} } } },
      select: { size: true },
      distinct: ["size"],
    }),
  ]);

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
  const sortedSizes = sizes
    .map((s) => s.size)
    .sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });

  return { brands, categories, sizes: sortedSizes };
}

export async function getPublishedBrandNames() {
  const brands = await db.brand.findMany({
    where: { products: { some: { status: "PUBLISHED" } } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return brands.map((b) => b.name);
}
