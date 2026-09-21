import { requireAdmin } from "@/lib/admin/auth";
import { listCouriers } from "@/lib/admin/data";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { AddCourierForm, CourierRow } from "./CourierForms";

export const metadata = { title: "Couriers" };

export default async function CouriersPage() {
  await requireAdmin();
  const couriers = await listCouriers();

  return (
    <>
      <PageHeader
        title="Couriers"
        description="The master list you pick from when adding an AWB to an order."
      />

      <Card title="Add a courier" className="mb-6">
        <AddCourierForm />
      </Card>

      <Card title={`Courier list (${couriers.length})`}>
        <div className="-m-5">
          {couriers.length === 0 ? (
            <EmptyState>No couriers yet — add your first one above.</EmptyState>
          ) : (
            <ul className="divide-y divide-stone-100">
              {couriers.map((c) => <CourierRow key={c.id} courier={c} />)}
            </ul>
          )}
        </div>
      </Card>

      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-stone-500">
        A tracking link is optional. When one is set, the shipping email and the order page link straight to the courier&apos;s
        tracking page for that AWB. Orders keep the courier name and link they were shipped with, so renaming or switching a
        courier off never rewrites history.
      </p>
    </>
  );
}
