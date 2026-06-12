"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Un pezzo per taglia: nel carrello ogni variante può comparire una sola volta
// e la quantità è sempre 1.
export interface CartItem {
  variantId: string;
  productSlug: string;
  name: string;
  brandName: string;
  size: string;
  priceCents: number;
  imageUrl: string | null;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => boolean;
  remove: (variantId: string) => void;
  clear: () => void;
  totalCents: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "stroke-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // storage corrotto: si riparte da carrello vuoto
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback(
    (item: CartItem) => {
      let added = false;
      setItems((prev) => {
        if (prev.some((i) => i.variantId === item.variantId)) return prev;
        added = true;
        return [...prev, item];
      });
      return added;
    },
    [],
  );

  const remove = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      add,
      remove,
      clear,
      totalCents: items.reduce((sum, i) => sum + i.priceCents, 0),
      count: items.length,
    }),
    [items, add, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve stare dentro CartProvider");
  return ctx;
}
