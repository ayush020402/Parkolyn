"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/products";

const SAVED_DETAILS_KEY = "parkolyn_checkout_details_v1";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    // One-time hydration-safe read from localStorage (an external system) on
    // mount, kept separate from server render to avoid a hydration mismatch.
    try {
      const raw = window.localStorage.getItem(SAVED_DETAILS_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((f) => ({ ...f, ...JSON.parse(raw) }));
        setRemembered(true);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function saveDetails() {
    try {
      const { name, email, phone, address } = form;
      window.localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify({ name, email, phone, address }));
    } catch {
      // ignore storage write failures (e.g. private browsing)
    }
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

      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        throw new Error("Could not load the payment gateway. Please check your connection and try again.");
      }

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.razorpayOrderId,
          name: "Parkolyn Amsterdam",
          description: "Debut Fragrance Collection — Pre-Order",
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          notes: {
            address: form.address,
          },
          theme: { color: "#96742a" },
          handler: async function (response) {
            try {
              const verifyRes = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                reject(new Error(verifyData.error || "Payment verification failed. If you were charged, please contact support with your payment ID."));
                return;
              }
              saveDetails();
              clearCart();
              router.push(`/checkout/success?order=${data.orderId}`);
              resolve();
            } catch {
              reject(new Error("Could not verify payment. If you were charged, please contact support."));
            }
          },
          modal: {
            ondismiss: function () {
              reject(new Error("Payment was cancelled. You can try again when you're ready."));
            },
          },
        });

        rzp.on("payment.failed", function (response) {
          reject(new Error(response.error?.description || "Payment failed. Please try again."));
        });

        rzp.open();
      });
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
        Reserve your bottles now with secure payment via Razorpay. Since
        Parkolyn Amsterdam&apos;s debut collection is in its first production
        run, our team will confirm your order and keep you updated as it
        ships.
      </p>
      <p className="mt-3 max-w-lg text-xs text-ink-dim/70">
        {remembered
          ? "Welcome back — we've filled in your saved details below. Update anything that's changed."
          : "No account needed. Check out as a guest — we'll remember these details on this device for a faster checkout next time."}
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
            {loading ? "Processing…" : `Proceed to Payment — ${formatINR(subtotal)}`}
          </button>
          <p className="text-xs text-ink-dim/70">
            You&apos;ll be redirected to Razorpay&apos;s secure checkout to
            complete payment. We never see or store your card details.
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
