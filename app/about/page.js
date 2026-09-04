import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Testimonials from "@/components/Testimonials";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";

export const metadata = {
  title: "Our Story — Parkolyn Amsterdam",
  description: "The story behind Parkolyn Amsterdam, a luxury house crafting fragrance, beauty, and apparel.",
};

const VALUES = [
  {
    title: "Identity Over Imitation",
    body: "Every product starts with a feeling, not a trend chart. We build things people wear as a signature, not a substitute.",
  },
  {
    title: "Slow, Deliberate Production",
    body: "Small first-run batches, sourced materials, and hands-on quality checks — even if it means asking you to wait.",
  },
  {
    title: "Radical Transparency",
    body: "While we're still in production, we'd rather show you the real process than a polished stand-in for it.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <section className="container-px py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <span className="text-xs uppercase tracking-[0.35em] text-gold">Our Story</span>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Identity, born in Amsterdam
            </h1>

            <p className="mt-8 font-serif text-xl italic leading-relaxed text-ink sm:text-2xl">
              It starts at dusk, on a canal where the water turns the colour of
              brass and the whole city smells faintly of rain on stone.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink-dim sm:text-base">
              That&apos;s the feeling Parkolyn Amsterdam was built to bottle — not a
              season, not a trend, but something you carry with you. We started
              with a stubborn idea: what you choose to wear, a scent, a shade,
              a cut of fabric, should say something true about you, not just
              something pleasant. So instead of chasing what sells fastest, we
              chose to build slowly. Small batches. Honest materials. A house
              that grows one chapter at a time, instead of all at once.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink-dim sm:text-base">
              Fragrance is where that story begins. It&apos;s our debut chapter —
              still in production, still made by hand — and open to anyone
              willing to walk this early stretch with us. Beauty and apparel
              are the chapters after this one. This website, like the house
              itself, is still being written.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15} className="hidden justify-center lg:flex">
            <Image
              src="/brand/crest.png"
              alt="Parkolyn Amsterdam crest"
              width={420}
              height={420}
              className="h-auto w-full max-w-sm object-contain"
              priority
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-y hairline bg-paper-soft">
        <Stagger className="container-px grid gap-8 py-20 sm:grid-cols-3" staggerDelay={0.12}>
          {VALUES.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-2xl border hairline bg-surface p-7 transition-colors duration-300 hover:border-gold/40">
                <h3 className="font-serif text-xl text-gold">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{v.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-px py-20">
        <ScrollReveal as="div" className="mx-auto max-w-3xl text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Where We Are Today</span>
          <h2 className="mt-3 font-serif text-3xl">Currently in first production</h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-dim">
            The fragrance collection on this site is our debut chapter, open
            for pre-order while our first batch is completed by hand —
            beauty and apparel will follow. Reserving now secures your place
            in the earliest run, and helps us bring Parkolyn Amsterdam to
            life.
          </p>
        </ScrollReveal>
      </section>

      <section className="border-t hairline">
        <div className="container-px py-20">
          <ScrollReveal as="div">
            <SectionHeading eyebrow="Reviews" title="What early supporters are saying" align="center" />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="mt-12">
            <Testimonials />
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
