"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectBasketCount, selectDishes } from "../../store/basketSlice";
import { selectData } from "../../store/pubInfoSlice";
import { currencies } from "@/app/static-data/data";
import { computeBasketSubtotal } from "../../../../utils/dish";
import { countCommissionForPub } from "../../../../utils/pub";

// Shown only while browsing (never on the basket page itself) and only once
// the basket has something in it - replaces the old down panel's basket icon
// + bare count badge with an actually informative summary (count and price),
// per direct client feedback on the home-page cart icon.
const FloatingCartButton = ({ pubID }) => {
  const { i18n } = useTranslation();
  const count = useSelector(selectBasketCount);
  const basketDishes = useSelector(selectDishes);
  const data = useSelector(selectData);

  if (!count) return null;

  const commission = countCommissionForPub(data?.pub);
  const subtotal = computeBasketSubtotal(basketDishes, data?.dishes, commission);
  const currency = currencies.find((c) => c.id === data?.pub?.currency_id)?.symbol ?? "Lei";

  return (
    <Link
      href={`/${i18n.language}/pub/${pubID}/basket`}
      style={{
        position: "fixed",
        bottom: 20,
        // The pub page's content lives in a 600px column centered with
        // margin:auto (see ThemeWrapperForPubPage), not full viewport width -
        // a plain `right: 18px` would pin to the browser edge and drift away
        // from that column on anything wider than a phone. This tracks the
        // column's own right edge instead, falling back to 18px once the
        // viewport is narrower than the column itself.
        right: "max(18px, calc((100vw - 600px) / 2 + 18px))",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#2D7DD2",
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
      <span style={{ fontSize: 14.5, fontWeight: 700 }}>
        {Math.round(subtotal)}&nbsp;{currency}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    </Link>
  );
};

export default FloatingCartButton;
