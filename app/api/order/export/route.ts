import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/orders";

// GET /api/order/export?key=ADMIN_EXPORT_KEY
// Downloads all saved orders as an Excel-compatible CSV file.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_KEY = process.env.ADMIN_EXPORT_KEY || "change-me-in-env";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== EXPORT_KEY) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const orders = await readOrders();
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["Order ID", "Date", "Name", "Mobile", "City", "Pack", "Qty", "Amount (PKR)"];
  const rows = orders.map((o) =>
    [o.orderId, o.createdAt, o.name, o.mobile, o.city, o.packId, o.qty, o.amount].map(escape).join(",")
  );
  // BOM prefix so Excel opens the CSV with the correct encoding.
  const csv = "﻿" + [header.map(escape).join(","), ...rows].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="orders.csv"',
    },
  });
}
