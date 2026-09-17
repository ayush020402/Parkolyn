import { PRODUCTS } from "./products";

// Powers the hover mega-menu on Perfumes — the only nav item with
// sub-content today. Our Story / Studio / Contact stay plain
// single-destination links since there's nothing beneath them yet.

export const MENU_CATEGORIES = {
  "/perfumes": {
    label: "Perfumes",
    icon: "perfume",
    tagline: "Open for pre-order",
    cta: { label: "Shop All Perfumes", href: "/perfumes" },
    links: PRODUCTS.filter((p) => p.category === "fragrance").map((p) => ({
      label: p.name,
      href: `/product/${p.slug}`,
    })),
  },
};
