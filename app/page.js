import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import CategoryShowcase from "@/components/CategoryShowcase";
import MediaGallery from "@/components/MediaGallery";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Marquee from "@/components/Marquee";
import ScrollReveal from "@/components/ScrollReveal";

const STATS = [
  { value: "3", label: "Category Houses" },
  { value: "100%", label: "Original Ingredients" },
  { value: "1", label: "Amsterdam Studio" },
  { value: "24H", label: "Order Response" },
];

export default function Home() {
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

      {/* Category showcase */}
      <section className="container-px py-24">
        <ScrollReveal as="div">
          <SectionHeading
            eyebrow="Explore"
            title="Three houses, one signature"
            description="Perfume leads the way — cosmetics and clothing are next. Reserve from the debut collection now, or join the list for what's coming."
          />
        </ScrollReveal>
        <div className="mt-12">
          <CategoryShowcase />
        </div>
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
              A house built on identity, not imitation.
            </h2>
            <p className="mt-5 font-serif text-lg italic leading-relaxed text-ink">
              It starts at dusk, on an Amsterdam canal that smells faintly of
              rain on stone.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim sm:text-base">
              That&apos;s the feeling we set out to bottle — not a season, not
              a trend, but something true about the person wearing it.
              Fragrance is our debut chapter, with beauty and apparel to
              follow. While that first collection completes production,
              we&apos;re building this space with you.
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
              <span className="font-brand text-3xl uppercase leading-tight tracking-wide text-gradient-gold sm:text-4xl">Parkolyn</span>
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
