// app/page.js
"use client";
import { useEffect, useState, useCallback } from "react";
import Hero from "../components/Hero";
import CategoryToggles from "../components/CategoryToggles";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async (category, searchTerm) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (searchTerm) params.set("search", searchTerm);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setCategories(data.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts(activeCategory, search);
    }, 250);
    return () => clearTimeout(timeout);
  }, [activeCategory, search, loadProducts]);

  return (
    <>
      <Hero />

      <section className="catalog container" id="catalog">
        <div className="catalog-controls">
          <CategoryToggles
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по названию или артикулу"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="state-msg">Загружаем товары…</div>
        ) : products.length === 0 ? (
          <div className="state-msg">
            <strong>Ничего не найдено.</strong>
            <span>Попробуйте изменить категорию или поисковый запрос.</span>
          </div>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <footer id="contacts" className="footer">
        <div className="container footer-inner">
          <span>ВАТТ.МАРКЕТ — электрика и освещение</span>
          <span className="footer-dim">
            Заказ оформляется через корзину, мы свяжемся с вами для подтверждения.
          </span>
        </div>
      </footer>

      <style jsx>{`
        .catalog {
          padding: 36px 20px 60px;
        }
        .catalog-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 999px;
          padding: 9px 16px;
          color: var(--text-dim);
          min-width: 240px;
          flex: 1;
          max-width: 320px;
        }
        .search-box input {
          background: none;
          border: none;
          color: var(--text);
          font-size: 13.5px;
          width: 100%;
        }
        .search-box input::placeholder {
          color: var(--text-dim);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .state-msg {
          padding: 60px 0;
          text-align: center;
          color: var(--text-dim);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .state-msg strong {
          color: var(--text);
          font-size: 16px;
        }
        .footer {
          border-top: 1px solid var(--card-border);
          padding: 28px 0;
        }
        .footer-inner {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          font-size: 13px;
          color: var(--text-dim);
        }
      `}</style>
    </>
  );
}
