import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import ScrollReveal, { Stagger, StaggerItem } from "@/components/ScrollReveal";
import { PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Shop the Collection — Parkolyn",
  description: "Browse the full Parkolyn fragrance collection, open for pre-order.",
};

export default function ShopPage() {
  return (
    <div className="container-px py-20">
      <ScrollReveal as="div">
        <SectionHeading
          eyebrow="Shop"
          title="The Full Collection"
          description="Every fragrance below is open for pre-order while our first production run is completed by hand in Amsterdam."
        />
      </ScrollReveal>
      <Stagger className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4" staggerDelay={0.06}>
        {PRODUCTS.map((product) => (
          <StaggerItem key={product.slug}>
            <ProductCard product={product} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
