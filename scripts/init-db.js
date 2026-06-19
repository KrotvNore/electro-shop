// scripts/init-db.js
// Запускается один раз перед стартом: node scripts/init-db.js
// Создаёт файл базы данных и таблицы, если их ещё нет.
const { getDb } = require("../lib/db");

const db = getDb();
console.log("База данных инициализирована:", db.name);

// Дефолтный пароль админки, если ещё не задан
const existing = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
if (!existing) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
    "admin_password",
    "changeme123"
  );
  console.log("Установлен пароль админки по умолчанию: changeme123 (смените его в .env через ADMIN_PASSWORD)");
}

console.log("Готово.");
