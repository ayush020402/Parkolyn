import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";
import { PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Perfumes — Parkolyn Amsterdam",
  description: "Browse the full Parkolyn Amsterdam fragrance collection, open for pre-order.",
};

export default function PerfumesPage() {
  const perfumes = PRODUCTS.filter((p) => p.category === "fragrance");

  return (
    <div className="container-px py-20">
      <ScrollReveal as="div">
        <SectionHeading
          eyebrow="Perfumes"
          title="The Full Collection"
          description="Every fragrance below is open for pre-order while our first production run is completed by hand in Amsterdam."
        />
      </ScrollReveal>
      <Stagger className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4" staggerDelay={0.06}>
        {perfumes.map((product) => (
          <StaggerItem key={product.slug}>
            <ProductCard product={product} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
