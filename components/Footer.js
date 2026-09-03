import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t hairline bg-ink-soft">
      <div className="container-px grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="font-serif text-2xl text-gradient-gold">Parkolyn</span>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-dim">
            An Amsterdam-born fragrance house crafting scents as an expression of
            identity, not just a finishing touch. Our story, our passion, your
            signature.
          </p>
          <div className="mt-6 flex gap-4">
            {["Instagram", "Facebook", "YouTube"].map((social) => (
              <a
                key={social}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-xs text-cream-dim transition hover:border-gold hover:text-gold"
                aria-label={social}
              >
                {social[0]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-dim">
            <li><Link href="/shop" className="hover:text-gold">Shop All</Link></li>
            <li><Link href="/about" className="hover:text-gold">Our Story</Link></li>
            <li><Link href="/media" className="hover:text-gold">Studio</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Support</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-dim">
            <li><Link href="/cart" className="hover:text-gold">Your Cart</Link></li>
            <li>
              <a href="mailto:hello@parkolyn.com" className="hover:text-gold">
                hello@parkolyn.com
              </a>
            </li>
            <li className="text-cream-dim/70">Amsterdam, Netherlands</li>
          </ul>
        </div>
      </div>

      <div className="border-t hairline">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream-dim/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Parkolyn Amsterdam. All rights reserved.</span>
          <span>Crafted with care · Fragrances currently in pre-order production</span>
        </div>
      </div>
    </footer>
  );
}
