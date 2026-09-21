import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";
import { getNavCounts } from "@/lib/admin/data";
import { signOutAction } from "@/app/admin/actions";

// Every page in the panel renders inside this layout, which insists on a valid
// session before anything else happens. (Pages and actions check again — layouts
// don't re-run on client-side navigation, so this alone is never enough.)
export default async function PanelLayout({ children }) {
  const admin = await requireAdmin();
  const counts = await getNavCounts();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
      <aside className="border-b border-stone-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6">
        <div className="mb-4 flex items-center justify-between lg:mb-8 lg:block">
          <Link href="/admin" className="block">
            <span className="font-[family-name:var(--font-brand)] text-lg leading-none tracking-wide">Parkolyn Amsterdam</span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Admin</span>
          </Link>
          <form action={signOutAction} className="lg:hidden">
            <button className="text-xs font-medium text-stone-500 hover:text-ink">Sign out</button>
          </form>
        </div>
        <AdminNav counts={counts} />
        <div className="mt-8 hidden border-t border-stone-100 pt-4 lg:block">
          <p className="truncate text-xs text-stone-500" title={admin.email}>{admin.email}</p>
          <form action={signOutAction} className="mt-2">
            <button className="text-xs font-medium text-stone-600 underline-offset-2 hover:text-ink hover:underline">Sign out</button>
          </form>
          <Link href="/" target="_blank" className="mt-3 block text-xs text-stone-400 hover:text-ink">View storefront ↗</Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
