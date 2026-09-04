"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function ComingSoon({ icon, title, description }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to an email provider (Mailchimp/Resend/etc) once available.
    setSubmitted(true);
  }

  return (
    <div className="container-px flex flex-col items-center py-28 text-center">
      <ScrollReveal className="flex flex-col items-center">
        <span className="rounded-full border hairline px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-gold">
          Coming Soon
        </span>
        <div className="mt-8 h-20 w-20 text-gold">{icon}</div>
        <h1 className="mt-6 font-serif text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-dim sm:text-base">
          {description}
        </p>

        {submitted ? (
          <p className="mt-8 text-sm text-gold">Thank you — you&apos;re on the list.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border hairline bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink-dim/50 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-gold px-7 py-3 text-sm font-medium text-ink transition hover:bg-gold-light"
            >
              Notify Me
            </button>
          </form>
        )}

        <Link href="/perfumes" className="mt-10 text-sm text-ink-dim transition hover:text-gold">
          Explore Perfumes, live now →
        </Link>
      </ScrollReveal>
    </div>
  );
}
