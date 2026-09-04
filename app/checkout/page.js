"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/products";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const orderId = data.orderId;
      clearCart();
      router.push(`/checkout/success?order=${orderId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-px flex flex-col items-center justify-center py-32 text-center">
        <h1 className="font-serif text-3xl">Nothing to check out</h1>
        <p className="mt-3 text-sm text-ink-dim">Your bag is currently empty.</p>
        <Link
          href="/perfumes"
          className="mt-8 rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition hover:bg-gold-light"
        >
          Shop the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-px py-16">
      <h1 className="font-serif text-3xl">Checkout</h1>
      <p className="mt-2 max-w-lg text-sm text-ink-dim">
        Reserve your bottles now. Since Parkolyn Amsterdam&apos;s debut collection
        is in its first production run, orders are confirmed by our team and
        payment is finalized before shipping.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Phone" required>
              <input
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Shipping Address" required>
            <textarea
              required
              rows={3}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="input resize-none"
            />
          </Field>
          <Field label="Order Notes (optional)">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="input resize-none"
            />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold py-3.5 text-sm font-medium text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Processing…" : "Confirm Reservation"}
          </button>
          <p className="text-xs text-ink-dim/70">
            Payment gateway integration is in progress — confirming here
            reserves your order and our team will follow up to complete
            payment securely.
          </p>
        </form>

        <div className="h-fit rounded-2xl border hairline bg-surface p-7">
          <h2 className="font-serif text-xl">Order Summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.slug} className="flex justify-between text-ink-dim">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>{formatINR(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t hairline pt-4 text-base">
            <span>Total</span>
            <span className="text-gold">{formatINR(subtotal)}</span>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--color-line);
          background: transparent;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--color-ink);
        }
        .input:focus {
          outline: none;
          border-color: var(--color-gold);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-ink-dim">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      {children}
    </label>
  );
}
