/* Seed demo: 18 prodotti streetwear realistici con placeholder SVG,
   varianti "un pezzo per taglia" (alcune esaurite) e un ordine di prova. */
import { PrismaClient, Season } from "@prisma/client";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const db = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SEED_DIR = path.join(process.cwd(), "public", "seed");

function makePlaceholder(filename: string, brand: string, name: string, bg: string, fg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="${bg}"/>
  <rect x="40" y="40" width="720" height="920" fill="none" stroke="${fg}" stroke-width="3" opacity="0.5"/>
  <text x="60" y="180" font-family="Arial Black, Arial, sans-serif" font-size="64" font-weight="900" fill="${fg}" opacity="0.95">${brand.toUpperCase()}</text>
  <text x="60" y="250" font-family="Arial, sans-serif" font-size="34" fill="${fg}" opacity="0.7">${name}</text>
  <text x="60" y="900" font-family="Arial Black, Arial, sans-serif" font-size="40" font-weight="900" fill="${fg}" opacity="0.35">STROKE — SALÒ</text>
  <circle cx="650" cy="780" r="90" fill="none" stroke="${fg}" stroke-width="3" opacity="0.4"/>
  <text x="650" y="795" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="44" font-weight="900" fill="${fg}" opacity="0.6">✦</text>
</svg>`;
  writeFileSync(path.join(SEED_DIR, filename), svg);
}

interface SeedProduct {
  brand: string;
  category: { slug: string; it: string; en: string };
  name: string;
  price: number; // euro
  purchase: number;
  season: Season;
  year: number;
  featured?: boolean;
  descIt: string;
  descEn: string;
  sizes: Record<string, number>;
  colors: [string, string]; // [bg, fg]
}

const CATEGORIES = {
  tee: { slug: "t-shirt", it: "T-Shirt", en: "T-Shirts" },
  hoodie: { slug: "felpe", it: "Felpe", en: "Hoodies" },
  shorts: { slug: "short", it: "Short", en: "Shorts" },
  pants: { slug: "pantaloni", it: "Pantaloni", en: "Pants" },
  jacket: { slug: "giacche", it: "Giacche", en: "Jackets" },
  cap: { slug: "cappelli", it: "Cappelli", en: "Caps" },
  shoes: { slug: "scarpe", it: "Scarpe", en: "Shoes" },
} as const;

const PRODUCTS: SeedProduct[] = [
  { brand: "Carhartt WIP", category: CATEGORIES.hoodie, name: "Chase Hoodie Black", price: 99, purchase: 52, season: Season.WINTER, year: 2025, featured: true, descIt: "La felpa con cappuccio iconica di Carhartt WIP, cotone pesante e logo ricamato.", descEn: "Carhartt WIP's iconic hoodie, heavyweight cotton with embroidered logo.", sizes: { S: 1, M: 1, L: 1, XL: 0 }, colors: ["#1c1c1e", "#f2f0ea"] },
  { brand: "Carhartt WIP", category: CATEGORIES.pants, name: "Single Knee Pant Hamilton Brown", price: 119, purchase: 61, season: Season.ALL, year: 2025, featured: true, descIt: "Il work pant per eccellenza, tela resistente e taglio dritto.", descEn: "The definitive work pant: tough canvas, straight fit.", sizes: { "30": 1, "32": 1, "34": 0 }, colors: ["#6b4f2e", "#f2f0ea"] },
  { brand: "Carhartt WIP", category: CATEGORIES.tee, name: "Pocket Tee White", price: 35, purchase: 17, season: Season.SUMMER, year: 2026, descIt: "T-shirt con taschino, un classico che non sbaglia mai.", descEn: "Pocket tee, a classic that never misses.", sizes: { S: 1, M: 0, L: 1, XL: 1 }, colors: ["#e8e6df", "#1c1c1e"] },
  { brand: "Dickies", category: CATEGORIES.pants, name: "874 Work Pant Charcoal", price: 75, purchase: 36, season: Season.ALL, year: 2025, featured: true, descIt: "Il pantalone 874 originale dal 1967: indistruttibile.", descEn: "The original 874 work pant since 1967: indestructible.", sizes: { "30": 1, "32": 1, "34": 1, "36": 0 }, colors: ["#3a3a3c", "#f2f0ea"] },
  { brand: "Dickies", category: CATEGORIES.shorts, name: "Slim Fit Short 13\" Khaki", price: 55, purchase: 26, season: Season.SUMMER, year: 2026, descIt: "Short da lavoro slim, perfetto per l'estate sul lago.", descEn: "Slim work short, perfect for summer at the lake.", sizes: { "30": 1, "32": 0, "34": 1 }, colors: ["#b59e74", "#1c1c1e"] },
  { brand: "Obey", category: CATEGORIES.tee, name: "Bold Logo Tee Pigment Black", price: 45, purchase: 21, season: Season.SUMMER, year: 2026, descIt: "Logo Obey bold su tintura pigment, vestibilità boxy.", descEn: "Bold Obey logo on pigment dye, boxy fit.", sizes: { S: 0, M: 1, L: 1 }, colors: ["#252527", "#d7ff3f"] },
  { brand: "Obey", category: CATEGORIES.cap, name: "Icon 6 Panel Cap", price: 39, purchase: 18, season: Season.ALL, year: 2025, descIt: "Six panel con icona ricamata, regolabile.", descEn: "Six panel with embroidered icon, adjustable strap.", sizes: { UNI: 1 }, colors: ["#2c2c2e", "#f2f0ea"] },
  { brand: "HUF", category: CATEGORIES.hoodie, name: "Triple Triangle Hoodie Grey", price: 95, purchase: 47, season: Season.WINTER, year: 2025, descIt: "Felpa HUF con il classico triple triangle sul petto.", descEn: "HUF hoodie with the classic triple triangle chest print.", sizes: { M: 1, L: 0, XL: 1 }, colors: ["#7a7a7e", "#1c1c1e"] },
  { brand: "HUF", category: CATEGORIES.tee, name: "Plantlife Tee", price: 42, purchase: 20, season: Season.SUMMER, year: 2026, descIt: "La grafica Plantlife più famosa di HUF.", descEn: "HUF's most famous Plantlife graphic.", sizes: { S: 1, M: 1, L: 1 }, colors: ["#1f3d2b", "#d7ff3f"] },
  { brand: "Vans", category: CATEGORIES.shoes, name: "Old Skool Black White", price: 85, purchase: 42, season: Season.ALL, year: 2025, featured: true, descIt: "Le Old Skool: la sidestripe che ha fatto la storia dello skate.", descEn: "The Old Skool: the sidestripe that made skate history.", sizes: { "41": 1, "42": 1, "43": 0, "44": 1 }, colors: ["#0a0a0a", "#f2f0ea"] },
  { brand: "Vans", category: CATEGORIES.shoes, name: "Sk8-Hi Navy", price: 95, purchase: 47, season: Season.ALL, year: 2025, descIt: "Il modello alto di Vans, supporto e stile da sempre.", descEn: "Vans' high top, support and style forever.", sizes: { "42": 1, "43": 1, "44": 0 }, colors: ["#1e2a4a", "#f2f0ea"] },
  { brand: "Dolly Noire", category: CATEGORIES.tee, name: "Bench Logo Tee", price: 45, purchase: 22, season: Season.SUMMER, year: 2026, featured: true, descIt: "Streetwear milanese: grafica bench logo su cotone organico.", descEn: "Milanese streetwear: bench logo graphic on organic cotton.", sizes: { S: 1, M: 1, L: 1, XL: 1 }, colors: ["#101012", "#c9b8ff"] },
  { brand: "Dolly Noire", category: CATEGORIES.jacket, name: "Ripstop Cargo Jacket", price: 129, purchase: 64, season: Season.WINTER, year: 2025, descIt: "Giacca cargo in ripstop con tasche utility.", descEn: "Ripstop cargo jacket with utility pockets.", sizes: { M: 1, L: 1 }, colors: ["#2f3a2f", "#f2f0ea"] },
  { brand: "Iuter", category: CATEGORIES.hoodie, name: "Logo Hoodie Bordeaux", price: 89, purchase: 44, season: Season.WINTER, year: 2025, descIt: "Il logo Iuter ricamato, made in Milano dal 2002 — come noi.", descEn: "Embroidered Iuter logo, made in Milan since 2002 — just like us.", sizes: { S: 1, M: 0, L: 1 }, colors: ["#5a1f2b", "#f2f0ea"] },
  { brand: "Iuter", category: CATEGORIES.tee, name: "Doubleface Tee", price: 39, purchase: 19, season: Season.SUMMER, year: 2026, descIt: "Stampa fronte/retro, cotone pesante 240gsm.", descEn: "Front/back print, heavyweight 240gsm cotton.", sizes: { M: 1, L: 1, XL: 1 }, colors: ["#17171a", "#ff8a3d"] },
  { brand: "Butter Goods", category: CATEGORIES.pants, name: "Wide Leg Pant Washed Black", price: 109, purchase: 54, season: Season.ALL, year: 2026, featured: true, descIt: "Il wide leg australiano che sta spaccando: taglio ampio, lavaggio vintage.", descEn: "The Australian wide leg everyone wants: loose cut, vintage wash.", sizes: { "30": 1, "32": 1, "34": 1 }, colors: ["#26262a", "#9fd8a3"] },
  { brand: "Santa Cruz", category: CATEGORIES.tee, name: "Screaming Hand Tee", price: 40, purchase: 19, season: Season.SUMMER, year: 2026, descIt: "La Screaming Hand di Jim Phillips, dal 1985 un'icona.", descEn: "Jim Phillips' Screaming Hand, an icon since 1985.", sizes: { S: 1, M: 1, L: 0, XL: 1 }, colors: ["#0a318f", "#ffd23f"] },
  { brand: "Rains", category: CATEGORIES.jacket, name: "Long Jacket Black", price: 119, purchase: 59, season: Season.WINTER, year: 2025, descIt: "L'impermeabile danese minimale, perfetto per il lago d'inverno.", descEn: "The minimal Danish raincoat, perfect for the lake in winter.", sizes: { S: 1, M: 1, L: 1 }, colors: ["#0d0d0f", "#8ab8c9"] },
];

async function main() {
  mkdirSync(SEED_DIR, { recursive: true });

  console.log("Pulizia tabelle…");
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.productImage.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.brand.deleteMany();
  await db.importSession.deleteMany();

  console.log("Creazione prodotti…");
  for (const p of PRODUCTS) {
    const brand = await db.brand.upsert({
      where: { name: p.brand },
      create: { name: p.brand, slug: slugify(p.brand) },
      update: {},
    });
    const category = await db.category.upsert({
      where: { slug: p.category.slug },
      create: { slug: p.category.slug, nameIt: p.category.it, nameEn: p.category.en },
      update: {},
    });

    const slug = slugify(`${p.brand} ${p.name}`);
    const filename = `${slug}.svg`;
    makePlaceholder(filename, p.brand, p.name, p.colors[0], p.colors[1]);

    await db.product.create({
      data: {
        slug,
        name: p.name,
        brandId: brand.id,
        categoryId: category.id,
        priceCents: p.price * 100,
        purchasePriceCents: p.purchase * 100,
        vatRate: 22,
        season: p.season,
        year: p.year,
        status: "PUBLISHED",
        featured: p.featured ?? false,
        importKey: `${slugify(p.brand)}::${slugify(p.name)}`,
        excelQty: Object.values(p.sizes).reduce((a, b) => a + b, 0),
        descriptionIt: p.descIt,
        descriptionEn: p.descEn,
        images: { create: [{ url: `/seed/${filename}`, alt: `${p.brand} ${p.name}`, position: 0 }] },
        variants: {
          create: Object.entries(p.sizes).map(([size, quantity]) => ({ size, quantity })),
        },
      },
    });
  }

  console.log("Ordine demo…");
  const demoVariant = await db.productVariant.findFirst({
    where: { quantity: { gt: 0 } },
    include: { product: { include: { brand: true, images: true } } },
  });
  if (demoVariant) {
    await db.productVariant.update({
      where: { id: demoVariant.id },
      data: { quantity: { decrement: 1 } },
    });
    await db.order.create({
      data: {
        orderNumber: "STK-DEMO01",
        status: "PENDING_REVIEW",
        paymentMode: "MANUAL",
        customerName: "Mario Rossi",
        email: "mario.rossi@example.com",
        phone: "+39 333 1234567",
        pickupInStore: true,
        locale: "it",
        totalCents: demoVariant.product.priceCents,
        customerNote: "Passo sabato pomeriggio, grazie!",
        items: {
          create: [
            {
              variantId: demoVariant.id,
              productName: demoVariant.product.name,
              brandName: demoVariant.product.brand.name,
              size: demoVariant.size,
              priceCents: demoVariant.product.priceCents,
              imageUrl: demoVariant.product.images[0]?.url ?? null,
            },
          ],
        },
      },
    });
  }

  const count = await db.product.count();
  console.log(`Fatto: ${count} prodotti, 1 ordine demo (STK-DEMO01).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
