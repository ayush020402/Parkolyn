import Link from "next/link";

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const order = params?.order;

  return (
    <div className="container-px flex flex-col items-center justify-center py-32 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 text-gold">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h1 className="mt-6 font-serif text-3xl">Payment Received</h1>
      {order && (
        <p className="mt-2 text-sm text-ink-dim">
          Order reference <span className="text-gold">{order}</span>
        </p>
      )}
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim">
        Thank you for reserving with Parkolyn Amsterdam — your payment was
        successful. Our team will reach out shortly to confirm shipping
        details as your fragrance completes production.
      </p>
      <Link
        href="/perfumes"
        className="mt-9 rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition hover:bg-gold-light"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
