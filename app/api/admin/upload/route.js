// app/api/admin/upload/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "../../../../lib/auth";
import { getDb } from "../../../../lib/db";
import { parseExcelBuffer } from "../../../../lib/excelParser";

function requireAuth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function POST(request) {
  if (!requireAuth()) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  // mode: "replace" — полностью заменить каталог, "merge" — обновить по артикулу/добавить новые
  const mode = formData.get("mode") || "replace";

  if (!file) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { products, errors, totalRows } = parseExcelBuffer(buffer);

  if (products.length === 0) {
    return NextResponse.json(
      { error: "Не удалось загрузить ни одного товара", details: errors },
      { status: 400 }
    );
  }

  const db = getDb();

  const insertOrUpdate = db.transaction((items) => {
    if (mode === "replace") {
      db.prepare("DELETE FROM products").run();
    }

    const insertStmt = db.prepare(`
      INSERT INTO products (sku, name, category, price, description, in_stock, image_url, updated_at)
      VALUES (@sku, @name, @category, @price, @description, @in_stock, @image_url, CURRENT_TIMESTAMP)
    `);

    const updateStmt = db.prepare(`
      UPDATE products SET name=@name, category=@category, price=@price,
        description=@description, in_stock=@in_stock, image_url=@image_url, updated_at=CURRENT_TIMESTAMP
      WHERE sku = @sku
    `);

    const findBySku = db.prepare("SELECT id FROM products WHERE sku = ? AND sku != ''");

    for (const item of items) {
      if (mode === "merge" && item.sku) {
        const existing = findBySku.get(item.sku);
        if (existing) {
          updateStmt.run(item);
          continue;
        }
      }
      insertStmt.run(item);
    }
  });

  insertOrUpdate(products);

  const totalInDb = db.prepare("SELECT COUNT(*) as count FROM products").get().count;

  return NextResponse.json({
    success: true,
    imported: products.length,
    skipped: totalRows - products.length,
    totalInDb,
    warnings: errors,
  });
}
