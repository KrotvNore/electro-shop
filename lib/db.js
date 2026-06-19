// lib/db.js
// Подключение к SQLite базе данных и работа со схемой.
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "shop.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT,                 -- артикул
      name TEXT NOT NULL,       -- название
      category TEXT,            -- категория
      price REAL NOT NULL,      -- цена
      description TEXT,         -- описание
      in_stock INTEGER DEFAULT 1, -- 1 = в наличии, 0 = нет
      image_url TEXT,           -- ссылка на фото
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      contact TEXT NOT NULL,      -- телефон или telegram
      items_json TEXT NOT NULL,   -- JSON корзины на момент заказа
      total REAL NOT NULL,
      status TEXT DEFAULT 'new',  -- new / confirmed / cancelled
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

module.exports = { getDb, DB_PATH };
