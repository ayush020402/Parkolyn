"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PerfumeIcon, CosmeticsIcon, ClothingIcon } from "./CategoryIcons";

const CATEGORIES = [
  {
    href: "/perfumes",
    label: "Perfumes",
    tagline: "Debut collection — open for pre-order",
    Icon: PerfumeIcon,
    live: true,
  },
  {
    href: "/cosmetics",
    label: "Cosmetics",
    tagline: "Coming soon",
    Icon: CosmeticsIcon,
    live: false,
  },
  {
    href: "/clothing",
    label: "Clothing",
    tagline: "Coming soon",
    Icon: ClothingIcon,
    live: false,
  },
];

export default function CategoryShowcase() {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {CATEGORIES.map(({ href, label, tagline, Icon, live }, i) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={href}
            className="group relative flex flex-col items-center overflow-hidden rounded-2xl border hairline bg-surface px-8 py-14 text-center transition-colors duration-300 hover:border-gold/50"
          >
            {!live && (
              <span className="absolute right-4 top-4 rounded-full border hairline px-3 py-1 text-[10px] uppercase tracking-widest text-ink-dim">
                Coming Soon
              </span>
            )}
            <Icon className="h-16 w-16 text-gold transition-transform duration-500 group-hover:scale-110" />
            <h3 className="mt-6 font-serif text-2xl">{label}</h3>
            <p className={`mt-2 text-xs uppercase tracking-[0.2em] ${live ? "text-gold" : "text-ink-dim"}`}>
              {tagline}
            </p>
            <span className="mt-6 text-sm text-ink-dim transition-colors group-hover:text-gold">
              {live ? "Shop Now →" : "Notify Me →"}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
