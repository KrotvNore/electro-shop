// components/Hero.js
"use client";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="eyebrow">Освещение и электрика</span>
          <h1>
            Свет начинается
            <br />
            с правильной <span className="amber">точки</span>
          </h1>
          <p>
            Люстры, светильники, кабель, автоматы и фурнитура — каталог для дома и
            объекта. Выбирайте, добавляйте в корзину, мы свяжемся с вами для
            подтверждения заказа.
          </p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <svg viewBox="0 0 240 280" width="100%" height="100%">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* провод */}
            <line x1="120" y1="0" x2="120" y2="60" stroke="#4a4d57" strokeWidth="2" />
            {/* патрон */}
            <rect x="100" y="60" width="40" height="22" rx="3" fill="#34373f" />
            {/* колба */}
            <path
              d="M120 82C92 82 75 108 75 135C75 165 100 188 120 188C140 188 165 165 165 135C165 108 148 82 120 82Z"
              fill="none"
              stroke="#4a4d57"
              strokeWidth="1.5"
            />
            {/* нить накала — анимированная */}
            <path
              className="filament"
              d="M105 110C105 110 112 150 120 150C128 150 112 120 120 120C128 120 112 165 120 165C128 165 135 110 135 110"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            {/* цоколь */}
            <rect x="110" y="186" width="20" height="8" fill="#4a4d57" />
            <rect x="112" y="194" width="16" height="6" fill="#34373f" />
            <line x1="112" y1="197" x2="128" y2="197" stroke="#1b1d22" strokeWidth="1" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        .hero {
          padding: 56px 0 40px;
          border-bottom: 1px solid var(--card-border);
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.4fr 0.6fr;
          align-items: center;
          gap: 40px;
        }
        .eyebrow {
          display: inline-block;
          font-size: 12.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--copper);
          font-weight: 600;
          margin-bottom: 14px;
        }
        h1 {
          font-size: clamp(32px, 4.2vw, 50px);
          line-height: 1.08;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .amber {
          color: var(--amber);
        }
        .hero-text p {
          color: var(--text-dim);
          font-size: 15.5px;
          line-height: 1.6;
          max-width: 480px;
          margin: 0;
        }
        .hero-visual {
          max-width: 220px;
          margin: 0 auto;
          opacity: 0.95;
        }
        .filament {
          animation: flicker 3.2s ease-in-out infinite;
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          48% { opacity: 1; }
          50% { opacity: 0.55; }
          52% { opacity: 1; }
          76% { opacity: 1; }
          77% { opacity: 0.7; }
          78% { opacity: 1; }
        }
        @media (max-width: 760px) {
          .hero-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-text p {
            margin: 0 auto;
          }
          .hero-visual {
            max-width: 150px;
            order: -1;
          }
        }
      `}</style>
    </section>
  );
}
