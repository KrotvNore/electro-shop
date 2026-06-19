// lib/excelParser.js
// Парсит загруженный .xlsx файл и приводит строки к формату товара.
//
// Ожидаемые столбцы (регистр и порядок не важны, ищем по похожим названиям):
//   Название / Наименование / Name
//   Категория / Category
//   Цена / Price
//   Артикул / SKU / Код
//   Описание / Description
//   Наличие / В наличии / Stock   (значения: да/нет, 1/0, в наличии/нет в наличии)
//   Фото / Изображение / Image / URL фото   (необязательно)
const XLSX = require("xlsx");

const COLUMN_ALIASES = {
  name: ["название", "наименование", "name", "товар", "продукт"],
  category: ["категория", "category", "раздел", "группа"],
  price: ["цена", "price", "стоимость"],
  sku: ["артикул", "sku", "код", "код товара"],
  description: ["описание", "description", "характеристики"],
  in_stock: ["наличие", "в наличии", "stock", "остаток"],
  image_url: ["фото", "изображение", "image", "картинка", "url фото", "image_url"],
};

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");
}

function detectColumns(headerRow) {
  const map = {}; // field -> column index
  headerRow.forEach((rawHeader, idx) => {
    const header = normalizeHeader(rawHeader);
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (map[field] !== undefined) continue;
      if (aliases.some((alias) => header === alias || header.includes(alias))) {
        map[field] = idx;
      }
    }
  });
  return map;
}

function parseInStock(value) {
  if (value === undefined || value === null || value === "") return 1; // по умолчанию в наличии
  const v = String(value).trim().toLowerCase();
  if (["0", "нет", "false", "нет в наличии", "не в наличии", "отсутствует"].includes(v)) {
    return 0;
  }
  return 1;
}

function parsePrice(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^\d.,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * @param {Buffer} fileBuffer - содержимое .xlsx файла
 * @returns {{ products: Array<object>, errors: Array<string>, totalRows: number }}
 */
function parseExcelBuffer(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (!rows.length) {
    return { products: [], errors: ["Файл пустой"], totalRows: 0 };
  }

  const headerRow = rows[0];
  const columnMap = detectColumns(headerRow);
  const errors = [];

  if (columnMap.name === undefined) {
    errors.push("Не найден столбец с названием товара (ожидается 'Название' или 'Наименование')");
  }
  if (columnMap.price === undefined) {
    errors.push("Не найден столбец с ценой (ожидается 'Цена')");
  }

  if (errors.length) {
    return { products: [], errors, totalRows: rows.length - 1 };
  }

  const products = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((cell) => cell === "" || cell === undefined)) continue; // пустая строка

    const name = String(row[columnMap.name] ?? "").trim();
    if (!name) {
      errors.push(`Строка ${i + 1}: пропущена — нет названия`);
      continue;
    }

    const price = parsePrice(row[columnMap.price]);
    if (price === null) {
      errors.push(`Строка ${i + 1} ("${name}"): не удалось распознать цену — строка пропущена`);
      continue;
    }

    products.push({
      name,
      category: columnMap.category !== undefined ? String(row[columnMap.category] ?? "").trim() || "Без категории" : "Без категории",
      price,
      sku: columnMap.sku !== undefined ? String(row[columnMap.sku] ?? "").trim() : "",
      description: columnMap.description !== undefined ? String(row[columnMap.description] ?? "").trim() : "",
      in_stock: columnMap.in_stock !== undefined ? parseInStock(row[columnMap.in_stock]) : 1,
      image_url: columnMap.image_url !== undefined ? String(row[columnMap.image_url] ?? "").trim() : "",
    });
  }

  return { products, errors, totalRows: rows.length - 1 };
}

module.exports = { parseExcelBuffer, detectColumns, COLUMN_ALIASES };
