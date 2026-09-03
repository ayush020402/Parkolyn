"use client";

import { motion } from "framer-motion";

const TAGS = {
  div: motion.div,
  section: motion.section,
  h2: motion.h2,
  h3: motion.h3,
};

export default function ScrollReveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  as = "div",
}) {
  const Tag = typeof as === "string" ? TAGS[as] || motion.div : as;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}

export function Stagger({ children, className = "", staggerDelay = 0.1 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: staggerDelay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", y = 24 }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
