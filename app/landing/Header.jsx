"use client"
import { useEffect, useState } from "react";

// Reads the same localStorage the pub-page basket already writes to
// (see [locale]/pub/store/middleware/basketMiddleware.js's `write`) - no
// redux needed here, the landing page has none. Every basket entry carries
// its own pubID (see basketSlice.increaseDishAmount), and the whole-basket
// rule is single-pub, so any entry's pubID is *the* pub to link to.
const readBasketSummary = () => {
  try {
    const dishes = JSON.parse(localStorage.getItem("basket")) || {};
    const entries = Object.values(dishes);
    const count = entries.reduce((acc, item) => acc + (+item?.count || 0), 0);
    const pubID = entries[0]?.pubID ?? null;

    return { count, pubID };
  } catch (e) {
    return { count: 0, pubID: null };
  }
};

const Header = () => {
  const [basket, setBasket] = useState({ count: 0, pubID: null });

  useEffect(() => {
    setBasket(readBasketSummary());

    // The pub-page basket writes through this same tab too (not just other
    // tabs, which "storage" alone would cover) - poll lightly so the header
    // catches up without a shared store.
    const onStorage = () => setBasket(readBasketSummary());
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => setBasket(readBasketSummary()), 2000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <header style={{ background: "#ffffff", borderBottom: "1px solid #e7ebef" }}>
      <div
        className="max-w-6xl mx-auto px-4"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "16px 16px" }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="images/png/bird.png" width={32} height={32} alt="Sepet" />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#1c2733", letterSpacing: "-0.01em" }}>
              sepet<span style={{ color: "#2D7DD2" }}>.md</span>
            </span>
            <span style={{ fontSize: 12, color: "#94a3b0" }}>Всё на расстоянии одного клика</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {basket.count > 0 && (
            <a
              href={basket.pubID ? `/ru/pub/${basket.pubID}/basket` : "#"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "#e8f1fb",
                border: "1px solid #cfe0f5",
                borderRadius: 12,
                padding: "8px 14px 8px 10px",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#2D7DD2",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {basket.count}
              </span>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1c2733" }}>Корзина</span>
                <span style={{ fontSize: 11, color: "#526070" }}>{basket.count === 1 ? "1 товар" : `${basket.count} товара`}</span>
              </span>
            </a>
          )}

          <a
            href="https://onelink.to/ey3df3"
            className="hidden sm:flex"
            style={{
              alignItems: "center",
              gap: 8,
              background: "#2D7DD2",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
            Скачать приложение
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
