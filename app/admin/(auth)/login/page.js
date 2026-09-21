import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { getAdmin } from "@/lib/admin/auth";
import { safeAdminPath } from "@/lib/admin/constants";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const target = safeAdminPath(Array.isArray(next) ? next[0] : next);

  // Already signed in? Skip the form.
  if (await getAdmin()) redirect(target);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-[family-name:var(--font-brand)] text-2xl tracking-wide">Parkolyn Amsterdam</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Admin</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="mb-5 text-lg font-semibold">Sign in</h1>
          <LoginForm next={target} />
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">Authorised staff only. Activity is logged.</p>
      </div>
    </div>
  );
}
