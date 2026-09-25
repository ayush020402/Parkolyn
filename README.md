# Parkolyn Amsterdam

A premium ecommerce site for Parkolyn Amsterdam, a signature fragrance
house — built with Next.js and Tailwind CSS. Currently set up to take
**pre-orders** while the first product batch is in production, with a
dedicated space for ad photos/videos that can be dropped in at any time.

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
  descriptions here. Each product needs `accent`/`accent2` colors used by
  the placeholder bottle art (see below), or an `image` path once you have
  real photography.
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

## Orders, emails & webhook

Every checkout now leaves a durable record and sends email:

1. **Order storage (Supabase).** `POST /api/checkout` saves a `pending` row in
   the `orders` table (items with prices, customer, shipping address, notes)
   *before* the customer pays. It flips to `paid` once payment is confirmed.
   Browse and filter orders in the Supabase dashboard -> Table Editor.
2. **Two confirmation paths, one result.** The browser calls
   `/api/checkout/verify`; Razorpay separately calls the webhook at
   `/api/webhooks/razorpay` (`payment.captured`). Whichever arrives first marks
   the order paid; the other is a harmless no-op, so the order is confirmed
   even if the customer closes the tab right after paying.
3. **Emails (Resend).** A paid order emails the customer a confirmation and
   emails `ORDER_ALERT_EMAIL` a new-order alert (exactly once, even though two
   paths can fire). The contact form emails you and stores the message;
   newsletter signups are stored in `subscribers` and get a welcome email.
   If an email fails, the order still saves; find unsent ones with
   `select * from orders where payment_status = 'paid' and emails_sent_at is null`.

### One-time setup

1. **Supabase** — create a project, open SQL Editor, run `supabase/schema.sql`
   (fresh install). Already on the first version of the schema? Run
   the files in `supabase/migrations/` in order (`002`, `003`, `004`) instead —
   they upgrade in place (amounts paise → rupees, status split, courier and admin
   tables, order tracking) and are safe to re-run.
   Copy the project URL and the `service_role` key into `SUPABASE_URL` /
   `SUPABASE_SERVICE_ROLE_KEY`.
2. **Resend** — create an API key (`RESEND_API_KEY`), verify your sending
   domain, and set `EMAIL_FROM` and `ORDER_ALERT_EMAIL`. Without a verified
   domain Resend only delivers to your own account email.
3. **Razorpay webhook** — Dashboard -> Settings -> Webhooks -> Add: URL
   `https://<your-domain>/api/webhooks/razorpay`, event `payment.captured`,
   and a secret of your choosing that you also set as
   `RAZORPAY_WEBHOOK_SECRET`. Make sure payment auto-capture is enabled
   (Settings -> Payment Capture), otherwise `payment.captured` never fires.
   Locally, expose the dev server with a tunnel (e.g. `ngrok http 3000`).
4. Add all the variables from `.env.local.example` to your hosting provider
   (e.g. Vercel -> Project Settings -> Environment Variables) too.

## Track my order (`/track`)

Customers enter the email or Indian mobile number they used at checkout and see
their paid orders: a progress bar, the items and total, and — once shipped — the
courier, AWB and (if the courier has a tracking-link template) a link to track it.

Because anyone can type any email or number, the page only ever returns the order
reference, items, total, status and courier/AWB — never the address, contact
details, notes or internal ids — and only for paid orders. It is rate-limited per IP
(20), per email/number (10) and overall (400) per 15 minutes; it fails closed if the
limiter can't run, and identifiers are stored only as SHA-256 hashes. The visitor's IP
comes from a header the platform sets (`x-vercel-forwarded-for` on Vercel), never from a
client-supplied `X-Forwarded-For`. To tighten it further, require the order number as
well (or add an OTP once you can send SMS/verified email).

## Admin panel (`/admin`)

A private back office for running the store: **orders, couriers & AWBs,
contact messages, newsletter subscribers**.

- **Orders** — every order with its items, customer, address, payment and a
  timeline. Filter by status, payment, city, courier and date range, search by
  order ref / name / email / phone / AWB, and export the current view to CSV.
  Paid orders that still need shipping are highlighted on the dashboard.
- **Fulfilment** — move an order through *Confirmed → Processing → Shipped →
  Delivered* (or *Cancelled*). Invalid jumps are refused server-side; an unpaid
  order can only be cancelled, and it becomes Confirmed by itself when Razorpay
  confirms payment.
- **Courier + AWB** — pick a courier from the **Couriers** master list, enter the
  AWB, and mark the order shipped. The customer is emailed the courier, AWB and
  (if the courier has a tracking-link template such as
  `https://courier.example/track?no={awb}`) a tracking link. Orders keep the
  courier name/link they shipped with, so editing the list never rewrites history.
- **Refunds** — cancel a paid order, refund it in the Razorpay dashboard, then
  mark it refunded here (the panel doesn't move money itself).
- **Messages / Subscribers** — the contact-form inbox (mark handled, reply) and the
  newsletter list (CSV export, remove).

Money is stored in **rupees** (`orders.amount`); it is converted to paise only when
talking to Razorpay.

### Creating the first admin

There is no public sign-up. Create accounts from the command line (needs
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`):

```bash
npm run admin:create -- you@example.com            # generates a strong password and prints it once
npm run admin:create -- you@example.com "12+ char passphrase" --name "Your Name"
```

Re-running it for an existing email resets that admin's password and signs out
all their sessions. Sign in at `/admin`, then change the password under
**Account**.

### How it's secured

- Passwords are hashed with scrypt; only the hash is stored.
- Sessions are random 256-bit tokens in an HttpOnly, SameSite=Lax cookie
  (`__Host-` prefixed and Secure in production). Only a SHA-256 of the token is
  stored, so signing out, changing your password, or "Sign out other devices"
  revokes sessions for real. They expire after 8 hours, or 2 hours idle.
- Failed sign-ins are rate-limited per email (8) and per IP (12) per 15 minutes;
  the error message never reveals whether an email exists.
- Every admin page, Server Action and export re-checks the session against the
  database — `proxy.js` is only an early redirect, not the security boundary.
  Server Actions also enforce a same-origin check.
- `/admin` is `noindex`, uncached and can't be framed. Customer-controlled text is
  escaped in emails and neutralised in CSV exports (formula injection).
- The database tables have Row Level Security on with no policies, so the public
  Supabase key can read nothing; only the server's service-role key can.

## Deployment

Easiest path is [Vercel](https://vercel.com/new) (built by the makers of
Next.js) — connect the repo and it deploys automatically. Any Node.js host
that supports Next.js also works.
