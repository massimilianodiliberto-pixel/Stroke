import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import path from "path";

// Su Vercel il filesystem del progetto è in sola lettura: per la demo
// copiamo il database pre-popolato in /tmp (scrivibile, ma effimero —
// i dati si azzerano a ogni riavvio dell'istanza). In produzione vera
// si usa un host con disco persistente o Turso, e questo ramo non scatta.
function resolveDatabaseUrl(): string | undefined {
  if (process.env.VERCEL) {
    const bundled = path.join(process.cwd(), "prisma", "demo.db");
    const writable = "/tmp/stroke-demo.db";
    if (!existsSync(writable) && existsSync(bundled)) {
      copyFileSync(bundled, writable);
    }
    if (existsSync(writable)) return `file:${writable}`;
  }
  return process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
