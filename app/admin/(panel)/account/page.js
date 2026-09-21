import { listSessions, requireAdmin } from "@/lib/admin/auth";
import { formatDateTime } from "@/lib/format";
import { btnGhost, Card, PageHeader } from "@/components/admin/ui";
import PasswordForm from "./PasswordForm";
import { signOutOthersAction } from "./actions";

export const metadata = { title: "Account" };

// "Chrome on Windows"-style summary of a User-Agent string.
function describeAgent(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "unknown device";
  return `${browser} on ${os}`;
}

export default async function AccountPage() {
  const admin = await requireAdmin();
  const sessions = await listSessions(admin);
  const others = sessions.filter((s) => !s.current).length;

  return (
    <>
      <PageHeader title="Account" description={admin.email} />
      <div className="space-y-6">
        <Card title="Change password">
          <PasswordForm />
        </Card>

        <Card
          title={`Signed-in sessions (${sessions.length})`}
          action={
            others > 0 && (
              <form action={signOutOthersAction}>
                <button type="submit" className={btnGhost}>Sign out other devices</button>
              </form>
            )
          }
        >
          <ul className="divide-y divide-stone-100">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <p className="font-medium">
                    {describeAgent(s.user_agent)}
                    {s.current && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">This device</span>}
                  </p>
                  <p className="text-xs text-stone-400">IP {s.ip} · signed in {formatDateTime(s.created_at)}</p>
                </div>
                <p className="text-xs text-stone-500">Last active {formatDateTime(s.last_seen_at)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-stone-400">
            Sessions end automatically after 8 hours, or 2 hours of inactivity. If you see a device you don&apos;t recognise,
            change your password — that signs everything else out.
          </p>
        </Card>
      </div>
    </>
  );
}
