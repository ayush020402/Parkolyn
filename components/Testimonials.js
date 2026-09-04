"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "The pre-order experience alone felt more premium than fragrances I've bought finished and boxed elsewhere.",
    name: "Aanya R.",
    role: "Early Reserve",
  },
  {
    quote:
      "Oud Royale is the reason I stopped shopping for scents everywhere else. Waiting for the full batch now.",
    name: "Devansh K.",
    role: "Early Reserve",
  },
  {
    quote:
      "Loved being able to reserve before launch. The story behind the brand is exactly what convinced me.",
    name: "Meher S.",
    role: "Early Reserve",
  },
];

export default function Testimonials() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <motion.figure
          key={t.name}
          whileHover={{ y: -5, borderColor: "rgba(150,116,42,0.4)" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="rounded-2xl border hairline bg-surface p-7"
        >
          <span className="font-serif text-3xl text-gold">&ldquo;</span>
          <blockquote className="mt-1 text-sm leading-relaxed text-ink-dim">{t.quote}</blockquote>
          <figcaption className="mt-5 text-xs uppercase tracking-[0.2em] text-gold">
            {t.name} <span className="text-ink-dim/60 normal-case tracking-normal">— {t.role}</span>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
