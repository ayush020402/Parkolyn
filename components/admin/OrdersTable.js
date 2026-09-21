import Link from "next/link";
import { PaymentBadge, StatusBadge } from "@/components/admin/ui";
import { formatDateTime, formatRupees, itemsSummary } from "@/lib/format";

// Used by the dashboard and the orders list. Server component.
export default function OrdersTable({ rows, compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-4 py-2.5 font-medium">Order</th>
            <th className="px-4 py-2.5 font-medium">Customer</th>
            {!compact && <th className="px-4 py-2.5 font-medium">City</th>}
            <th className="px-4 py-2.5 font-medium">Items</th>
            <th className="px-4 py-2.5 text-right font-medium">Amount</th>
            <th className="px-4 py-2.5 font-medium">Payment</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            {!compact && <th className="px-4 py-2.5 font-medium">Shipment</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((o) => (
            <tr key={o.id} className="align-top transition hover:bg-stone-50/70">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${o.id}`} className="whitespace-nowrap font-medium text-ink underline-offset-2 hover:text-gold-deep hover:underline">
                  {o.order_ref}
                </Link>
                <div className="mt-0.5 text-xs text-stone-400">{formatDateTime(o.created_at)}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{o.customer_name}</div>
                <div className="text-xs text-stone-500">{o.customer_phone}</div>
              </td>
              {!compact && (
                <td className="px-4 py-3 text-stone-700">
                  {o.shipping_city || <span className="text-stone-300">—</span>}
                  {o.shipping_state && <div className="text-xs text-stone-400">{o.shipping_state}</div>}
                </td>
              )}
              <td className="max-w-[220px] px-4 py-3 text-stone-600">{itemsSummary(o.items)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">{formatRupees(o.amount)}</td>
              <td className="px-4 py-3"><PaymentBadge status={o.payment_status} /></td>
              <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              {!compact && (
                <td className="px-4 py-3 text-xs text-stone-600">
                  {o.courier_name ? (
                    <>
                      <div className="font-medium text-ink">{o.courier_name}</div>
                      <div className="font-mono text-stone-500">{o.awb_number}</div>
                    </>
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
