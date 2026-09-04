"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/products";
import BottleArt from "./BottleArt";

export default function CartDrawer() {
  const { items, subtotal, isDrawerOpen, setDrawerOpen, updateQty, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper-soft shadow-2xl shadow-black/10"
          >
        <div className="flex items-center justify-between border-b hairline px-6 py-5">
          <h2 className="font-serif text-xl">Your Bag</h2>
          <button onClick={() => setDrawerOpen(false)} aria-label="Close cart" className="text-ink-dim hover:text-gold">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="mt-12 text-center text-sm text-ink-dim">
              Your bag is empty. Explore the collection to begin.
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md border hairline">
                    <BottleArt accent={item.accent} className="h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-ink-dim">{item.volume}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="text-xs text-ink-dim hover:text-gold"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border hairline">
                        <button
                          className="px-2.5 py-1 text-sm text-ink-dim hover:text-gold"
                          onClick={() => updateQty(item.slug, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="px-2 text-sm">{item.qty}</span>
                        <button
                          className="px-2.5 py-1 text-sm text-ink-dim hover:text-gold"
                          onClick={() => updateQty(item.slug, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gold">{formatINR(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t hairline px-6 py-6">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-dim">Subtotal</span>
              <span className="text-lg text-gold">{formatINR(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="block w-full rounded-full bg-gold py-3 text-center text-sm font-medium text-ink transition hover:bg-gold-light"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={() => setDrawerOpen(false)}
              className="mt-3 block w-full rounded-full border hairline py-3 text-center text-sm text-ink-dim transition hover:border-gold hover:text-gold"
            >
              View Bag
            </Link>
          </div>
        )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
