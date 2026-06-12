import ExcelJS from "exceljs";
import { z } from "zod";
import { Season } from "@prisma/client";
import { db } from "./db";
import { parseEuroToCents } from "./money";
import { importKeyFor, slugify } from "./slug";

/* ------------------------------------------------------------------ */
/* Mapping intestazioni: il file del negozio è "impreciso", quindi     */
/* riconosciamo sinonimi e ignoriamo accenti/spazi/maiuscole.          */
/* ------------------------------------------------------------------ */

export type ColumnKey =
  | "brand"
  | "category"
  | "name"
  | "purchasePrice"
  | "vat"
  | "price"
  | "quantity"
  | "year"
  | "season";

const HEADER_SYNONYMS: Record<ColumnKey, string[]> = {
  brand: ["brand", "marca", "marchio"],
  category: ["tipologia", "tipologiaprodotto", "tipo", "categoria"],
  name: ["nome", "nomearticolo", "articolo", "descrizione", "modello"],
  purchasePrice: ["prezzoacquisto", "prezzodacquisto", "acquisto", "costo"],
  vat: ["iva", "vat", "aliquota"],
  price: ["prezzovendita", "vendita", "prezzo", "prezzofinale"],
  quantity: ["quantita", "qta", "qty", "pezzi", "q"],
  year: ["anno", "year", "annostagione"],
  season: ["stagione", "season"],
};

const REQUIRED: ColumnKey[] = ["brand", "name", "price"];

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function mapHeaders(headers: string[]): {
  mapping: Partial<Record<ColumnKey, number>>;
  missing: ColumnKey[];
  detected: string[];
} {
  const mapping: Partial<Record<ColumnKey, number>> = {};
  headers.forEach((raw, index) => {
    const norm = normalizeHeader(String(raw ?? ""));
    if (!norm) return;
    for (const [key, synonyms] of Object.entries(HEADER_SYNONYMS) as [ColumnKey, string[]][]) {
      if (mapping[key] !== undefined) continue;
      if (synonyms.some((s) => norm === s || norm.startsWith(s) || s.startsWith(norm))) {
        mapping[key] = index;
        break;
      }
    }
  });
  const missing = REQUIRED.filter((k) => mapping[k] === undefined);
  return { mapping, missing, detected: headers.map((h) => String(h ?? "")) };
}

/* ------------------------------------------------------------------ */
/* Normalizzazione righe                                               */
/* ------------------------------------------------------------------ */

function parseSeason(value: string): Season {
  const v = normalizeHeader(value);
  if (["summer", "estate", "pe", "ss", "primaveraestate"].some((s) => v.includes(s))) {
    return Season.SUMMER;
  }
  if (["winter", "inverno", "ai", "fw", "autunnoinverno"].some((s) => v.includes(s))) {
    return Season.WINTER;
  }
  return Season.ALL;
}

function titleCase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/(^|\s|-)\S/g, (c) => c.toUpperCase());
}

export const importRowSchema = z.object({
  brand: z.string().trim().min(1, "brand mancante"),
  category: z.string().trim().optional().default(""),
  name: z.string().trim().min(1, "nome articolo mancante"),
  priceCents: z.number().int().positive("prezzo vendita non valido"),
  purchasePriceCents: z.number().int().nonnegative().nullable(),
  vatRate: z.number().int().min(0).max(40),
  quantity: z.number().int().nonnegative(),
  year: z.number().int().min(1990).max(2100).nullable(),
  season: z.nativeEnum(Season),
});

export type ImportRow = z.infer<typeof importRowSchema> & { importKey: string };

export interface InvalidRow {
  rowNumber: number;
  raw: string;
  errors: string[];
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
    if ("richText" in value) return value.richText.map((r) => r.text).join("");
    if ("text" in value) return String(value.text);
    if (value instanceof Date) return String(value.getFullYear());
    return "";
  }
  return String(value);
}

