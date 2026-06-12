"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  applyImport,
  diffAgainstDb,
  parseStockFile,
  type ApplySelection,
  type DiffEntry,
  type InvalidRow,
} from "@/lib/excel";

export interface ImportPreviewPayload {
  entries: DiffEntry[];
  invalid: InvalidRow[];
}

export async function uploadStockFile(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Seleziona un file .xlsx" };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File troppo grande (max 10 MB)" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed;
  try {
    parsed = await parseStockFile(buffer);
  } catch {
    return { error: "Impossibile leggere il file: assicurati che sia un .xlsx valido" };
  }

  if (parsed.headerError) {
    const missing = parsed.headerError.missing.join(", ");
    const detected = parsed.headerError.detected.filter(Boolean).join(", ") || "nessuna";
    return {
      error: `Colonne obbligatorie non trovate: ${missing}. Intestazioni lette dal file: ${detected}`,
    };
  }

  const entries = await diffAgainstDb(parsed.rows);
  const payload: ImportPreviewPayload = { entries, invalid: parsed.invalid };

  const session = await db.importSession.create({
    data: {
      filename: file.name,
      payload: JSON.stringify(payload),
    },
  });

  redirect(`/admin/import?session=${session.id}`);
}

export async function confirmImport(sessionId: string, selection: ApplySelection) {
  await requireAdmin();
  const session = await db.importSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (session.status !== "PREVIEW") return { error: "Import già applicato o scartato" };

  const payload = JSON.parse(session.payload) as ImportPreviewPayload;
  const summary = await applyImport(payload.entries, selection);

  await db.importSession.update({
    where: { id: sessionId },
    data: { status: "APPLIED", summary: JSON.stringify(summary), appliedAt: new Date() },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true, summary };
}

export async function discardImport(sessionId: string) {
  await requireAdmin();
  await db.importSession.update({
    where: { id: sessionId },
    data: { status: "DISCARDED" },
  });
  redirect("/admin/import");
}
