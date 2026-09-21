"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteSubscriber } from "@/lib/admin/data";

export async function deleteSubscriberAction(formData) {
  await requireAdmin();
  await deleteSubscriber(String(formData.get("id") ?? ""));
  revalidatePath("/admin/subscribers");
}
