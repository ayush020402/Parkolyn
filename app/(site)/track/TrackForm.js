"use client";

import { useState } from "react";
import { useActionForm } from "@/components/useActionForm";
import { formatDate, formatRupees } from "@/lib/format";
import { trackOrdersAction } from "./actions";

const STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Preparing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function headline(order) {
  switch (order.stage) {
    case "confirmed":
      return "Order confirmed — we've received your payment and are getting your fragrance ready.";
    case "processing":
      return "Your order is being prepared for dispatch.";
    case "shipped":
      return `On its way${order.shippedAt ? ` — handed to the courier on ${formatDate(order.shippedAt)}` : ""}.`;
    case "delivered":
      return `Delivered${order.deliveredAt ? ` on ${formatDate(order.deliveredAt)}` : ""}. We hope you love it.`;
    default:
      return "";
  }
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // clipboard blocked (e.g. insecure context) — the number is still selectable
        }
      }}
      className="rounded-full border hairline px-3 py-1 text-[11px] uppercase tracking-widest text-ink-dim transition hover:border-gold hover:text-gold"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Stepper({ stage }) {
  const current = STEPS.findIndex((s) => s.key === stage);
  return (
    <ol className="flex items-start" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.key} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-[13px] h-px w-full ${i <= current ? "bg-gold" : "bg-line"}`}
              />
            )}
            <span
              aria-current={i === current ? "step" : undefined}
              className={`relative z-10 flex h-[27px] w-[27px] items-center justify-center rounded-full border text-[11px] ${
                done ? "border-gold bg-gold text-paper" : "border-line bg-paper text-ink-dim"
              } ${i === current ? "ring-4 ring-gold/20" : ""}`}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className={`mt-2 text-[11px] uppercase tracking-wider ${done ? "text-ink" : "text-ink-dim/60"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order }) {
  const cancelled = order.stage === "cancelled";
  return (
    <article className="rounded-2xl border hairline bg-surface p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Order</p>
          <h3 className="mt-1 font-serif text-2xl">{order.ref}</h3>
          <p className="mt-1 text-xs text-ink-dim">Placed {formatDate(order.placedAt)}</p>
        </div>
        <p className="font-serif text-xl text-gold">{formatRupees(order.total)}</p>
      </header>

      <div className="mt-7">
        {cancelled ? (
          <div className="rounded-xl border border-crimson/30 bg-crimson/5 p-4 text-sm leading-relaxed">
            <p className="font-medium text-crimson">This order was cancelled.</p>
            <p className="mt-1 text-ink-dim">
              {order.refunded ? (
                "Your payment has been refunded to your original payment method."
              ) : (
                <>
                  If you were charged, please write to{" "}
                  <a href="mailto:hello@parkolyn.com" className="text-gold underline-offset-2 hover:underline">
                    hello@parkolyn.com
                  </a>{" "}
                  and we&apos;ll arrange your refund.
                </>
              )}
            </p>
          </div>
        ) : (
          <>
            <Stepper stage={order.stage} />
            <p className="mt-5 text-sm leading-relaxed text-ink">{headline(order)}</p>
          </>
        )}
      </div>

      {order.courier && order.awb && !cancelled && (
        <div className="mt-6 rounded-xl border hairline p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Shipment</p>
          <dl className="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-dim">Courier</dt>
              <dd className="mt-0.5 font-medium">{order.courier}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-dim">Tracking number (AWB)</dt>
              <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="break-all font-mono font-medium tracking-wide">{order.awb}</span>
                <CopyButton value={order.awb} />
              </dd>
            </div>
          </dl>
          {order.trackingUrl ? (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-gold-light"
            >
              Track on {order.courier} ↗
            </a>
          ) : (
            <p className="mt-4 text-xs text-ink-dim">
              Enter this tracking number on {order.courier}&apos;s website to see live updates.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 border-t hairline pt-5">
        <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">Items</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {order.items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex justify-between gap-4 text-ink-dim">
              <span>{item.name}</span>
              <span>× {item.qty}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function TrackForm() {
  const { state, pending, onSubmit } = useActionForm(trackOrdersAction);

  return (
    <>
      <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Email address or mobile number</span>
          <input
            name="identifier"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="Email address or mobile number"
            className="w-full rounded-full border hairline bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink-dim/50 focus:border-gold focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition hover:bg-gold-light disabled:opacity-60"
        >
          {pending ? "Looking up…" : "Track order"}
        </button>
      </form>

      <div aria-live="polite" className="mt-8 space-y-6">
        {state?.error && <p className="text-sm text-crimson">{state.error}</p>}

        {state?.orders && state.orders.length === 0 && (
          <div className="rounded-2xl border hairline bg-surface p-8 text-sm leading-relaxed text-ink-dim">
            <p className="font-medium text-ink">We couldn&apos;t find an order for that {state.type === "phone" ? "number" : "email address"}.</p>
            <p className="mt-2">
              Check it for typos and use the same {state.type === "phone" ? "number" : "email"} you gave at checkout. Orders
              appear here once payment is confirmed.
            </p>
          </div>
        )}

        {state?.orders?.map((order) => <OrderCard key={order.ref} order={order} />)}
      </div>
    </>
  );
}
