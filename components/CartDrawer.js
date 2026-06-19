// components/CartDrawer.js
"use client";
import { useState } from "react";
import { useCart } from "../lib/CartContext";

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [step, setStep] = useState("cart"); // cart | form | success
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !contact.trim()) {
      setError("Заполните имя и контакт для связи");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cart-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          contact,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось оформить заказ. Попробуйте ещё раз.");
        setSubmitting(false);
        return;
      }
      clearCart();
      setStep("success");
    } catch {
      setError("Ошибка соединения. Проверьте интернет и попробуйте снова.");
    }
    setSubmitting(false);
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("cart");
      setName("");
      setContact("");
      setError("");
    }, 300);
  }

  return (
    <>
      <div className="overlay" onClick={handleClose} />
      <aside className="drawer" role="dialog" aria-label="Корзина">
        <div className="drawer-header">
          <h3>{step === "cart" ? "Корзина" : step === "form" ? "Оформление заказа" : "Заявка отправлена"}</h3>
          <button className="close-btn" onClick={handleClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {step === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="empty">
                <p>Корзина пуста.</p>
                <span>Добавьте товары из каталога — они появятся здесь.</span>
              </div>
            ) : (
              <>
                <div className="items-list">
                  {items.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-img">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <div className="img-placeholder">⚡</div>
                        )}
                      </div>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">{item.price.toLocaleString("ru-RU")} ₽</span>
                        <div className="qty-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Удалить">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="drawer-footer">
                  <div className="total-row">
                    <span>Итого</span>
                    <strong>{total.toLocaleString("ru-RU")} ₽</strong>
                  </div>
                  <button className="primary-btn" onClick={() => setStep("form")}>
                    Купить
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === "form" && (
          <form className="order-form" onSubmit={handleSubmit}>
            <p className="form-hint">
              Оставьте контакт — мы свяжемся с вами для подтверждения заказа и доставки.
            </p>
            <label>
              Имя
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как к вам обращаться"
                autoComplete="name"
              />
            </label>
            <label>
              Телефон или Telegram
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+370 6XX XXXXX или @username"
                autoComplete="tel"
              />
            </label>

            {error && <div className="form-error">{error}</div>}

            <div className="total-row">
              <span>Итого</span>
              <strong>{total.toLocaleString("ru-RU")} ₽</strong>
            </div>

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? "Отправляем…" : "Подтвердить заказ"}
            </button>
            <button className="ghost-btn" type="button" onClick={() => setStep("cart")}>
              Назад в корзину
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="success">
            <div className="success-icon">✓</div>
            <h4>Заявка принята</h4>
            <p>Мы получили ваш заказ и скоро свяжемся с вами для подтверждения.</p>
            <button className="primary-btn" onClick={handleClose}>
              Готово
            </button>
          </div>
        )}
      </aside>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 50;
          animation: fadeIn 0.2s ease;
        }
        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 420px;
          background: var(--bg-soft);
          border-left: 1px solid var(--card-border);
          z-index: 51;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--card-border);
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 16px;
        }
        .close-btn:hover {
          color: var(--text);
        }
        .empty {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }
        .empty p {
          color: var(--text);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .items-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cart-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .cart-item-img {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          background: var(--card);
          border: 1px solid var(--card-border);
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .img-placeholder {
          color: var(--amber);
          opacity: 0.6;
        }
        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cart-item-name {
          font-size: 14px;
          font-weight: 500;
        }
        .cart-item-price {
          font-size: 13px;
          color: var(--text-dim);
        }
        .qty-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }
        .qty-controls button {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid var(--card-border);
          background: var(--card);
          color: var(--text);
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 13px;
          padding: 4px;
        }
        .remove-btn:hover {
          color: var(--red);
        }
        .drawer-footer {
          padding: 18px 20px 22px;
          border-top: 1px solid var(--card-border);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 14px;
          font-size: 15px;
        }
        .total-row strong {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--amber);
        }
        .primary-btn {
          width: 100%;
          background: var(--amber);
          color: #1b1d22;
          border: none;
          padding: 13px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          transition: filter 0.15s ease;
        }
        .primary-btn:hover {
          filter: brightness(1.08);
        }
        .primary-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .ghost-btn {
          width: 100%;
          background: none;
          border: none;
          color: var(--text-dim);
          padding: 10px;
          font-size: 13.5px;
          margin-top: 4px;
        }
        .ghost-btn:hover {
          color: var(--text);
        }
        .order-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
        }
        .form-hint {
          color: var(--text-dim);
          font-size: 13.5px;
          line-height: 1.5;
          margin: 0 0 4px;
        }
        .order-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: var(--text-dim);
        }
        .order-form input {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 11px 12px;
          color: var(--text);
          font-size: 14.5px;
        }
        .order-form input:focus {
          border-color: var(--amber);
        }
        .form-error {
          background: #e0654f1a;
          border: 1px solid #e0654f55;
          color: var(--red);
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
        }
        .success {
          padding: 50px 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .success-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--green);
          color: #14241a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .success p {
          color: var(--text-dim);
          font-size: 14px;
          margin: 0 0 24px;
          line-height: 1.5;
        }
        .success .primary-btn {
          max-width: 200px;
        }
      `}</style>
    </>
  );
}
