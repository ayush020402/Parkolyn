import SectionHeading from "@/components/SectionHeading";
import MediaGallery from "@/components/MediaGallery";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Studio — Parkolyn",
  description: "Behind-the-scenes photos and ad films from Parkolyn, updated as our campaign grows.",
};

export default function MediaPage() {
  return (
    <div className="container-px py-20">
      <ScrollReveal as="div">
        <SectionHeading
          eyebrow="Studio"
          title="Campaign & Brand Media"
          description="This is our working space for ad videos and photography while the Parkolyn collection finishes production. New footage drops in here as it's shot — no need to rebuild the site."
        />
      </ScrollReveal>
      <ScrollReveal delay={0.1} className="mt-12">
        <MediaGallery />
      </ScrollReveal>

      <ScrollReveal delay={0.15} className="mt-16 rounded-2xl border border-dashed hairline bg-ink-card p-8 text-sm text-cream-dim">
        <p className="font-serif text-lg text-gold">Adding real content</p>
        <p className="mt-2 max-w-2xl leading-relaxed">
          Drop photos or video files into{" "}
          <code className="rounded bg-ink px-1.5 py-0.5 text-gold">/public/media/ads/</code> and list
          them in <code className="rounded bg-ink px-1.5 py-0.5 text-gold">lib/media.js</code> — each
          tile automatically switches from a designed placeholder to your real footage.
        </p>
      </ScrollReveal>
    </div>
  );
}
