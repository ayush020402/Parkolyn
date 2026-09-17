import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import Testimonials from "@/components/Testimonials";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";

export const metadata = {
  title: "Our Story — Parkolyn Amsterdam",
  description: "The story behind Parkolyn Amsterdam — fragrance built around one idea: an unmistakable, honest signature scent.",
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
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <span className="text-xs uppercase tracking-[0.35em] text-gold">Our Story</span>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              A signature, not just a scent
            </h1>

            <p className="mt-8 font-serif text-xl italic leading-relaxed text-ink sm:text-2xl">
              A great fragrance isn&apos;t the thing you wear. It&apos;s the
              thing people remember after you&apos;ve left the room.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink-dim sm:text-base">
              That&apos;s the whole idea behind Parkolyn Amsterdam. We started
              with a stubborn belief: a fragrance should say something true
              about the person wearing it, not just smell pleasant for an
              hour and fade into the background. So we build slowly — small
              batches, honest ingredients, and testing we refuse to rush.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ink-dim sm:text-base">
              Every note is chosen for character, not cost. We&apos;d rather
              use less of something real than more of something synthetic
              just to hit a price point — which is why each fragrance in
              this collection has its own identity: bold where it should be
              bold, quiet where it should be quiet, instead of chasing
              whatever&apos;s trending this season.
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
            This fragrance collection is open for pre-order while our first
            batch is completed by hand. Reserving now secures your place in
            the earliest run.
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
