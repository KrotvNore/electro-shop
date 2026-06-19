// lib/telegram.js
// Отправка уведомления о новом заказе в Telegram через Bot API.
// Никакого постоянно слушающего бота не требуется — это обычный HTTP-запрос,
// поэтому работает на любом хостинге, который умеет выполнять серверный код.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatOrderMessage(order) {
  const { customerName, contact, items, total } = order;

  const lines = [];
  lines.push("🛒 <b>Новый заказ</b>");
  lines.push("");
  lines.push(`👤 Имя: ${escapeHtml(customerName)}`);
  lines.push(`📞 Контакт: ${escapeHtml(contact)}`);
  lines.push("");
  lines.push("<b>Товары:</b>");
  for (const item of items) {
    lines.push(
      `• ${escapeHtml(item.name)} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString("ru-RU")} ₽`
    );
  }
  lines.push("");
  lines.push(`💰 <b>Итого: ${total.toLocaleString("ru-RU")} ₽</b>`);

  return lines.join("\n");
}

async function sendTelegramOrderNotification(order) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — уведомление не отправлено");
    return { ok: false, reason: "not_configured" };
  }

  const text = formatOrderMessage(order);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Ошибка Telegram API:", data);
      return { ok: false, reason: "telegram_error", details: data };
    }
    return { ok: true };
  } catch (err) {
    console.error("Не удалось отправить сообщение в Telegram:", err);
    return { ok: false, reason: "network_error" };
  }
}

module.exports = { sendTelegramOrderNotification, formatOrderMessage };
