// app/admin/page.js
"use client";
import { useEffect, useState, useCallback, useRef } from "react";

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(!!data.authenticated);
        setAuthChecked(true);
      });
  }, []);

  if (!authChecked) {
    return <div className="screen-msg">Проверяем доступ…</div>;
  }

  return authenticated ? (
    <Dashboard onLogout={() => setAuthenticated(false)} />
  ) : (
    <LoginForm onSuccess={() => setAuthenticated(true)} />
  );
}

function LoginForm({ onSuccess }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка входа");
    }
    setLoading(false);
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Вход в админку</h2>
        <label>
          Логин
          <input value={login} onChange={(e) => setLogin(e.target.value)} autoFocus />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>

      <style jsx>{`
        .login-screen {
          min-height: calc(100vh - 68px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-card {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 32px;
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        h2 {
          font-size: 19px;
          margin-bottom: 4px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: var(--text-dim);
        }
        input {
          background: var(--bg-soft);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--text);
          font-size: 14.5px;
        }
        input:focus {
          border-color: var(--amber);
        }
        button {
          background: var(--amber);
          color: #1b1d22;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
        }
        button:disabled {
          opacity: 0.6;
        }
        .error {
          color: var(--red);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("upload"); // upload | products | orders
  const [stats, setStats] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("replace");
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadProducts = useCallback(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  const loadOrders = useCallback(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  useEffect(() => {
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
  }, [tab, loadProducts, loadOrders]);

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploadResult({ ok: res.ok, ...data });
    setUploading(false);
    fileInputRef.current.value = "";
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    onLogout();
  }

  async function deleteProduct(id) {
    if (!confirm("Удалить этот товар?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  return (
    <div className="dashboard container">
      <div className="dash-header">
        <h2>Панель управления</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="tabs">
        <button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")}>
          Загрузка Excel
        </button>
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
          Товары
        </button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
          Заказы
        </button>
      </div>

      {tab === "upload" && (
        <div className="panel">
          <h3>Загрузить каталог из Excel</h3>
          <p className="hint">
            Файл .xlsx со столбцами: <b>Название</b>, <b>Категория</b>, <b>Цена</b>, Артикул,
            Описание, Наличие, Фото (ссылка). Названия столбцов можно писать как на русском, так
            и на английском.
          </p>

          <form onSubmit={handleUpload} className="upload-form">
            <input type="file" accept=".xlsx,.xls" ref={fileInputRef} required />

            <div className="mode-select">
              <label>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                />
                Заменить весь каталог
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                />
                Обновить по артикулу (добавить новые)
              </label>
            </div>

            <button type="submit" disabled={uploading}>
              {uploading ? "Загружаем…" : "Загрузить файл"}
            </button>
          </form>

          {uploadResult && (
            <div className={`result ${uploadResult.ok ? "ok" : "err"}`}>
              {uploadResult.ok ? (
                <>
                  <strong>Готово.</strong> Загружено товаров: {uploadResult.imported}. Всего в
                  каталоге: {uploadResult.totalInDb}.
                  {uploadResult.warnings?.length > 0 && (
                    <details>
                      <summary>Предупреждения ({uploadResult.warnings.length})</summary>
                      <ul>
                        {uploadResult.warnings.slice(0, 30).map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <strong>Ошибка.</strong> {uploadResult.error}
                  {uploadResult.details && (
                    <ul>
                      {uploadResult.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="panel">
          <h3>Товары в каталоге ({products.length})</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Артикул</th>
                  <th>Наличие</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.price.toLocaleString("ru-RU")} ₽</td>
                    <td>{p.sku}</td>
                    <td>{p.in_stock ? "Да" : "Нет"}</td>
                    <td>
                      <button className="del-btn" onClick={() => deleteProduct(p.id)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="panel">
          <h3>Заказы ({orders.length})</h3>
          <div className="orders-list">
            {orders.map((o) => (
              <div className="order-card" key={o.id}>
                <div className="order-top">
                  <strong>{o.customer_name}</strong>
                  <span>{new Date(o.created_at).toLocaleString("ru-RU")}</span>
                </div>
                <div className="order-contact">{o.contact}</div>
                <ul>
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.quantity} = {(it.price * it.quantity).toLocaleString("ru-RU")} ₽
                    </li>
                  ))}
                </ul>
                <div className="order-total">Итого: {o.total.toLocaleString("ru-RU")} ₽</div>
              </div>
            ))}
            {orders.length === 0 && <p className="hint">Заказов пока нет.</p>}
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          padding: 32px 20px 70px;
        }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .logout-btn {
          background: var(--card);
          border: 1px solid var(--card-border);
          color: var(--text-dim);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
        }
        .logout-btn:hover {
          color: var(--text);
        }
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--card-border);
        }
        .tabs button {
          background: none;
          border: none;
          color: var(--text-dim);
          padding: 10px 16px;
          font-size: 14px;
          border-bottom: 2px solid transparent;
        }
        .tabs button.active {
          color: var(--amber);
          border-bottom-color: var(--amber);
        }
        .panel {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 24px;
        }
        .panel h3 {
          font-size: 17px;
          margin-bottom: 10px;
        }
        .hint {
          color: var(--text-dim);
          font-size: 13.5px;
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 420px;
        }
        .upload-form input[type="file"] {
          color: var(--text-dim);
          font-size: 13px;
        }
        .mode-select {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13.5px;
          color: var(--text-dim);
        }
        .mode-select label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .upload-form button {
          background: var(--amber);
          color: #1b1d22;
          border: none;
          padding: 11px;
          border-radius: 8px;
          font-weight: 700;
          max-width: 200px;
        }
        .upload-form button:disabled {
          opacity: 0.6;
        }
        .result {
          margin-top: 20px;
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          line-height: 1.6;
        }
        .result.ok {
          background: #5fb87a1a;
          border: 1px solid #5fb87a55;
          color: var(--green);
        }
        .result.err {
          background: #e0654f1a;
          border: 1px solid #e0654f55;
          color: var(--red);
        }
        .result ul {
          margin: 8px 0 0;
          padding-left: 18px;
        }
        .table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        th, td {
          text-align: left;
          padding: 9px 10px;
          border-bottom: 1px solid var(--card-border);
        }
        th {
          color: var(--text-dim);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
        }
        .del-btn {
          background: none;
          border: 1px solid var(--card-border);
          color: var(--red);
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .order-card {
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 13.5px;
        }
        .order-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .order-top span {
          color: var(--text-dim);
          font-size: 12px;
        }
        .order-contact {
          color: var(--copper);
          margin-bottom: 8px;
          font-size: 13px;
        }
        .order-card ul {
          margin: 0 0 8px;
          padding-left: 18px;
          color: var(--text-dim);
        }
        .order-total {
          font-weight: 700;
          color: var(--amber);
        }
      `}</style>
    </div>
  );
}
