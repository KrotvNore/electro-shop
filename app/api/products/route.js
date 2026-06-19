// app/api/products/route.js
import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function GET(request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category && category !== "all") {
    query += " AND category = ?";
    params.push(category);
  }

  if (search) {
    query += " AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  query += " ORDER BY in_stock DESC, name ASC";

  const products = db.prepare(query).all(...params);
  const categories = db
    .prepare("SELECT DISTINCT category FROM products ORDER BY category ASC")
    .all()
    .map((r) => r.category);

  return NextResponse.json({ products, categories });
}
