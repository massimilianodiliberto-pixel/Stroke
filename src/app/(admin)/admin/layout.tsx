import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/actions/auth";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Stroke Shop — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="it">
      <body className="min-h-screen bg-ink text-paper" style={{ fontFamily: "system-ui, sans-serif" }}>
        {session.isAdmin ? (
          <div className="flex min-h-screen flex-col md:flex-row">
            <aside className="border-b border-paper/10 bg-ink-2 p-4 md:min-h-screen md:w-56 md:border-b-0 md:border-r">
              <p className="display mb-6 text-xl">
                STROKE <span className="text-acid">ADMIN</span>
              </p>
              <nav className="flex gap-3 text-sm md:flex-col">
                <Link href="/admin" className="py-1 hover:text-acid">
                  Dashboard
                </Link>
                <Link href="/admin/orders" className="py-1 hover:text-acid">
                  Ordini
                </Link>
                <Link href="/admin/products" className="py-1 hover:text-acid">
                  Prodotti
                </Link>
                <Link href="/admin/import" className="py-1 hover:text-acid">
                  Import Excel
                </Link>
                <Link href="/it" className="py-1 text-paper-dim hover:text-acid">
                  → Vai al sito
                </Link>
              </nav>
              <form action={logout} className="mt-6">
                <button className="text-xs uppercase tracking-widest text-paper-dim hover:text-danger">
                  Esci
                </button>
              </form>
            </aside>
            <main className="flex-1 p-4 md:p-8">{children}</main>
          </div>
        ) : (
          <main className="flex min-h-screen items-center justify-center p-4">{children}</main>
        )}
      </body>
    </html>
  );
}
