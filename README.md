# Parkolyn — Amsterdam Fragrance House

A premium ecommerce site for Parkolyn perfumes, built with Next.js and
Tailwind CSS. Currently set up to take **pre-orders** while the first
product batch is in production, with a dedicated space for ad photos/videos
that can be dropped in at any time.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's already working

- Home, Shop, Product detail, Cart, Checkout, About, Studio (media/ads), Contact
- Cart persists in the browser (localStorage) and has a slide-out drawer
- Checkout collects shipping details and confirms a pre-order with a
  reference number — see "Payment gateway" below for what's left
- Floating WhatsApp chat button
- Every page is mobile responsive

## Editing content

- **Products** — `lib/products.js`. Add/edit/remove perfumes, prices, notes,
  descriptions here. Each product needs `accent`/`accent2` colors used by
  the placeholder bottle art (see below), or an `image` path once you have
  real product photography.
- **Ad photos/videos** — `lib/media.js` lists the tiles shown in the
  homepage "Studio" section and the `/media` page. Drop real files into
  `public/media/ads/` and update the matching entry's `type` to `"image"`
  or `"video"` with the right `src`. Until then, tiles show a designed
  placeholder card instead of a broken file.
- **Homepage hero video** — drop a file named `hero.mp4` directly into
  `public/media/` and it's used automatically as the hero background.
- **Product photos** — drop files into `public/media/products/` and set
  the product's `image` field in `lib/products.js`. Until set, products
  automatically render a designed bottle illustration instead (no need for
  placeholder stock photos).
- **WhatsApp number** — copy `.env.local.example` to `.env.local` and set
  `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## Payment gateway — not yet wired up

Checkout currently confirms the order (name/email/phone/address + items)
and shows a reference number, but does **not** charge a card yet — the
team follows up to complete payment manually. This matches the "product
still in production" stage.

When ready to take real payments, see the detailed comment in
`app/api/checkout/route.js` for how to plug in Razorpay or Stripe. Recompute
the total server-side from `lib/products.js` — never trust a client-sent
amount.

## Deployment

Easiest path is [Vercel](https://vercel.com/new) (built by the makers of
Next.js) — connect the repo and it deploys automatically. Any Node.js host
that supports Next.js also works.
