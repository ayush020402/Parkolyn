import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t hairline bg-paper-soft">
      <div className="container-px grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image src="/brand/crest.png" alt="Parkolyn Amsterdam crest" width={44} height={44} className="h-11 w-11 object-contain" />
          <span className="mt-3 flex items-baseline gap-2">
            <span className="font-brand text-2xl uppercase tracking-wide text-gradient-gold">Parkolyn</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-ink-dim">Amsterdam</span>
          </span>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-dim">
            Parkolyn Amsterdam crafts fragrance built around one idea: a scent
            should feel unmistakably yours, not borrowed. Our story, our
            passion, your signature.
          </p>
          <div className="mt-6 flex gap-4">
            {["Instagram", "Facebook", "YouTube"].map((social) => (
              <a
                key={social}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-xs text-ink-dim transition hover:border-gold hover:text-gold"
                aria-label={social}
              >
                {social[0]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-dim">
            <li><Link href="/perfumes" className="hover:text-gold">Perfumes</Link></li>
            <li><Link href="/about" className="hover:text-gold">Our Story</Link></li>
            <li><Link href="/media" className="hover:text-gold">Studio</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Support</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-dim">
            <li><Link href="/cart" className="hover:text-gold">Your Cart</Link></li>
            <li>
              <a href="mailto:hello@parkolyn.com" className="hover:text-gold">
                hello@parkolyn.com
              </a>
            </li>
            <li className="text-ink-dim/70">Amsterdam, Netherlands</li>
          </ul>
        </div>
      </div>

      <div className="border-t hairline">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-dim/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Parkolyn Amsterdam. All rights reserved.</span>
          <span>Crafted with care · Currently open for pre-order</span>
        </div>
      </div>
    </footer>
  );
}
