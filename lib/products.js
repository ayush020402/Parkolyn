// Product catalogue for Parkolyn. Edit this file to add, remove, or change
// products, prices, and descriptions. `image` fields are optional — leave
// them unset (or pointing at a file that doesn't exist yet in /public/media/products/)
// and the site falls back to a designed bottle illustration automatically.

export const PRODUCTS = [
  {
    slug: "elan-noir",
    name: "Élan Noir",
    family: "Woody · Amber",
    tagline: "Bold, smoky, unforgettable.",
    description:
      "A commanding blend of black pepper and cardamom over a base of oud and smoked amber. Élan Noir is built for the room you want to remember you leaving.",
    notes: { top: "Black Pepper, Cardamom", heart: "Oud, Leather", base: "Smoked Amber, Vetiver" },
    price: 2499,
    mrp: 3299,
    accent: "#8a6b2f",
    accent2: "#241c10",
    volume: "50ml EDP",
    status: "preorder",
    featured: true,
    image: null,
  },
  {
    slug: "velvet-rose",
    name: "Velvet Rose",
    family: "Floral · Musk",
    tagline: "Soft petals, quiet confidence.",
    description:
      "Turkish rose absolute wrapped in white musk and a whisper of vanilla — a signature that feels close, not loud.",
    notes: { top: "Bergamot, Pink Pepper", heart: "Turkish Rose, Peony", base: "White Musk, Vanilla" },
    price: 2299,
    mrp: 2999,
    accent: "#b0577a",
    accent2: "#241017",
    volume: "50ml EDP",
    status: "preorder",
    featured: true,
    image: null,
  },
  {
    slug: "oud-royale",
    name: "Oud Royale",
    family: "Oriental · Oud",
    tagline: "Heritage, distilled.",
    description:
      "Aged oud from the finest sourced wood, layered with saffron and rose, finished on warm sandalwood. A scent with lineage.",
    notes: { top: "Saffron, Rose", heart: "Agarwood, Cedar", base: "Sandalwood, Amber" },
    price: 3499,
    mrp: 4499,
    accent: "#a5762c",
    accent2: "#241a0c",
    volume: "50ml EDP",
    status: "preorder",
    featured: true,
    image: null,
  },
  {
    slug: "lumiere-blanc",
    name: "Lumière Blanc",
    family: "Citrus · White Floral",
    tagline: "Sunlight, bottled.",
    description:
      "Bright bergamot and neroli over jasmine and a clean musk base — effortless, luminous, worn all day.",
    notes: { top: "Bergamot, Neroli", heart: "Jasmine, Orange Blossom", base: "White Musk, Cedar" },
    price: 2199,
    mrp: 2599,
    accent: "#c9b877",
    accent2: "#221f14",
    volume: "50ml EDP",
    status: "preorder",
    featured: true,
    image: null,
  },
  {
    slug: "mystique-oud",
    name: "Mystique Oud",
    family: "Woody · Spicy",
    tagline: "For the after-dark.",
    description:
      "A magnetic pull of dark oud, clove, and dried fig, softened with a trace of amber resin. Not for daylight hours.",
    notes: { top: "Clove, Fig", heart: "Oud, Patchouli", base: "Amber Resin, Musk" },
    price: 2899,
    mrp: 3699,
    accent: "#6c4b2a",
    accent2: "#1c150d",
    volume: "50ml EDP",
    status: "preorder",
    featured: false,
    image: null,
  },
  {
    slug: "argent-eau",
    name: "Argent Eau",
    family: "Aquatic · Fresh",
    tagline: "Clean like the first morning.",
    description:
      "Sea salt and driftwood accord with a sheer citrus opening — the scent of an open window in Amsterdam spring.",
    notes: { top: "Sea Salt, Grapefruit", heart: "Driftwood, Lavender", base: "Ambergris, Musk" },
    price: 2199,
    mrp: 2799,
    accent: "#5c7e8a",
    accent2: "#111b1e",
    volume: "50ml EDP",
    status: "preorder",
    featured: false,
    image: null,
  },
];

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
