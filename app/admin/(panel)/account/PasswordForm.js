"use client";

import { useActionForm } from "@/components/useActionForm";
import { btnGold, Field, Notice, inputCls } from "@/components/admin/ui";
import { changePasswordAction } from "./actions";

export default function PasswordForm() {
  const { state, pending, onSubmit } = useActionForm(changePasswordAction);

  return (
    // Remount on success so the password fields are emptied.
    <form onSubmit={onSubmit} className="max-w-md space-y-3" key={state?.message ?? "form"}>
      <Field label="Current password">
        <input name="current" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      <Field label="New password" hint="At least 12 characters. A few random words make a strong, memorable passphrase.">
        <input name="next" type="password" required minLength={12} maxLength={200} autoComplete="new-password" className={inputCls} />
      </Field>
      <Field label="Confirm new password">
        <input name="confirm" type="password" required minLength={12} maxLength={200} autoComplete="new-password" className={inputCls} />
      </Field>
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      {state?.message && <Notice tone="success">{state.message}</Notice>}
      <button type="submit" disabled={pending} className={btnGold}>{pending ? "Updating…" : "Change password"}</button>
    </form>
  );
}
