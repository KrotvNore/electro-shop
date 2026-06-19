// app/api/admin/products/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "../../../../../lib/auth";
import { getDb } from "../../../../../lib/db";

function requireAuth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function DELETE(request, { params }) {
  if (!requireAuth()) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }
  const db = getDb();
  db.prepare("DELETE FROM products WHERE id = ?").run(params.id);
  return NextResponse.json({ success: true });
}

export async function PATCH(request, { params }) {
  if (!requireAuth()) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }
  const updates = await request.json();
  const db = getDb();
  const allowed = ["name", "category", "price", "description", "in_stock", "image_url", "sku"];
  const fields = Object.keys(updates).filter((k) => allowed.includes(k));
  if (fields.length === 0) {
    return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
  }
  const setClause = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({
    ...updates,
    id: params.id,
  });
  return NextResponse.json({ success: true });
}
