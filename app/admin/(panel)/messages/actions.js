"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteMessage, setMessageHandled } from "@/lib/admin/data";

export async function toggleHandledAction(formData) {
  await requireAdmin();
  await setMessageHandled(String(formData.get("id") ?? ""), formData.get("handled") === "true");
  revalidatePath("/admin", "layout");
}

export async function deleteMessageAction(formData) {
  await requireAdmin();
  await deleteMessage(String(formData.get("id") ?? ""));
  revalidatePath("/admin", "layout");
}
