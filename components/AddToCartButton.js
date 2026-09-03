"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-full border hairline">
        <button
          className="px-4 py-2.5 text-cream-dim transition hover:text-gold"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{qty}</span>
        <button
          className="px-4 py-2.5 text-cream-dim transition hover:text-gold"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <motion.button
        onClick={handleAdd}
        whileTap={{ scale: 0.96 }}
        className="relative flex-1 overflow-hidden rounded-full bg-gold py-3.5 text-sm font-medium text-ink transition hover:bg-gold-light"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? "added" : "add"}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {added ? "Added to Bag ✓" : "Reserve — Add to Bag"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
