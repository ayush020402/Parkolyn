"use server";

import { lookupOrders } from "@/lib/tracking";

// Server Action behind the "Track my order" form. Returns
// { orders, type } or { error, code } — see lib/tracking.js for what an order contains
// and for the rate limiting that protects it. (No honeypot here: a trap field that
// browser autofill can trip would silently tell a real customer "no orders found".)
export async function trackOrdersAction(_prev, formData) {
  return lookupOrders(formData.get("identifier"));
}
