// Formatting helpers shared by emails and the admin panel (no server-only imports).

const TZ = "Asia/Kolkata";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// Amounts are stored in rupees (numeric), so this takes rupees, not paise.
export function formatRupees(amount) {
  return rupees.format(Number(amount) || 0);
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" });
}

// "Flat 4, MG Road\nBengaluru, Karnataka - 560001" from an order row.
export function formatAddress(order) {
  const place = [order.shipping_city, order.shipping_state].filter(Boolean).join(", ");
  const last = [place, order.shipping_pincode].filter(Boolean).join(" - ");
  return [order.shipping_address, last].filter(Boolean).join("\n");
}

export function itemsSummary(items) {
  return (items ?? []).map((i) => `${i.name} × ${i.qty}`).join(", ");
}

export function itemCount(items) {
  return (items ?? []).reduce((n, i) => n + (Number(i.qty) || 0), 0);
}
