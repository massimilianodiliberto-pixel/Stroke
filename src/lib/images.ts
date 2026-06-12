import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_DIMENSION = 1600;

/**
 * Salva una foto prodotto: ridimensiona e converte in WebP.
 * Ritorna l'URL pubblico (/uploads/xxx.webp).
 */
export async function saveProductPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Il file non è un'immagine");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${nanoid(12)}.webp`;
  await writeFile(path.join(UPLOAD_DIR, filename), processed);
  return `/uploads/${filename}`;
}
