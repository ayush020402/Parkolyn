import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin/auth";
import { listOrdersForExport, normalizeOrderFilters } from "@/lib/admin/data";
import { csvResponse, toCsv } from "@/lib/admin/csv";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/order-status";
import { itemsSummary } from "@/lib/format";

// GET /admin/orders/export?<same filters as the list> -> CSV of every match.
export async function GET(request) {
  // Route Handlers answer with a status code, not a redirect.
  if (!(await getAdminOrNull())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filters = normalizeOrderFilters(Object.fromEntries(new URL(request.url).searchParams));
  const orders = await listOrdersForExport(filters);

  const csv = toCsv(
    [
      "Order ref", "Placed at (UTC)", "Payment", "Status", "Amount (INR)", "Items",
      "Customer", "Email", "Phone", "Address", "City", "State", "PIN",
      "Courier", "AWB", "Tracking link", "Shipped at (UTC)", "Delivered at (UTC)",
      "Razorpay payment ID", "Customer notes", "Internal notes",
    ],
    orders.map((o) => [
      o.order_ref, o.created_at, PAYMENT_LABELS[o.payment_status], STATUS_LABELS[o.status], o.amount, itemsSummary(o.items),
      o.customer_name, o.customer_email, o.customer_phone, o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_pincode,
      o.courier_name, o.awb_number, o.tracking_url, o.shipped_at, o.delivered_at,
      o.razorpay_payment_id, o.notes, o.admin_notes,
    ])
  );

  return csvResponse(`parkolyn-orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