function cellNumber(value: ExcelJS.CellValue): number | null {
  if (typeof value === "number") return value;
  const text = cellText(value);
  if (!text.trim()) return null;
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function parseStockFile(buffer: Buffer): Promise<{
  rows: ImportRow[];
  invalid: InvalidRow[];
  headerError?: { missing: ColumnKey[]; detected: string[] };
}> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { rows: [], invalid: [], headerError: { missing: REQUIRED, detected: [] } };

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col - 1] = cellText(cell.value);
  });

  const { mapping, missing, detected } = mapHeaders(headers);
  if (missing.length > 0) {
    return { rows: [], invalid: [], headerError: { missing, detected } };
  }

  const rows: ImportRow[] = [];
  const invalid: InvalidRow[] = [];
  const seen = new Set<string>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (key: ColumnKey): ExcelJS.CellValue =>
      mapping[key] !== undefined ? row.getCell(mapping[key]! + 1).value : null;

    const rawText = headers
      .map((_, i) => cellText(row.getCell(i + 1).value))
      .filter(Boolean)
      .join(" | ");
    if (!rawText.trim()) return;

    const priceRaw = get("price");
    const purchaseRaw = get("purchasePrice");
    const candidate = {
      brand: titleCase(cellText(get("brand"))),
      category: cellText(get("category")).trim(),
      name: cellText(get("name")).trim(),
      priceCents:
        typeof priceRaw === "number"
          ? Math.round(priceRaw * 100)
          : (parseEuroToCents(cellText(priceRaw)) ?? -1),
      purchasePriceCents:
        purchaseRaw === null || cellText(purchaseRaw).trim() === ""
          ? null
          : typeof purchaseRaw === "number"
            ? Math.round(purchaseRaw * 100)
            : parseEuroToCents(cellText(purchaseRaw)),
      vatRate: Math.round(cellNumber(get("vat")) ?? 22),
      quantity: Math.max(0, Math.round(cellNumber(get("quantity")) ?? 0)),
      year: cellNumber(get("year")) ? Math.round(cellNumber(get("year"))!) : null,
      season: parseSeason(cellText(get("season"))),
    };

    const parsed = importRowSchema.safeParse(candidate);
    if (!parsed.success) {
      invalid.push({
        rowNumber,
        raw: rawText.slice(0, 200),
        errors: parsed.error.issues.map((i) => i.message),
      });
      return;
    }

    const importKey = importKeyFor(parsed.data.brand, parsed.data.name);
    if (seen.has(importKey)) {
      invalid.push({ rowNumber, raw: rawText.slice(0, 200), errors: ["riga duplicata nel file"] });
      return;
    }
    seen.add(importKey);
    rows.push({ ...parsed.data, importKey });
  });

  return { rows, invalid };
}

/* ------------------------------------------------------------------ */
/* Diff contro il database                                             */
/* ------------------------------------------------------------------ */

export interface FieldChange {
  field: string;
  from: string;
  to: string;
}

export type DiffEntry =
  | { kind: "NEW"; row: ImportRow }
  | { kind: "UPDATE"; row: ImportRow; productId: string; productName: string; changes: FieldChange[] }
  | { kind: "UNCHANGED"; row: ImportRow; productId: string }
  | { kind: "MISSING_IN_FILE"; productId: string; productName: string; brandName: string };

