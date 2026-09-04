# Parkolyn Amsterdam

A premium ecommerce site for Parkolyn Amsterdam — fragrance today, with
beauty and apparel planned — built with Next.js and Tailwind CSS. Currently
set up to take **pre-orders** while the first product batch is in
production, with a dedicated space for ad photos/videos that can be dropped
in at any time.

Note: "Parkolyn Amsterdam" is the registered trademark and must always be
used in full (not just "Parkolyn") in on-site copy, titles, and branding.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's already working

- Home, Shop, Product detail, Cart, Checkout, About, Studio (media/ads), Contact
- Cart persists in the browser (localStorage) and has a slide-out drawer
- Checkout collects shipping details and takes real payment via Razorpay
  Standard Checkout before confirming the order — see "Payment gateway" below
- Floating WhatsApp chat button
- Every page is mobile responsive

## Editing content

- **Products** — `lib/products.js`. Add/edit/remove products, prices, notes,
  descriptions here. Each has a `category` field (only `"fragrance"` exists
  today — set to `"cosmetics"` / `"apparel"` etc. when those lines launch).
  Each product needs `accent`/`accent2` colors used by the placeholder
  bottle art (see below), or an `image` path once you have real photography.
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

## Payment gateway — Razorpay (test mode)

Checkout is wired up to Razorpay Standard Checkout end to end:

1. `POST /api/checkout` (`app/api/checkout/route.js`) recomputes the total
   server-side from `lib/products.js` (never trusts a client-sent amount)
   and creates a Razorpay order via `lib/razorpay.js`.
2. The client (`app/checkout/page.js`) opens the Razorpay Checkout modal
   with that order.
3. On success, `POST /api/checkout/verify`
   (`app/api/checkout/verify/route.js`) verifies the HMAC-SHA256 payment
   signature before the order is treated as paid. A failed/mismatched
   signature is rejected — the cart is only cleared after verification
   succeeds.

Set these in `.env.local` (copy from `.env.local.example`):

```
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

Get keys from the [Razorpay dashboard](https://dashboard.razorpay.com/app/keys)
— use test-mode keys (`rzp_test_...`) until you're ready to go live. Test
with [Razorpay's test cards](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#test-integration)
(e.g. card `4111 1111 1111 1111`, any future expiry, any CVV).

There's no database yet, so a successful payment isn't persisted anywhere
beyond the Razorpay dashboard itself — see the `TODO` in
`app/api/checkout/verify/route.js` for where to add order storage once one
exists.

## Deployment

Easiest path is [Vercel](https://vercel.com/new) (built by the makers of
Next.js) — connect the repo and it deploys automatically. Any Node.js host
that supports Next.js also works.
