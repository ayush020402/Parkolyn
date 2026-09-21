import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import MediaGallery from "@/components/MediaGallery";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Marquee from "@/components/Marquee";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";
import { PRODUCTS } from "@/lib/products";

const STATS = [
  { value: "6", label: "Signature Scents" },
  { value: "100%", label: "Original Ingredients" },
  { value: "12H+", label: "Long-Lasting Wear" },
  { value: "24H", label: "Order Response" },
];

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <>
      <Hero />

      <Marquee
        items={[
          "Reserve Before Launch",
          "Long-Lasting EDP",
          "Secure Checkout",
          "Handcrafted in Small Batches",
          "Premium Ingredients",
        ]}
      />

      {/* Featured products */}
      <section className="container-px py-24">
        <ScrollReveal as="div" className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The Collection"
            title="Fragrances everyone is talking about"
            description="Each bottle currently open for pre-order while our first production run is finished by hand."
          />
          <Link href="/perfumes" className="text-sm text-gold transition hover:text-gold-light">
            View all →
          </Link>
        </ScrollReveal>
        <Stagger className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4" staggerDelay={0.08}>
          {featured.map((product) => (
            <StaggerItem key={product.slug}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Stats strip */}
      <section className="border-y hairline">
        <ScrollReveal as="div" className="container-px grid grid-cols-2 gap-8 py-16 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl text-gradient-gold sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">{stat.label}</p>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Brand story teaser */}
      <section className="border-b hairline">
        <div className="container-px grid items-center gap-12 py-24 md:grid-cols-2">
          <ScrollReveal>
            <span className="text-xs uppercase tracking-[0.35em] text-gold">Our Story</span>
            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
              Built around one idea: unmistakable scent.
            </h2>
            <p className="mt-5 font-serif text-lg italic leading-relaxed text-ink">
              The best fragrances don&apos;t just smell good — they smell like
              someone. That&apos;s the only brief we write to.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim sm:text-base">
              Every Parkolyn Amsterdam fragrance starts with a feeling, not a
              formula copied off a bestseller list. We blend in small
              batches, test obsessively, and only bottle a scent once it says
              something true about the person wearing it — nothing diluted,
              nothing rushed, nothing made to smell like everything else on
              the shelf.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-block rounded-full border hairline px-7 py-3 text-sm text-ink transition hover:border-gold hover:text-gold"
            >
              Read Our Story
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={0.15} className="relative aspect-square overflow-hidden rounded-2xl border hairline bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.04),transparent_60%)]">
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
              <span className="font-brand text-3xl uppercase leading-tight tracking-wide text-ink sm:text-4xl">Parkolyn</span>
              <span className="mt-2 text-xs uppercase tracking-[0.3em] text-ink-dim">Amsterdam</span>
            </div>
            <div className="absolute inset-0 border border-gold/15" />
          </ScrollReveal>
        </div>
      </section>

      {/* Media / ad space */}
      <section className="container-px py-24">
        <ScrollReveal as="div">
          <SectionHeading
            eyebrow="Studio"
            title="From the campaign"
            description="A dedicated space for our ad films and photography — swap in real footage any time, no rebuild required."
            align="center"
          />
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-12">
          <MediaGallery />
        </ScrollReveal>
        <div className="mt-8 text-center">
          <Link href="/media" className="text-sm text-gold transition hover:text-gold-light">
            View full studio →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y hairline bg-paper-soft">
        <div className="container-px py-24">
          <ScrollReveal as="div">
            <SectionHeading eyebrow="Reviews" title="Loved by our early supporters" align="center" />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="mt-12">
            <Testimonials />
          </ScrollReveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-px py-24">
        <ScrollReveal as="div">
          <Newsletter />
        </ScrollReveal>
      </section>
    </>
  );
}
