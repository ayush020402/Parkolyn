import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import BottleArt from "@/components/BottleArt";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";
import { PRODUCTS, getProductBySlug, formatINR } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Parkolyn`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="container-px py-16">
      <nav className="mb-8 text-xs text-cream-dim">
        <Link href="/shop" className="hover:text-gold">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-cream">{product.name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <ScrollReveal y={16} className="relative aspect-[3/4] overflow-hidden rounded-2xl border hairline">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          ) : (
            <BottleArt accent={product.accent} accent2={product.accent2} className="h-full w-full" />
          )}
          {product.status === "preorder" && (
            <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
              Pre-Order — Ships Soon
            </span>
          )}
        </ScrollReveal>

        <ScrollReveal delay={0.1} y={16} className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">{product.family}</span>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm italic text-cream-dim">{product.tagline}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl text-gold">{formatINR(product.price)}</span>
            {product.mrp && (
              <span className="text-sm text-cream-dim/60 line-through">{formatINR(product.mrp)}</span>
            )}
            <span className="text-xs text-cream-dim">{product.volume}</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-cream-dim">{product.description}</p>

          <dl className="mt-8 space-y-3 border-y hairline py-6 text-sm">
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-cream-dim">Top</dt>
              <dd>{product.notes.top}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-cream-dim">Heart</dt>
              <dd>{product.notes.heart}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-cream-dim">Base</dt>
              <dd>{product.notes.base}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCartButton product={product} />
            <p className="mt-4 text-xs text-cream-dim/70">
              This fragrance is in its first production run. Reserving now
              secures your bottle from the earliest batch — we&apos;ll notify you
              the moment it ships.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <section className="mt-24">
        <ScrollReveal as="h2" className="font-serif text-2xl">You may also like</ScrollReveal>
        <Stagger className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4" staggerDelay={0.06}>
          {related.map((p) => (
            <StaggerItem key={p.slug}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
