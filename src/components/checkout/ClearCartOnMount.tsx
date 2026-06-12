"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

// La pagina di successo può essere raggiunta anche dal redirect Stripe:
// in quel caso il carrello locale va comunque svuotato.
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
