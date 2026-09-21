import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboard } from "@/lib/admin/data";
import { formatRupees } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/order-status";
import { Card, EmptyState, PageHeader, Stat, StatusBadge } from "@/components/admin/ui";
import OrdersTable from "@/components/admin/OrdersTable";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const d = await getDashboard();
  const hello = admin.name ? `Welcome back, ${admin.name.split(" ")[0]}` : "Welcome back";

  return (
    <>
      <PageHeader title="Dashboard" description={hello} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="To ship" value={d.toShip} sub="Paid, not yet shipped" href="/admin/orders?status=confirmed" />
        <Stat label="In transit" value={d.counts.shipped} sub="Shipped, not delivered" href="/admin/orders?status=shipped" />
        <Stat label="Revenue · 30 days" value={formatRupees(d.revenue30)} sub={`${d.orders30} paid order${d.orders30 === 1 ? "" : "s"}`} />
        <Stat label="Revenue · all time" value={formatRupees(d.revenue)} sub={`${d.unpaid} unpaid checkout${d.unpaid === 1 ? "" : "s"}`} href="/admin/orders?payment=pending" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Orders waiting to ship"
          className="xl:col-span-2"
          action={<Link href="/admin/orders?status=confirmed" className="text-xs font-medium text-gold-deep hover:underline">View all →</Link>}
        >
          <div className="-m-5">
            {d.needsAction.length === 0 ? (
              <EmptyState>Nothing waiting — every paid order has shipped. 🎉</EmptyState>
            ) : (
              <OrdersTable rows={d.needsAction} compact />
            )}
          </div>
        </Card>

        <Card title="Paid orders by status">
          <ul className="space-y-2.5">
            {ORDER_STATUSES.filter((s) => s !== "awaiting_payment").map((s) => (
              <li key={s} className="flex items-center justify-between text-sm">
                <Link href={`/admin/orders?status=${s}`} className="hover:opacity-80"><StatusBadge status={s} /></Link>
                <span className="font-medium tabular-nums text-ink">{d.counts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-stone-400">
            {STATUS_LABELS.cancelled} orders that are still marked Paid need a refund from Razorpay.
          </p>
        </Card>
      </div>

      <Card
        title="Latest paid orders"
        className="mt-6"
        action={<Link href="/admin/orders" className="text-xs font-medium text-gold-deep hover:underline">All orders →</Link>}
      >
        <div className="-m-5">
          {d.recent.length === 0 ? <EmptyState>No paid orders yet.</EmptyState> : <OrdersTable rows={d.recent} compact />}
        </div>
      </Card>
    </>
  );
}
