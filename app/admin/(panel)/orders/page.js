import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listCities, listCouriers, listOrders, normalizeOrderFilters } from "@/lib/admin/data";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/order-status";
import { btnGhost, btnGold, Card, EmptyState, Field, PageHeader, inputCls } from "@/components/admin/ui";
import OrdersTable from "@/components/admin/OrdersTable";

export const metadata = { title: "Orders" };

// Builds /admin/orders?… links that keep the current filters.
function href(base, filters, overrides = {}) {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === "" || v == null) continue;
    if (k === "payment" && v === "paid") continue; // default
    if (k === "status" && v === "all") continue;
    if (k === "sort" && v === "newest") continue;
    if (k === "page" && Number(v) <= 1) continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export default async function OrdersPage({ searchParams }) {
  await requireAdmin();
  const filters = normalizeOrderFilters(await searchParams);
  const [{ rows, total, page, pageSize }, cities, couriers] = await Promise.all([
    listOrders(filters),
    listCities(),
    listCouriers(),
  ]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const advancedActive = Boolean(
    filters.city || filters.courier || filters.from || filters.to || filters.payment !== "paid" || filters.sort !== "newest"
  );
  const filtered =
    filters.q || filters.city || filters.courier || filters.from || filters.to || filters.status !== "all" || filters.payment !== "paid";

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"}${filtered ? " match these filters" : ""}`}
        actions={
          <Link href={href("/admin/orders/export", filters, { page: 1 })} prefetch={false} className={btnGhost}>
            Export CSV
          </Link>
        }
      />

      {/* Status tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-stone-200">
        {["all", ...ORDER_STATUSES.filter((s) => s !== "awaiting_payment")].map((s) => {
          const active = filters.status === s;
          return (
            <Link
              key={s}
              href={href("/admin/orders", filters, { status: s, page: 1 })}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition ${
                active ? "border-gold text-ink" : "border-transparent text-stone-500 hover:text-ink"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </Link>
          );
        })}
      </div>

      {/* Filters — a plain GET form, so it works without any client JS. Search is always
          visible; the rest folds away (open by default while any of them is active). */}
      <Card className="mb-5">
        <form method="get" action="/admin/orders">
          {filters.status !== "all" && <input type="hidden" name="status" value={filters.status} />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Search">
                <input name="q" defaultValue={filters.q} placeholder="Order ref, name, email, phone, AWB…" className={inputCls} />
              </Field>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/orders" className={btnGhost}>Reset</Link>
              <button type="submit" className={btnGold}>Apply filters</button>
            </div>
          </div>

          <details className="mt-4" open={advancedActive}>
            <summary className="cursor-pointer select-none text-sm font-medium text-gold-deep">
              City, payment, courier &amp; dates{advancedActive ? " (active)" : ""}
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Field label="City">
                <input name="city" defaultValue={filters.city} list="admin-cities" placeholder="Any city" className={inputCls} />
                <datalist id="admin-cities">
                  {cities.map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <Field label="Payment">
                <select name="payment" defaultValue={filters.payment} className={inputCls}>
                  <option value="paid">Paid</option>
                  <option value="pending">Unpaid / abandoned</option>
                  <option value="refunded">Refunded</option>
                  <option value="all">Any</option>
                </select>
              </Field>
              <Field label="Courier">
                <select name="courier" defaultValue={filters.courier} className={inputCls}>
                  <option value="">Any courier</option>
                  {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="From date">
                <input type="date" name="from" defaultValue={filters.from} className={inputCls} />
              </Field>
              <Field label="To date">
                <input type="date" name="to" defaultValue={filters.to} className={inputCls} />
              </Field>
              <Field label="Sort">
                <select name="sort" defaultValue={filters.sort} className={inputCls}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </Field>
            </div>
          </details>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="-m-5">
          {rows.length === 0 ? (
            <EmptyState>
              No orders match.{" "}
              {filters.payment === "paid" && <>Unpaid checkouts are hidden by default — change <strong>Payment</strong> to “Any” to see them.</>}
            </EmptyState>
          ) : (
            <OrdersTable rows={rows} />
          )}
        </div>
      </Card>

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-stone-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link className={btnGhost} href={href("/admin/orders", filters, { page: page - 1 })}>← Previous</Link>}
            {page < pages && <Link className={btnGhost} href={href("/admin/orders", filters, { page: page + 1 })}>Next →</Link>}
          </div>
        </nav>
      )}
    </>
  );
}
