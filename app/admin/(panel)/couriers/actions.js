"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createCourier, deleteCourier, setCourierActive, updateCourier } from "@/lib/admin/data";

async function run(fn) {
  await requireAdmin();
  const result = await fn();
  if (result.ok) revalidatePath("/admin/couriers");
  return result;
}

export async function createCourierAction(_prev, formData) {
  return run(() =>
    createCourier({ name: formData.get("name"), trackingUrlTemplate: formData.get("tracking_url_template") })
  );
}

export async function updateCourierAction(_prev, formData) {
  return run(() =>
    updateCourier(String(formData.get("id") ?? ""), {
      name: formData.get("name"),
      trackingUrlTemplate: formData.get("tracking_url_template"),
    })
  );
}

export async function toggleCourierAction(_prev, formData) {
  return run(() => setCourierActive(String(formData.get("id") ?? ""), formData.get("active") === "true"));
}

export async function deleteCourierAction(_prev, formData) {
  return run(() => deleteCourier(String(formData.get("id") ?? "")));
}
