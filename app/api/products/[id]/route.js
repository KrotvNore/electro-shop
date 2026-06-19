// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET(request, { params }) {
  const db = getDb();
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(params.id);

  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
