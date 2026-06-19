// components/ProductCard.js
"use client";
import { useCart } from "../lib/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="card">
      <div className="card-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="placeholder">⚡</div>
        )}
        {!product.in_stock && <span className="out-badge">Нет в наличии</span>}
      </div>
      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <h3 className="card-name">{product.name}</h3>
        {product.sku && <span className="card-sku">Арт. {product.sku}</span>}
        <div className="card-footer">
          <span className="card-price">{product.price.toLocaleString("ru-RU")} ₽</span>
          <button
            className="add-btn"
            disabled={!product.in_stock}
            onClick={() => addItem(product)}
          >
            {product.in_stock ? "В корзину" : "Недоступно"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .card:hover {
          border-color: #4a4d57;
          transform: translateY(-2px);
        }
        .card-img {
          aspect-ratio: 1 / 1;
          background: var(--bg-soft);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          font-size: 32px;
          color: var(--amber);
          opacity: 0.35;
        }
        .out-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #1b1d22cc;
          color: var(--text-dim);
          font-size: 11px;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid var(--card-border);
        }
        .card-body {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .card-category {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--copper);
          font-weight: 600;
        }
        .card-name {
          font-size: 14.5px;
          font-weight: 600;
          font-family: var(--font-body);
          line-height: 1.35;
          min-height: 38px;
        }
        .card-sku {
          font-size: 11.5px;
          color: var(--text-dim);
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          gap: 8px;
        }
        .card-price {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 17px;
          color: var(--text);
        }
        .add-btn {
          background: var(--amber-soft);
          color: var(--amber);
          border: 1px solid transparent;
          padding: 8px 12px;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .add-btn:hover:not(:disabled) {
          background: var(--amber);
          color: #1b1d22;
        }
        .add-btn:disabled {
          background: var(--bg-soft);
          color: var(--text-dim);
          cursor: default;
        }
      `}</style>
    </div>
  );
}
