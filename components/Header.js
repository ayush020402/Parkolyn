"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { MENU_CATEGORIES } from "@/lib/nav-categories";
import MegaMenuPanel from "./MegaMenuPanel";

const NAV_LINKS = [
  { href: "/perfumes", label: "Perfumes" },
  { href: "/cosmetics", label: "Cosmetics" },
  { href: "/clothing", label: "Clothing" },
  { href: "/about", label: "Our Story" },
  { href: "/media", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const closeTimer = useRef(null);
  const { count, setDrawerOpen } = useCart();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 20);
    if (mobileOpen) return;
    setHidden(latest > previous && latest > 160);
    if (latest > previous) setActiveMenu(null);
  });

  function openMenu(href) {
    clearTimeout(closeTimer.current);
    if (MENU_CATEGORIES[href]) setActiveMenu(href);
    else setActiveMenu(null);
  }

  function scheduleClose() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }

  function closeMenu() {
    clearTimeout(closeTimer.current);
    setActiveMenu(null);
  }

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={scheduleClose}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? "border-gold/20 bg-paper/92 backdrop-blur-md" : "hairline bg-paper/85 backdrop-blur-md"
      }`}
    >
      <div className={`container-px flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
        <Link href="/" className="flex flex-col leading-none sm:flex-row sm:items-baseline sm:gap-2" onClick={() => setMobileOpen(false)}>
          <span className="font-serif text-lg tracking-wide text-gradient-gold sm:text-2xl">Parkolyn</span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-ink-dim sm:text-[10px] sm:tracking-[0.3em]">Amsterdam</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => openMenu(link.href)}
              onFocus={() => openMenu(link.href)}
              className={`group relative py-2 text-[11px] uppercase tracking-[0.15em] transition ${
                activeMenu === link.href ? "text-gold" : "text-ink-dim hover:text-gold"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ${
                  activeMenu === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative text-ink-dim transition hover:text-gold"
            aria-label="Open cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H19M10 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
            className="text-ink lg:hidden"
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

      <div onMouseEnter={() => clearTimeout(closeTimer.current)}>
        <AnimatePresence>
          {activeMenu && MENU_CATEGORIES[activeMenu] && (
            <MegaMenuPanel category={MENU_CATEGORIES[activeMenu]} onNavigate={closeMenu} />
          )}
        </AnimatePresence>
      </div>

      {mobileOpen && (
        <nav className="border-t hairline lg:hidden">
          <div className="container-px flex flex-col py-4">
            {NAV_LINKS.map((link) => {
              const category = MENU_CATEGORIES[link.href];
              const expanded = mobileExpanded === link.href;
              return (
                <div key={link.href} className="border-b hairline last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-3 text-sm tracking-wide text-ink-dim transition hover:text-gold"
                    >
                      {link.label}
                    </Link>
                    {category && (
                      <button
                        onClick={() => setMobileExpanded(expanded ? null : link.href)}
                        aria-label={`Toggle ${link.label} submenu`}
                        className="p-3 text-ink-dim"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                        >
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {category && expanded && (
                    <div className="flex flex-col gap-2 pb-4 pl-4">
                      {category.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-xs text-ink-dim transition hover:text-gold"
                        >
                          {l.label}
                        </Link>
                      ))}
                      <Link
                        href={category.cta.href}
                        onClick={() => setMobileOpen(false)}
                        className="mt-1 text-xs text-gold"
                      >
                        {category.cta.label} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </motion.header>
  );
}
