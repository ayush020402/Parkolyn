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
  { value: "1", label: "Amsterdam Studio" },
  { value: "24H", label: "Order Response" },
];

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <>
      <Hero />

      <Marquee
        items={[
          "Amsterdam Crafted",
          "Reserve Before Launch",
          "Long-Lasting EDP",
          "Secure Checkout",
          "Handcrafted in Small Batches",
        ]}
      />

      {/* Featured products */}
      <section className="container-px py-24">
        <ScrollReveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The Collection"
            title="Fragrances everyone is talking about"
            description="Each bottle currently open for pre-order while our first production run is finished by hand."
          />
          <Link href="/shop" className="text-sm text-gold transition hover:text-gold-light">
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
      <section className="border-y hairline bg-ink-soft">
        <ScrollReveal as="div" className="container-px grid grid-cols-2 gap-8 py-16 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl text-gradient-gold sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-cream-dim">{stat.label}</p>
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
              A fragrance house built on identity, not imitation.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-cream-dim sm:text-base">
              Parkolyn began in Amsterdam with a simple belief: fragrance should
              say something true about the person wearing it. While our first
              collection completes production, we&apos;re building this space with
              you — the story, the process, and the people behind every bottle.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-block rounded-full border hairline px-7 py-3 text-sm text-cream transition hover:border-gold hover:text-gold"
            >
              Read Our Story
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={0.15} className="relative aspect-square overflow-hidden rounded-2xl border hairline bg-[radial-gradient(circle_at_30%_20%,rgba(201,169,98,0.18),transparent_60%)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-5xl text-gradient-gold">Parkolyn</span>
            </div>
            <div className="absolute inset-0 border border-gold/10" />
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
      <section className="border-y hairline bg-ink-soft">
        <div className="container-px py-24">
          <ScrollReveal as="div">
            <SectionHeading eyebrow="Reviews" title="Loved by fragrance enthusiasts" align="center" />
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
