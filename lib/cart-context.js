"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "parkolyn_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration-safe read from localStorage (an external system) on
    // mount, kept separate from server render to avoid a hydration mismatch.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          volume: product.volume,
          accent: product.accent,
          qty,
        },
      ];
    });
    setDrawerOpen(true);
  }

  function removeItem(slug) {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }

  function updateQty(slug, qty) {
    if (qty < 1) return removeItem(slug);
    setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, qty } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );

  const value = {
    items,
    count,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    isDrawerOpen,
    setDrawerOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