export async function diffAgainstDb(rows: ImportRow[]): Promise<DiffEntry[]> {
  const products = await db.product.findMany({
    where: { importKey: { not: null } },
    include: { brand: true },
  });
  const byKey = new Map(products.map((p) => [p.importKey!, p]));
  const entries: DiffEntry[] = [];
  const matchedIds = new Set<string>();

  for (const row of rows) {
    const existing = byKey.get(row.importKey);
    if (!existing) {
      entries.push({ kind: "NEW", row });
      continue;
    }
    matchedIds.add(existing.id);

    const changes: FieldChange[] = [];
    const cmp = (field: string, from: unknown, to: unknown) => {
      if (String(from ?? "") !== String(to ?? "")) {
        changes.push({ field, from: String(from ?? "—"), to: String(to ?? "—") });
      }
    };
    cmp("prezzo vendita", existing.priceCents, row.priceCents);
    cmp("prezzo acquisto", existing.purchasePriceCents, row.purchasePriceCents);
    cmp("IVA", existing.vatRate, row.vatRate);
    cmp("quantità Excel", existing.excelQty, row.quantity);
    cmp("stagione", existing.season, row.season);
    cmp("anno", existing.year, row.year);

    if (changes.length === 0) {
      entries.push({ kind: "UNCHANGED", row, productId: existing.id });
    } else {
      entries.push({
        kind: "UPDATE",
        row,
        productId: existing.id,
        productName: `${existing.brand.name} ${existing.name}`,
        changes,
      });
    }
  }

  for (const p of products) {
    if (!matchedIds.has(p.id) && p.status !== "ARCHIVED") {
      entries.push({
        kind: "MISSING_IN_FILE",
        productId: p.id,
        productName: p.name,
        brandName: p.brand.name,
      });
    }
  }

  return entries;
}

/* ------------------------------------------------------------------ */
/* Applicazione dell'import (dal payload della preview)                */
/* ------------------------------------------------------------------ */

export interface ApplySelection {
  /** importKey delle righe NEW/UPDATE da applicare */
  apply: string[];
  /** productId dei MISSING_IN_FILE da archiviare */
  archive: string[];
}

export async function applyImport(entries: DiffEntry[], selection: ApplySelection) {
  const applySet = new Set(selection.apply);
  const archiveSet = new Set(selection.archive);
  const summary = { created: 0, updated: 0, unchanged: 0, archived: 0, skipped: 0 };

  await db.$transaction(async (tx) => {
    for (const entry of entries) {
      if (entry.kind === "UNCHANGED") {
        summary.unchanged++;
        continue;
      }

      if (entry.kind === "MISSING_IN_FILE") {
        if (archiveSet.has(entry.productId)) {
          await tx.product.update({
            where: { id: entry.productId },
            data: { status: "ARCHIVED" },
          });
          summary.archived++;
        }
        continue;
      }

      if (!applySet.has(entry.row.importKey)) {
        summary.skipped++;
        continue;
      }

      const row = entry.row;

      if (entry.kind === "NEW") {
        const brand = await tx.brand.upsert({
          where: { name: row.brand },
          create: { name: row.brand, slug: slugify(row.brand) },
          update: {},
        });

        let categoryId: string | null = null;
        if (row.category) {
          const catSlug = slugify(row.category);
          const category = await tx.category.upsert({
            where: { slug: catSlug },
            create: { slug: catSlug, nameIt: titleCase(row.category), nameEn: titleCase(row.category) },
            update: {},
          });
          categoryId = category.id;
        }

        let slug = slugify(`${row.brand} ${row.name}`);
        const clash = await tx.product.findUnique({ where: { slug } });
        if (clash) slug = `${slug}-${Date.now().toString(36)}`;

        // Nasce DRAFT e senza varianti: l'Excel non ha le taglie, le aggiunge
        // l'admin insieme alle foto prima di pubblicare.
        await tx.product.create({
          data: {
            slug,
            name: row.name,
            brandId: brand.id,
            categoryId,
            priceCents: row.priceCents,
            purchasePriceCents: row.purchasePriceCents,
            vatRate: row.vatRate,
            season: row.season,
            year: row.year,
            status: "DRAFT",
            importKey: row.importKey,
            excelQty: row.quantity,
          },
        });
        summary.created++;
      } else {
        // UPDATE: mai toccare status, foto o stock varianti — lo stock manuale
        // è più affidabile di un Excel vecchio di 3 giorni.
        await tx.product.update({
          where: { id: entry.productId },
          data: {
            priceCents: row.priceCents,
            purchasePriceCents: row.purchasePriceCents,
            vatRate: row.vatRate,
            season: row.season,
            year: row.year,
            excelQty: row.quantity,
          },
        });
        summary.updated++;
      }
    }
  });

  return summary;
}
