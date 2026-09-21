// Small presentational pieces shared across the admin panel. No "use client" and
// no server-only imports, so both server and client components can use them.

import Link from "next/link";
import {
  PAYMENT_LABELS,
  PAYMENT_TONES,
  STATUS_LABELS,
  STATUS_TONES,
} from "@/lib/order-status";

export const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-stone-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-stone-100 disabled:text-stone-500";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50";
export const btnGold =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3.5">
          {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const pill = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function StatusBadge({ status }) {
  return <span className={`${pill} ${STATUS_TONES[status] ?? STATUS_TONES.awaiting_payment}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export function PaymentBadge({ status }) {
  return <span className={`${pill} ${PAYMENT_TONES[status] ?? PAYMENT_TONES.pending}`}>{PAYMENT_LABELS[status] ?? status}</span>;
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>}
    </label>
  );
}

export function Notice({ tone = "info", children }) {
  const tones = {
    info: "border-stone-200 bg-stone-50 text-stone-700",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return <div className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>{children}</div>;
}

export function Stat({ label, value, sub, href }) {
  const body = (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-400">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function EmptyState({ children }) {
  return <p className="px-5 py-10 text-center text-sm text-stone-500">{children}</p>;
}
