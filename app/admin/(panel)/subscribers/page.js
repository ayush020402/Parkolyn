import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listSubscribers } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/format";
import { btnDanger, btnGhost, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteSubscriberAction } from "./actions";

export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  await requireAdmin();
  const { rows, total } = await listSubscribers();

  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        description={`${total} ${total === 1 ? "person has" : "people have"} joined the launch list.`}
        actions={<Link href="/admin/subscribers/export" prefetch={false} className={btnGhost}>Export CSV</Link>}
      />
      <Card>
        <div className="-m-5">
          {rows.length === 0 ? (
            <EmptyState>No subscribers yet.</EmptyState>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5">{s.email}</td>
                    <td className="px-4 py-2.5 text-stone-500">{formatDateTime(s.created_at)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <form action={deleteSubscriberAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <ConfirmButton message={`Remove ${s.email} from the list?`} className={`${btnDanger} !px-2.5 !py-1 text-xs`}>
                          Remove
                        </ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </>
  );
}
