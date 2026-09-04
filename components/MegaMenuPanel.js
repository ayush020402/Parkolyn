"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PerfumeIcon, CosmeticsIcon, ClothingIcon } from "./CategoryIcons";

const ICONS = { perfume: PerfumeIcon, cosmetics: CosmeticsIcon, clothing: ClothingIcon };

export default function MegaMenuPanel({ category, onNavigate }) {
  const Icon = ICONS[category.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-0 top-full border-b hairline bg-surface shadow-lg shadow-black/5"
    >
      <div className="container-px grid gap-12 py-12 md:grid-cols-[280px_1fr]">
        <div>
          <Icon className="h-12 w-12 text-gold" />
          <h3 className="mt-4 font-serif text-2xl">{category.label}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold">{category.tagline}</p>
          {category.description && (
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-ink-dim">{category.description}</p>
          )}
          <Link
            href={category.cta.href}
            onClick={onNavigate}
            className="mt-6 inline-block text-sm text-ink transition hover:text-gold"
          >
            {category.cta.label} →
          </Link>
        </div>

        {category.links.length > 0 && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 content-start sm:grid-cols-3">
            {category.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className="text-sm text-ink-dim transition hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
