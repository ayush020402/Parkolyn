// Order status vocabulary shared by the admin UI and server actions.
// (No server-only imports — safe to use from client components.)
//
// Two independent fields on every order:
//   payment_status — did the money arrive?   pending | paid | refunded
//   status         — fulfilment progress     awaiting_payment → confirmed → processing → shipped → delivered  (or cancelled)

export const PAYMENT_STATUSES = ["pending", "paid", "refunded"];
export const ORDER_STATUSES = ["awaiting_payment", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export const PAYMENT_LABELS = { pending: "Unpaid", paid: "Paid", refunded: "Refunded" };
export const STATUS_LABELS = {
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Tailwind classes per status, for the badge pills.
export const STATUS_TONES = {
  awaiting_payment: "bg-stone-100 text-stone-600 ring-stone-200",
  confirmed: "bg-amber-50 text-amber-800 ring-amber-200",
  processing: "bg-blue-50 text-blue-800 ring-blue-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};
export const PAYMENT_TONES = {
  pending: "bg-stone-100 text-stone-600 ring-stone-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  refunded: "bg-purple-50 text-purple-800 ring-purple-200",
};

// Which statuses an order can be moved to from its current one. An unpaid
// order can only be cancelled — it becomes "confirmed" when Razorpay confirms
// the payment, never by hand.
const TRANSITIONS = {
  awaiting_payment: ["cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["confirmed", "shipped", "cancelled"],
  shipped: ["processing", "delivered"],
  delivered: ["shipped"],
  cancelled: [], // reopening depends on payment — see allowedNextStatuses
};

export function allowedNextStatuses(order) {
  if (order.status === "cancelled") {
    // Reopen a cancelled order only if the money situation allows it. Once the
    // payment has been refunded the order is final — the customer places a new one.
    if (order.payment_status === "paid") return ["confirmed"];
    if (order.payment_status === "pending") return ["awaiting_payment"];
    return [];
  }
  return TRANSITIONS[order.status] ?? [];
}

// Statuses that count as "paid orders that still need work".
export const ACTIVE_STATUSES = ["confirmed", "processing"];
