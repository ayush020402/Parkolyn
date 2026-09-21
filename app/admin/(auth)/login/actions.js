"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/admin/auth";
import { safeAdminPath } from "@/lib/admin/constants";

export async function loginAction(_prev, formData) {
  const result = await signIn({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  // React resets the form after every action; hand the email back so a typo'd
  // password doesn't also wipe the email field. (Never the password.)
  if (result.error) return { error: result.error, email: String(formData.get("email") ?? "") };
  redirect(safeAdminPath(formData.get("next")));
}
