"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  changeOrderStatus,
  markRefunded,
  resendConfirmation,
  saveAdminNotes,
  saveShipping,
} from "@/lib/admin/data";

// Thin wrappers: authenticate, run the change, refresh the page. The rules
// (allowed transitions, validation, audit trail) live in lib/admin/data.js.
// Each returns { ok, message } or { error } for useActionState to display.

async function run(formData, fn) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const result = await fn(id);
  if (result.ok) revalidatePath("/admin", "layout");
  return result;
}

export async function updateStatusAction(_prev, formData) {
  return run(formData, (id) => changeOrderStatus(id, String(formData.get("status") ?? ""), formData.get("note")));
}

export async function saveShippingAction(_prev, formData) {
  return run(formData, (id) =>
    saveShipping(id, {
      courierId: String(formData.get("courier_id") ?? ""),
      awb: formData.get("awb"),
      markShipped: formData.get("mark_shipped") === "on",
      notify: formData.get("notify") === "on",
    })
  );
}

export async function saveNotesAction(_prev, formData) {
  return run(formData, (id) => saveAdminNotes(id, formData.get("admin_notes")));
}

export async function markRefundedAction(_prev, formData) {
  return run(formData, (id) => markRefunded(id));
}

export async function resendConfirmationAction(_prev, formData) {
  return run(formData, (id) => resendConfirmation(id));
}
