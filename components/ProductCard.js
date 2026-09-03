"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import BottleArt from "./BottleArt";
import { formatINR } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const discount = product.mrp
    ? Math.round(100 - (product.price / product.mrp) * 100)
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border hairline bg-ink-card transition-colors duration-300 hover:border-gold/50"
      style={{ boxShadow: "0 0 0 rgba(201,169,98,0)" }}
    >
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: "0 20px 60px -15px rgba(201,169,98,0.25)" }} />

      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <BottleArt
            accent={product.accent}
            accent2={product.accent2}
            className="h-full w-full transition duration-700 ease-out group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.status === "preorder" && (
          <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
            Pre-Order
          </span>
        )}
        {discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-medium text-ink">
            −{discount}%
          </span>
        ) : null}

        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product, 1);
          }}
          className="absolute inset-x-3 bottom-3 translate-y-4 rounded-full bg-cream/95 py-2.5 text-center text-xs font-medium uppercase tracking-widest text-ink opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick Add
        </button>
      </Link>

      <div className="relative flex flex-1 flex-col p-5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold-deep">{product.family}</span>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 font-serif text-lg transition-colors group-hover:text-gold-light">{product.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-cream-dim">{product.tagline}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-gold">{formatINR(product.price)}</span>
            {product.mrp && (
              <span className="text-xs text-cream-dim/60 line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product, 1);
            }}
            className="hidden rounded-full border hairline px-3 py-1.5 text-xs text-cream-dim transition hover:border-gold hover:text-gold sm:block"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
