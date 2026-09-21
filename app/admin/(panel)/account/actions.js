"use server";

import { revalidatePath } from "next/cache";
import { changePassword, requireAdmin, signOutOtherSessions } from "@/lib/admin/auth";

export async function changePasswordAction(_prev, formData) {
  const admin = await requireAdmin();
  const result = await changePassword(admin, {
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (result.error) return { error: result.error };
  revalidatePath("/admin/account");
  return { message: "Password changed. All your other sessions have been signed out." };
}

export async function signOutOthersAction() {
  const admin = await requireAdmin();
  await signOutOtherSessions(admin);
  revalidatePath("/admin/account");
}
