import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/lib/admin/auth";
import { listSubscribers } from "@/lib/admin/data";
import { csvResponse, toCsv } from "@/lib/admin/csv";

export async function GET() {
  if (!(await getAdminOrNull())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await listSubscribers();
  const csv = toCsv(["Email", "Joined (UTC)"], rows.map((s) => [s.email, s.created_at]));
  return csvResponse(`parkolyn-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
