"use server";

import { lookupOrders } from "@/lib/tracking";

// Server Action behind the "Track my order" form. Returns
// { orders, type } or { error, code } — see lib/tracking.js for what an order contains.
export async function trackOrdersAction(_prev, formData) {
  // Hidden "website" field: people never fill it, bots do.
  if (formData.get("website")) return { orders: [], type: "email" };
  return lookupOrders(formData.get("identifier"));
}
