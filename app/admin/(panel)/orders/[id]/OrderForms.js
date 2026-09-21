"use client";

import { useActionForm } from "@/components/useActionForm";
import { STATUS_LABELS } from "@/lib/order-status";
import { btnDanger, btnGhost, btnGold, btnPrimary, Field, Notice, inputCls } from "@/components/admin/ui";
import {
  markRefundedAction,
  resendConfirmationAction,
  saveNotesAction,
  saveShippingAction,
  updateStatusAction,
} from "./actions";

function Result({ state }) {
  if (!state) return null;
  if (state.error) return <Notice tone="error">{state.error}</Notice>;
  if (state.message) return <Notice tone={state.message.includes("⚠") ? "warn" : "success"}>{state.message}</Notice>;
  return null;
}

// -------------------------------------------------------------------- status

export function StatusForm({ order, options }) {
  const { state, pending, onSubmit } = useActionForm(updateStatusAction, order.updated_at);

  if (options.length === 0) {
    return <p className="text-sm text-stone-500">No further status changes are available for this order.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" key={order.updated_at}>
      <input type="hidden" name="id" value={order.id} />
      <Field label="Move to">
        <select name="status" required defaultValue={options[0]} className={inputCls}>
          {options.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </Field>
      <Field label="Note (optional)" hint="Saved to the order timeline.">
        <input name="note" maxLength={500} className={inputCls} placeholder="e.g. Customer asked to cancel" />
      </Field>
      <Result state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------ shipping

export function ShippingForm({ order, couriers }) {
  const { state, pending, onSubmit } = useActionForm(saveShippingAction, order.updated_at);
  const alreadyShipped = ["shipped", "delivered"].includes(order.status);

  // Active couriers, plus the one already on the order even if it was switched off since.
  const options = couriers.filter((c) => c.active || c.id === order.courier_id);

  if (order.payment_status !== "paid" || !["confirmed", "processing", "shipped", "delivered"].includes(order.status)) {
    return (
      <p className="text-sm text-stone-500">
        Courier details can be added once the order is paid and hasn&apos;t been cancelled.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" key={`${order.updated_at}-${order.awb_number}`}>
      <input type="hidden" name="id" value={order.id} />
      <Field label="Courier">
        <select name="courier_id" required defaultValue={order.courier_id ?? ""} className={inputCls}>
          <option value="" disabled>Select a courier…</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.active ? "" : " (off)"}</option>
          ))}
        </select>
      </Field>
      <Field label="AWB / tracking number">
        <input
          name="awb"
          required
          maxLength={40}
          defaultValue={order.awb_number ?? ""}
          autoComplete="off"
          spellCheck={false}
          className={`${inputCls} font-mono uppercase`}
          placeholder="e.g. 1234567890"
        />
      </Field>

      {!alreadyShipped && (
        <label className="flex items-start gap-2 text-sm text-stone-700">
          <input type="checkbox" name="mark_shipped" defaultChecked className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" />
          <span>Mark the order as <strong>Shipped</strong> now</span>
        </label>
      )}
      <label className="flex items-start gap-2 text-sm text-stone-700">
        <input type="checkbox" name="notify" defaultChecked className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]" />
        <span>
          Email the customer the tracking details
          <span className="block text-xs text-stone-400">
            {alreadyShipped ? "Sent only if the courier or AWB changed." : "Sent when the order is marked as shipped."}
          </span>
        </span>
      </label>

      <Result state={state} />
      <button type="submit" disabled={pending} className={alreadyShipped ? btnPrimary : btnGold}>
        {pending ? "Saving…" : alreadyShipped ? "Update tracking details" : "Save shipping details"}
      </button>
    </form>
  );
}

// --------------------------------------------------------------------- notes

export function NotesForm({ order }) {
  const { state, pending, onSubmit } = useActionForm(saveNotesAction, order.updated_at);
  return (
    <form onSubmit={onSubmit} className="space-y-3" key={order.updated_at}>
      <input type="hidden" name="id" value={order.id} />
      <textarea
        name="admin_notes"
        rows={4}
        maxLength={2000}
        defaultValue={order.admin_notes ?? ""}
        placeholder="Only visible to admins — e.g. packing instructions, call log…"
        className={`${inputCls} resize-y`}
      />
      <Result state={state} />
      <button type="submit" disabled={pending} className={btnGhost}>
        {pending ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}

// ------------------------------------------------------------- small actions

export function RefundButton({ order }) {
  const { state, pending, onSubmit } = useActionForm(markRefundedAction, order.updated_at);
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        if (!window.confirm("Mark this order as refunded?\n\nDo this AFTER you've issued the refund in the Razorpay dashboard.")) {
          e.preventDefault();
          return;
        }
        onSubmit(e);
      }}
    >
      <input type="hidden" name="id" value={order.id} />
      <Result state={state} />
      <button type="submit" disabled={pending} className={btnDanger}>
        {pending ? "Saving…" : "Mark as refunded"}
      </button>
    </form>
  );
}

export function ResendConfirmationButton({ order }) {
  const { state, pending, onSubmit } = useActionForm(resendConfirmationAction, order.updated_at);
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input type="hidden" name="id" value={order.id} />
      <button type="submit" disabled={pending} className={btnGhost}>
        {pending ? "Sending…" : "Re-send confirmation email"}
      </button>
      <Result state={state} />
    </form>
  );
}
