import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { packs } from "@/lib/product";
import { saveOrder, type Order } from "@/lib/orders";

// ─────────────────────────────────────────────────────────────
// POST /api/order — save a COD order + fire Meta Conversions
// API Purchase event (when FB_PIXEL_ID/FB_ACCESS_TOKEN are set).
// Orders download: GET /api/order/export?key=ADMIN_EXPORT_KEY
// ─────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sendCapiPurchase(order: Order, req: NextRequest) {
  const pixelId = process.env.FB_PIXEL_ID;
  const token = process.env.FB_ACCESS_TOKEN;
  if (!pixelId || !token) return;

  const hash = (v: string) => crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
  const phoneIntl = order.mobile.replace(/^0/, "92");

  try {
    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: req.headers.get("referer") || undefined,
            user_data: {
              ph: [hash(phoneIntl)],
              country: [hash("pk")],
            },
            custom_data: {
              value: order.amount,
              currency: "PKR",
              content_ids: [order.packId],
              content_type: "product",
            },
          },
        ],
      }),
    });
  } catch {
    // Never fail the customer's order because tracking failed.
  }
}

export async function POST(req: NextRequest) {
  let body: { name?: string; mobile?: string; city?: string; packId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const mobile = (body.mobile || "").replace(/[\s-]/g, "");
  const city = (body.city || "").trim();
  const pack = packs.find((p) => p.id === body.packId);

  if (name.length < 3) return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 422 });
  if (!/^03\d{9}$/.test(mobile)) return NextResponse.json({ ok: false, error: "Invalid mobile" }, { status: 422 });
  if (!city) return NextResponse.json({ ok: false, error: "Invalid city" }, { status: 422 });
  if (!pack) return NextResponse.json({ ok: false, error: "Invalid pack" }, { status: 422 });

  const order: Order = {
    orderId: "PK-" + Math.floor(100000 + Math.random() * 900000).toString(),
    createdAt: new Date().toISOString(),
    name,
    mobile,
    city,
    packId: pack.id,
    qty: pack.qty,
    amount: pack.price,
  };

  await saveOrder(order);
  await sendCapiPurchase(order, req);

  return NextResponse.json({ ok: true, orderId: order.orderId, amount: order.amount });
}
