"use client";

import Link from "next/link";
import BottleArt from "@/components/BottleArt";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/products";

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-px flex flex-col items-center justify-center py-32 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-ink-dim">Explore the collection to find your signature.</p>
        <Link
          href="/perfumes"
          className="mt-8 rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition hover:bg-gold-light"
        >
          Shop the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-px py-16">
      <h1 className="font-serif text-3xl">Your Bag</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-3">
        <ul className="space-y-6 lg:col-span-2">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-5 border-b hairline pb-6">
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border hairline">
                <BottleArt accent={item.accent} className="h-full w-full" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg">{item.name}</p>
                    <p className="text-xs text-ink-dim">{item.volume}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.slug)}
                    className="text-xs text-ink-dim hover:text-gold"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border hairline">
                    <button
                      className="px-3 py-1.5 text-ink-dim hover:text-gold"
                      onClick={() => updateQty(item.slug, item.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      className="px-3 py-1.5 text-ink-dim hover:text-gold"
                      onClick={() => updateQty(item.slug, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gold">{formatINR(item.price * item.qty)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border hairline bg-surface p-7">
          <h2 className="font-serif text-xl">Order Summary</h2>
          <div className="mt-5 flex justify-between text-sm text-ink-dim">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-ink-dim">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="mt-4 flex justify-between border-t hairline pt-4 text-base">
            <span>Total</span>
            <span className="text-gold">{formatINR(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-gold py-3.5 text-center text-sm font-medium text-ink transition hover:bg-gold-light"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
