import SectionHeading from "@/components/SectionHeading";
import Testimonials from "@/components/Testimonials";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";

export const metadata = {
  title: "Our Story — Parkolyn",
  description: "The story behind Parkolyn, an Amsterdam-born fragrance house.",
};

const VALUES = [
  {
    title: "Identity Over Imitation",
    body: "Every fragrance starts with a feeling, not a trend chart. We build scents people wear as a signature, not a substitute.",
  },
  {
    title: "Slow, Deliberate Production",
    body: "Small first-run batches, sourced ingredients, and hands-on quality checks — even if it means asking you to wait.",
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
        <ScrollReveal as="div">
          <SectionHeading
            eyebrow="Our Story"
            title="Fragrance as identity, born in Amsterdam"
            description="Parkolyn started with a simple idea: your scent should say something true about you, not just something pleasant. We're building that into every part of this brand — including this website, which is growing alongside our first production run."
          />
        </ScrollReveal>
      </section>

      <section className="border-y hairline bg-ink-soft">
        <Stagger className="container-px grid gap-8 py-20 sm:grid-cols-3" staggerDelay={0.12}>
          {VALUES.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-2xl border hairline bg-ink-card p-7 transition-colors duration-300 hover:border-gold/40">
                <h3 className="font-serif text-xl text-gold">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-dim">{v.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-px py-20">
        <ScrollReveal as="div" className="mx-auto max-w-3xl text-center">
          <span className="text-xs uppercase tracking-[0.35em] text-gold">Where We Are Today</span>
          <h2 className="mt-3 font-serif text-3xl">Currently in first production</h2>
          <p className="mt-5 text-sm leading-relaxed text-cream-dim">
            The collection you see on this site is open for pre-order while
            our first batch is completed by hand. Reserving now secures your
            place in the earliest run — and helps us bring Parkolyn to life.
          </p>
        </ScrollReveal>
      </section>

      <section className="border-t hairline bg-ink-soft">
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
