"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { btnPrimary, inputCls, Field, Notice } from "@/components/admin/ui";

export default function LoginForm({ next }) {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email">
        <input name="email" type="email" required autoComplete="username" autoFocus defaultValue={state?.email ?? ""} className={inputCls} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
