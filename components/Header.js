// components/Header.js
"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../lib/CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="11" r="8" stroke="var(--amber)" strokeWidth="1.6" />
              <path
                d="M10.5 9.5C10.5 9.5 11.5 11.5 14 11.5C16.5 11.5 17.5 9.5 17.5 9.5"
                stroke="var(--amber)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path d="M14 11.5V13" stroke="var(--amber)" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M12 19H16M12.7 22H15.3" stroke="var(--text-dim)" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M11.5 19V17.5H16.5V19" stroke="var(--text-dim)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>
              ВАТТ<span style={{ color: "var(--amber)" }}>.</span>МАРКЕТ
            </span>
          </Link>

          <nav className="nav">
            <Link href="/">Каталог</Link>
            <Link href="/#contacts">Контакты</Link>
          </nav>

          <button className="cart-btn" onClick={() => setCartOpen(true)} aria-label="Открыть корзину">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 4H5L7.5 14.5H18L20 7H6.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="19" r="1.3" fill="currentColor" />
              <circle cx="17" cy="19" r="1.3" fill="currentColor" />
            </svg>
            Корзина
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(27, 29, 34, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--card-border);
        }
        .header-inner {
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .nav {
          display: flex;
          gap: 28px;
          font-size: 14.5px;
          color: var(--text-dim);
          flex: 1;
        }
        .nav a:hover {
          color: var(--text);
        }
        .cart-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card);
          border: 1px solid var(--card-border);
          color: var(--text);
          padding: 9px 16px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: border-color 0.15s ease;
        }
        .cart-btn:hover {
          border-color: var(--amber);
        }
        .cart-badge {
          background: var(--amber);
          color: #1b1d22;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        @media (max-width: 640px) {
          .nav {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
