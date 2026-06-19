// app/api/cart-order/route.js
import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { sendTelegramOrderNotification } from "../../../lib/telegram";

export async function POST(request) {
  const body = await request.json();
  const { customerName, contact, items } = body || {};

  if (!customerName || !String(customerName).trim()) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }
  if (!contact || !String(contact).trim()) {
    return NextResponse.json({ error: "Укажите номер телефона или Telegram" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  // Валидируем товары и пересчитываем цены из базы (не доверяем ценам с клиента)
  const db = getDb();
  const validatedItems = [];
  let total = 0;

  for (const item of items) {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(item.id);
    if (!product) continue;
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    validatedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }

  if (validatedItems.length === 0) {
    return NextResponse.json({ error: "Товары в корзине не найдены" }, { status: 400 });
  }

  const insertResult = db
    .prepare(
      "INSERT INTO orders (customer_name, contact, items_json, total) VALUES (?, ?, ?, ?)"
    )
    .run(customerName.trim(), contact.trim(), JSON.stringify(validatedItems), total);

  const notifyResult = await sendTelegramOrderNotification({
    customerName: customerName.trim(),
    contact: contact.trim(),
    items: validatedItems,
    total,
  });

  return NextResponse.json({
    success: true,
    orderId: insertResult.lastInsertRowid,
    telegramNotified: notifyResult.ok,
  });
}
