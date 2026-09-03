"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/media", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setDrawerOpen } = useCart();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 20);
    if (mobileOpen) return;
    setHidden(latest > previous && latest > 160);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? "border-gold/15 bg-ink/90 backdrop-blur-md" : "hairline bg-ink/85 backdrop-blur-md"
      }`}
    >
      <div className={`container-px flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setMobileOpen(false)}>
          <span className="font-serif text-2xl tracking-wide text-gradient-gold">Parkolyn</span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-cream-dim sm:inline">Amsterdam</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm tracking-wide text-cream-dim transition hover:text-gold"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="group relative flex items-center gap-2 text-sm text-cream-dim transition hover:text-gold"
            aria-label="Open cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H19M10 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-ink"
              >
                {count}
              </motion.span>
            )}
          </button>

          <button
            className="text-cream md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t hairline md:hidden">
          <div className="container-px flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm tracking-wide text-cream-dim transition hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </motion.header>
  );
}
