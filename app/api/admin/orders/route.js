// app/api/admin/orders/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "../../../../lib/auth";
import { getDb } from "../../../../lib/db";

function requireAuth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function GET() {
  if (!requireAuth()) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const db = getDb();
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200").all();
  const parsed = orders.map((o) => ({ ...o, items: JSON.parse(o.items_json) }));

  return NextResponse.json({ orders: parsed });
}
