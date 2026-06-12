"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Season } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseEuroToCents } from "@/lib/money";
import { importKeyFor, slugify } from "@/lib/slug";

const productSchema = z.object({
  name: z.string().trim().min(1, "Nome obbligatorio"),
  brandName: z.string().trim().min(1, "Brand obbligatorio"),
  categoryName: z.string().trim().optional().default(""),
  price: z.string().min(1, "Prezzo obbligatorio"),
  purchasePrice: z.string().optional().default(""),
  vatRate: z.coerce.number().int().min(0).max(40).default(22),
  season: z.nativeEnum(Season).default(Season.ALL),
  year: z.string().optional().default(""),
  descriptionIt: z.string().optional().default(""),
  descriptionEn: z.string().optional().default(""),
  featured: z.coerce.boolean().default(false),
});

async function upsertBrandAndCategory(brandName: string, categoryName: string) {
  const brand = await db.brand.upsert({
    where: { name: brandName },
    create: { name: brandName, slug: slugify(brandName) },
    update: {},
  });
  let categoryId: string | null = null;
  if (categoryName) {
    const catSlug = slugify(categoryName);
    const category = await db.category.upsert({
      where: { slug: catSlug },
      create: { slug: catSlug, nameIt: categoryName, nameEn: categoryName },
      update: {},
    });
    categoryId = category.id;
  }
  return { brandId: brand.id, categoryId };
}

function parseFields(formData: FormData) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message } as const;
  }
  const priceCents = parseEuroToCents(parsed.data.price);
  if (!priceCents || priceCents <= 0) return { error: "Prezzo non valido" } as const;
  const purchasePriceCents = parsed.data.purchasePrice
    ? parseEuroToCents(parsed.data.purchasePrice)
    : null;
  const year = parsed.data.year ? Number(parsed.data.year) : null;
  return { data: { ...parsed.data, priceCents, purchasePriceCents, year } } as const;
}

export async function createProduct(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const result = parseFields(formData);
  if ("error" in result) return { error: result.error };
  const d = result.data;

  const { brandId, categoryId } = await upsertBrandAndCategory(d.brandName, d.categoryName);

  let slug = slugify(`${d.brandName} ${d.name}`);
  if (await db.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }
  const importKey = importKeyFor(d.brandName, d.name);
  const keyTaken = await db.product.findUnique({ where: { importKey } });

  const product = await db.product.create({
    data: {
      slug,
      name: d.name,
      brandId,
      categoryId,
      priceCents: d.priceCents,
      purchasePriceCents: d.purchasePriceCents,
      vatRate: d.vatRate,
      season: d.season,
      year: d.year,
      descriptionIt: d.descriptionIt || null,
      descriptionEn: d.descriptionEn || null,
      featured: d.featured,
      importKey: keyTaken ? null : importKey,
      status: "DRAFT",
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProduct(productId: string, _prev: unknown, formData: FormData) {
  await requireAdmin();
  const result = parseFields(formData);
  if ("error" in result) return { error: result.error };
  const d = result.data;

  const { brandId, categoryId } = await upsertBrandAndCategory(d.brandName, d.categoryName);

  await db.product.update({
    where: { id: productId },
    data: {
      name: d.name,
      brandId,
      categoryId,
      priceCents: d.priceCents,
      purchasePriceCents: d.purchasePriceCents,
      vatRate: d.vatRate,
      season: d.season,
      year: d.year,
      descriptionIt: d.descriptionIt || null,
      descriptionEn: d.descriptionEn || null,
      featured: d.featured,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setProductStatus(productId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  await requireAdmin();

  if (status === "PUBLISHED") {
    const product = await db.product.findUniqueOrThrow({
      where: { id: productId },
      include: { images: true, variants: true },
    });
    if (product.images.length === 0) {
      return { error: "Aggiungi almeno una foto prima di pubblicare" };
    }
    if (product.variants.length === 0) {
      return { error: "Aggiungi almeno una taglia prima di pubblicare" };
    }
  }

  await db.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setVariants(
  productId: string,
  variants: { size: string; quantity: number }[],
) {
  await requireAdmin();

  const clean = variants
    .map((v) => ({ size: v.size.trim().toUpperCase(), quantity: Math.max(0, Math.round(v.quantity)) }))
    .filter((v) => v.size.length > 0);

  const existing = await db.productVariant.findMany({ where: { productId } });
  const keepSizes = new Set(clean.map((v) => v.size));

  await db.$transaction(async (tx) => {
    for (const v of existing) {
      if (!keepSizes.has(v.size)) {
        // Niente delete: le varianti possono essere referenziate da ordini.
        await tx.productVariant.update({ where: { id: v.id }, data: { quantity: 0 } });
      }
    }
    for (const v of clean) {
      await tx.productVariant.upsert({
        where: { productId_size: { productId, size: v.size } },
        create: { productId, size: v.size, quantity: v.quantity },
        update: { quantity: v.quantity },
      });
    }
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const image = await db.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${image.productId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}
