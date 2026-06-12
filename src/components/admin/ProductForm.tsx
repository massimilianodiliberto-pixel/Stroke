"use client";

import { useActionState } from "react";
import { createProduct, updateProduct } from "@/actions/products";

export interface ProductFormValues {
  name: string;
  brandName: string;
  categoryName: string;
  price: string;
  purchasePrice: string;
  vatRate: number;
  season: "SUMMER" | "WINTER" | "ALL";
  year: string;
  descriptionIt: string;
  descriptionEn: string;
  featured: boolean;
}

const inputClass =
  "w-full border border-paper/20 bg-ink px-3 py-2.5 text-paper focus:border-acid focus:outline-none";

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: ProductFormValues;
}) {
  const action = productId ? updateProduct.bind(null, productId) : createProduct;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-paper-dim">Brand *</span>
          <input name="brandName" required defaultValue={initial?.brandName} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-paper-dim">Tipologia (t-shirt, short…)</span>
          <input name="categoryName" defaultValue={initial?.categoryName} className={inputClass} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-paper-dim">Nome articolo *</span>
        <input name="name" required defaultValue={initial?.name} className={inputClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-paper-dim">Prezzo vendita € *</span>
          <input name="price" required defaultValue={initial?.price} placeholder="49,90" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-paper-dim">Prezzo acquisto € (interno)</span>
          <input name="purchasePrice" defaultValue={initial?.purchasePrice} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-paper-dim">IVA %</span>
          <input
            name="vatRate"
            type="number"
            min={0}
            max={40}
            defaultValue={initial?.vatRate ?? 22}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-paper-dim">Stagione</span>
          <select name="season" defaultValue={initial?.season ?? "ALL"} className={inputClass}>
            <option value="ALL">Tutto l&apos;anno</option>
            <option value="SUMMER">Estate</option>
            <option value="WINTER">Inverno</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-paper-dim">Anno</span>
          <input name="year" type="number" defaultValue={initial?.year} className={inputClass} />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={initial?.featured}
            className="h-4 w-4 accent-[#ffd21e]"
          />
          <span>In evidenza in home</span>
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-paper-dim">Descrizione (italiano)</span>
        <textarea name="descriptionIt" rows={3} defaultValue={initial?.descriptionIt} className={inputClass} />
      </label>
      <label className="block text-sm">
        <span className="text-paper-dim">Description (english, opzionale)</span>
        <textarea name="descriptionEn" rows={3} defaultValue={initial?.descriptionEn} className={inputClass} />
      </label>

      {state && "error" in state && state.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
      {state && "ok" in state && state.ok && <p className="text-sm text-acid">Salvato ✓</p>}

      <button
        disabled={pending}
        className="bg-acid px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink disabled:opacity-40"
      >
        {pending ? "Salvataggio…" : productId ? "Salva modifiche" : "Crea prodotto"}
      </button>
    </form>
  );
}
