import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getOrder, getOrderEvents, listCouriers } from "@/lib/admin/data";
import { allowedNextStatuses } from "@/lib/order-status";
import { formatAddress, formatDateTime, formatRupees, itemCount } from "@/lib/format";
import { Card, Notice, PageHeader, PaymentBadge, StatusBadge } from "@/components/admin/ui";
import { NotesForm, RefundButton, ResendConfirmationButton, ShippingForm, StatusForm } from "./OrderForms";

export async function generateMetadata({ params }) {
  return { title: `Order ${(await params).id.slice(0, 8)}` };
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-stone-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-ink">{children}</dd>
    </div>
  );
}

export default async function OrderPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const [events, couriers] = await Promise.all([getOrderEvents(order.id), listCouriers()]);
  const subtotal = order.items.reduce((n, i) => n + i.price * i.qty, 0);
  const address = formatAddress(order);
  const needsRefund = order.payment_status === "paid" && order.status === "cancelled";

  return (
    <>
      <div className="mb-3 text-sm">
        <Link href="/admin/orders" className="text-stone-500 hover:text-ink">← All orders</Link>
      </div>
      <PageHeader
        title={order.order_ref}
        description={`Placed ${formatDateTime(order.created_at)}`}
        actions={
          <>
            <PaymentBadge status={order.payment_status} />
            <StatusBadge status={order.status} />
          </>
        }
      />

      {needsRefund && (
        <div className="mb-5">
          <Notice tone="warn">
            This order was cancelled but the customer&apos;s payment hasn&apos;t been refunded. Refund it from the Razorpay dashboard, then mark it refunded here.
          </Notice>
        </div>
      )}
      {order.payment_status === "pending" && order.status !== "cancelled" && (
        <div className="mb-5">
          <Notice>Payment hasn&apos;t come through yet. This is usually an abandoned checkout; it turns into a confirmed order automatically if the customer pays.</Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---- left: what was ordered, who, where, history ---- */}
        <div className="space-y-6 lg:col-span-2">
          <Card title={`Items (${itemCount(order.items)})`}>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="pb-2 text-left font-medium">Product</th>
                  <th className="pb-2 text-right font-medium">Price</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((i) => (
                  <tr key={i.slug}>
                    <td className="py-2.5 font-medium">{i.name}</td>
                    <td className="py-2.5 text-right tabular-nums text-stone-600">{formatRupees(i.price)}</td>
                    <td className="py-2.5 text-right tabular-nums text-stone-600">{i.qty}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatRupees(i.price * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-stone-200">
                  <td colSpan={3} className="pt-3 text-right font-semibold">Total charged</td>
                  <td className="pt-3 text-right font-semibold tabular-nums">{formatRupees(order.amount)}</td>
                </tr>
                {Math.round(subtotal * 100) !== Math.round(Number(order.amount) * 100) && (
                  <tr><td colSpan={4} className="pt-1 text-right text-xs text-amber-700">Items add up to {formatRupees(subtotal)} — differs from the amount charged.</td></tr>
                )}
              </tfoot>
            </table>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer">
              <p className="font-medium">{order.customer_name}</p>
              <p className="mt-1 text-sm"><a className="text-gold-deep hover:underline" href={`mailto:${order.customer_email}`}>{order.customer_email}</a></p>
              <p className="text-sm"><a className="text-gold-deep hover:underline" href={`tel:${order.customer_phone}`}>{order.customer_phone}</a></p>
              {order.notes && (
                <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">Customer&apos;s note</p>
                  <p className="whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </Card>
            <Card title="Shipping address">
              <p className="whitespace-pre-line text-sm leading-relaxed">{address}</p>
              {!order.shipping_city && (
                <p className="mt-3 text-xs text-stone-400">Placed before structured addresses were introduced — no separate city/PIN on file.</p>
              )}
            </Card>
          </div>

          <Card title="Timeline">
            {events.length === 0 ? (
              <p className="text-sm text-stone-500">No activity recorded.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-stone-200 pl-5">
                {events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-gold ring-4 ring-white" />
                    <p className="text-sm text-ink">{e.message}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{formatDateTime(e.created_at)} · {e.actor}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* ---- right: things you can change ---- */}
        <div className="space-y-6">
          <Card title="Shipping">
            {order.tracking_url && (
              <p className="mb-3 text-sm">
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="font-medium text-gold-deep hover:underline">
                  Open courier tracking ↗
                </a>
              </p>
            )}
            <ShippingForm order={order} couriers={couriers} />
            {order.shipped_at && <p className="mt-3 text-xs text-stone-400">Shipped {formatDateTime(order.shipped_at)}</p>}
            {order.delivered_at && <p className="text-xs text-stone-400">Delivered {formatDateTime(order.delivered_at)}</p>}
          </Card>

          <Card title="Order status">
            <StatusForm order={order} options={allowedNextStatuses(order)} />
            {needsRefund && (
              <div className="mt-4 border-t border-stone-100 pt-4">
                <RefundButton order={order} />
              </div>
            )}
          </Card>

          <Card title="Internal note">
            <NotesForm order={order} />
          </Card>

          <Card title="Payment">
            <dl className="divide-y divide-stone-100">
              <Row label="Amount">{formatRupees(order.amount)}</Row>
              <Row label="Paid at">{formatDateTime(order.paid_at)}</Row>
              <Row label="Razorpay order"><span className="font-mono text-xs">{order.razorpay_order_id}</span></Row>
              <Row label="Razorpay payment"><span className="font-mono text-xs">{order.razorpay_payment_id ?? "—"}</span></Row>
              <Row label="Emails sent">{order.emails_sent_at ? formatDateTime(order.emails_sent_at) : order.payment_status === "pending" ? "—" : "Not yet"}</Row>
            </dl>
            {order.payment_status !== "pending" && (
              <div className="mt-4">
                <ResendConfirmationButton order={order} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
