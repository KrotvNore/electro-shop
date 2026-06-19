// components/CategoryToggles.js
"use client";

export default function CategoryToggles({ categories, active, onChange }) {
  const all = ["all", ...categories];

  return (
    <div className="toggles">
      {all.map((cat) => (
        <button
          key={cat}
          className={`toggle ${active === cat ? "active" : ""}`}
          onClick={() => onChange(cat)}
        >
          <span className="dot" />
          {cat === "all" ? "Все товары" : cat}
        </button>
      ))}

      <style jsx>{`
        .toggles {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--card);
          border: 1px solid var(--card-border);
          color: var(--text-dim);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-dim);
          transition: all 0.15s ease;
          box-shadow: none;
        }
        .toggle:hover {
          border-color: #4a4d57;
          color: var(--text);
        }
        .toggle.active {
          background: var(--amber-soft);
          border-color: var(--amber);
          color: var(--amber);
        }
        .toggle.active .dot {
          background: var(--amber);
          box-shadow: 0 0 8px var(--amber);
        }
      `}</style>
    </div>
  );
}
