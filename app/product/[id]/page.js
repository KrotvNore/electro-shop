// app/product/[id]/page.js
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../lib/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setProduct(data.product))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="container state">
        <p>Товар не найден.</p>
        <button onClick={() => router.push("/")} className="back-link">
          ← Вернуться в каталог
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="container state">Загрузка…</div>;
  }

  return (
    <div className="container product-page">
      <button onClick={() => router.push("/")} className="back-link">
        ← Назад в каталог
      </button>

      <div className="product-grid">
        <div className="product-img">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="placeholder">⚡</div>
          )}
        </div>

        <div className="product-info">
          <span className="category">{product.category}</span>
          <h1>{product.name}</h1>
          {product.sku && <span className="sku">Артикул: {product.sku}</span>}
          <p className="price">{product.price.toLocaleString("ru-RU")} ₽</p>

          {product.description && <p className="description">{product.description}</p>}

          <span className={`stock ${product.in_stock ? "in" : "out"}`}>
            {product.in_stock ? "● В наличии" : "○ Нет в наличии"}
          </span>

          <button
            className="add-btn"
            disabled={!product.in_stock}
            onClick={() => {
              addItem(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
          >
            {added ? "Добавлено ✓" : product.in_stock ? "Добавить в корзину" : "Недоступно"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .state {
          padding: 80px 20px;
          text-align: center;
          color: var(--text-dim);
        }
        .product-page {
          padding: 28px 20px 70px;
        }
        .back-link {
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 13.5px;
          margin-bottom: 24px;
          padding: 0;
        }
        .back-link:hover {
          color: var(--text);
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        .product-img {
          aspect-ratio: 1 / 1;
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          font-size: 56px;
          color: var(--amber);
          opacity: 0.3;
        }
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .category {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--copper);
          font-weight: 600;
        }
        h1 {
          font-size: 28px;
          line-height: 1.2;
        }
        .sku {
          color: var(--text-dim);
          font-size: 13px;
        }
        .price {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 700;
          color: var(--amber);
          margin: 8px 0 0;
        }
        .description {
          color: var(--text-dim);
          line-height: 1.6;
          font-size: 14.5px;
          margin: 10px 0;
        }
        .stock {
          font-size: 13px;
          margin-bottom: 10px;
        }
        .stock.in {
          color: var(--green);
        }
        .stock.out {
          color: var(--text-dim);
        }
        .add-btn {
          background: var(--amber);
          color: #1b1d22;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          max-width: 320px;
        }
        .add-btn:disabled {
          background: var(--card);
          color: var(--text-dim);
        }
        @media (max-width: 700px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
}
