"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import BottleArt from "./BottleArt";

const wordVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const lineVariants = {
  hidden: { opacity: 0, y: 34, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroContent({ hasVideo }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 20 });
  const springY = useSpring(my, { stiffness: 60, damping: 20 });
  const bottleX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const bottleY = useTransform(springY, [-0.5, 0.5], [-14, 14]);
  const glowX = useTransform(springX, [-0.5, 0.5], ["35%", "65%"]);
  const glowY = useTransform(springY, [-0.5, 0.5], ["30%", "60%"]);

  function handleMove(e) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      className="relative flex min-h-[94vh] items-center overflow-hidden border-b hairline"
    >
      <div className="absolute inset-0">
        {hasVideo ? (
          <video
            className="h-full w-full object-cover opacity-70"
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="relative h-full w-full bg-[radial-gradient(ellipse_at_top,_#f5f5f5,_#ffffff_65%)]">
            <motion.div
              style={{ left: glowX, top: glowY }}
              className="absolute h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[110px] animate-pulse-glow"
            />
            <div className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-gold/60 animate-float-slow" />
            <div className="absolute right-[18%] top-[65%] h-1.5 w-1.5 rounded-full bg-gold-deep/50 animate-float-slow" style={{ animationDelay: "1.5s" }} />
            <div className="absolute right-[35%] top-[15%] h-1 w-1 rounded-full bg-gold/40 animate-float-slow" style={{ animationDelay: "3s" }} />

            <motion.div
              style={{ x: bottleX, y: bottleY }}
              className="absolute left-1/2 top-1/2 h-[560px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-40"
            >
              <BottleArt accent="#96742a" accent2="#f2f2f2" className="h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)]" />
            </motion.div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-paper/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/50 via-transparent to-transparent" />
      </div>

      <div className="container-px relative z-10 w-full">
        <motion.div variants={wordVariants} initial="hidden" animate="show" className="max-w-2xl">
          <motion.div variants={lineVariants} className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="text-xs uppercase tracking-[0.4em] text-gold">Parkolyn Amsterdam</span>
          </motion.div>

          <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            <motion.span variants={lineVariants} className="block overflow-hidden">
              Our Story,
            </motion.span>
            <motion.span variants={lineVariants} className="block overflow-hidden text-gradient-gold">
              Your Signature.
            </motion.span>
          </h1>

          <motion.p variants={lineVariants} className="mt-6 max-w-md text-sm leading-relaxed text-ink-dim sm:text-base">
            Parkolyn Amsterdam creates fragrance, beauty, and apparel as an
            expression of identity — not an afterthought. Our debut fragrance
            collection is open for limited pre-order, ready to be reserved
            before it ships.
          </motion.p>

          <motion.div variants={lineVariants} className="mt-9 flex flex-wrap gap-4">
            <Link href="/perfumes" className="group relative overflow-hidden rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-ink transition">
              <span className="relative z-10">Shop the Collection</span>
              <span className="absolute inset-0 -translate-x-full bg-gold-light transition-transform duration-500 group-hover:translate-x-0" />
            </Link>
            <Link
              href="/about"
              className="rounded-full border hairline px-8 py-3.5 text-sm text-ink transition hover:border-gold hover:text-gold"
            >
              Our Story
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ink-dim/70 sm:flex"
      >
        <span>Scroll</span>
        <motion.span
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px origin-top bg-ink-dim/40"
        />
      </motion.div>
    </section>
  );
}
