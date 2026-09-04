import { PRODUCTS } from "./products";

// Powers the hover mega-menu on Perfumes / Cosmetics / Clothing — the only
// nav items with sub-content today. Our Story / Studio / Contact stay plain
// single-destination links since there's nothing beneath them yet.

export const MENU_CATEGORIES = {
  "/perfumes": {
    label: "Perfumes",
    icon: "perfume",
    tagline: "Debut collection — open for pre-order",
    cta: { label: "Shop All Perfumes", href: "/perfumes" },
    links: PRODUCTS.filter((p) => p.category === "fragrance").map((p) => ({
      label: p.name,
      href: `/product/${p.slug}`,
    })),
  },
  "/cosmetics": {
    label: "Cosmetics",
    icon: "cosmetics",
    tagline: "Coming Soon",
    description: "The next chapter of Parkolyn Amsterdam, currently in development.",
    cta: { label: "Notify Me", href: "/cosmetics" },
    links: [],
  },
  "/clothing": {
    label: "Clothing",
    icon: "clothing",
    tagline: "Coming Soon",
    description: "The next chapter of Parkolyn Amsterdam, currently in development.",
    cta: { label: "Notify Me", href: "/clothing" },
    links: [],
  },
};
