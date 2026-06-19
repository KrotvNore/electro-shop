// lib/auth.js
// Простая авторизация админки по логину/паролю из переменных окружения.
// Сессия хранится в httpOnly cookie с JWT-токеном.
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev-secret-change-me-in-env";
const COOKIE_NAME = "admin_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 часов

function checkCredentials(login, password) {
  const expectedLogin = process.env.ADMIN_LOGIN || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "changeme123";
  return login === expectedLogin && password === expectedPassword;
}

function createSessionToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

module.exports = {
  checkCredentials,
  createSessionToken,
  verifySessionToken,
  COOKIE_NAME,
  TOKEN_TTL_SECONDS,
};
