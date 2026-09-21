import { requireAdmin } from "@/lib/admin/auth";
import { listMessages } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/format";
import { btnDanger, btnGhost, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteMessageAction, toggleHandledAction } from "./actions";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin();
  const messages = await listMessages();
  const open = messages.filter((m) => !m.handled_at).length;

  return (
    <>
      <PageHeader
        title="Contact messages"
        description={`${open} unhandled · ${messages.length} total. New messages are also emailed to you.`}
      />
      {messages.length === 0 ? (
        <Card><EmptyState>No messages yet.</EmptyState></Card>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id}>
              <Card className={m.handled_at ? "opacity-70" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {m.name}
                      {!m.handled_at && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold-deep">New</span>}
                    </p>
                    <p className="text-sm text-stone-500">
                      <a href={`mailto:${m.email}?subject=Re: your message to Parkolyn Amsterdam`} className="text-gold-deep hover:underline">{m.email}</a>
                      {" · "}{formatDateTime(m.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`mailto:${m.email}?subject=Re: your message to Parkolyn Amsterdam`} className={btnGhost}>Reply</a>
                    <form action={toggleHandledAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="handled" value={String(!m.handled_at)} />
                      <button type="submit" className={btnGhost}>{m.handled_at ? "Reopen" : "Mark handled"}</button>
                    </form>
                    <form action={deleteMessageAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton message="Delete this message permanently?" className={btnDanger}>Delete</ConfirmButton>
                    </form>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">{m.message}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
