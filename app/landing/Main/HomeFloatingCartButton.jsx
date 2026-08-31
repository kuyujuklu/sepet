"use client"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { readLocalBasket, BASKET_UPDATED_EVENT } from "../../utils/localBasket";

const ACCENT = "#2D7DD2";

// The home page's own version of the pub page's FloatingCartButton - same
// idea (a persistent, always-visible link to checkout once there's
// something in the cart), reading the plain-localStorage cart
// Bestsellers.jsx writes to instead of subscribing to redux (no store
// exists outside /pub/[pubID], see PubPage.jsx). No price subtotal here
// unlike the pub-page version: the full priced dish list for whatever
// ended up in the cart isn't necessarily still loaded on this page (an
// item could have been added earlier while browsing a pub directly), so a
// count is the only number this can state with certainty.
const HomeFloatingCartButton = () => {
  const { i18n } = useTranslation();
  const [basket, setBasket] = useState({});

  useEffect(() => {
    const sync = () => setBasket(readLocalBasket());
    sync();
    window.addEventListener(BASKET_UPDATED_EVENT, sync);
    return () => window.removeEventListener(BASKET_UPDATED_EVENT, sync);
  }, []);

  const entries = Object.values(basket).filter((entry) => entry?.count > 0);
  const count = entries.reduce((sum, entry) => sum + entry.count, 0);
  const pubID = entries[0]?.pubID;

  if (!count || !pubID) return null;

  return (
    <a
      href={`/${i18n.language ?? "ru"}/pub/${pubID}/basket`}
      style={{
        position: "fixed",
        bottom: 20,
        // Tracks the page's own 1180px column edge, same reasoning as the
        // pub-page button tracking its 600px column - a plain `right: 18px`
        // would pin to the browser edge and drift from the column on wide
        // viewports.
        right: "max(18px, calc((100vw - 1180px) / 2 + 18px))",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: ACCENT,
        color: "#fff",
        padding: "13px 18px 13px 15px",
        borderRadius: 999,
        boxShadow: "0 14px 28px -10px #2D7DD21f, 0 4px 10px -2px rgba(0,0,0,0.2)",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {count}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 700 }}>Корзина</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    </a>
  );
};

export default HomeFloatingCartButton;
