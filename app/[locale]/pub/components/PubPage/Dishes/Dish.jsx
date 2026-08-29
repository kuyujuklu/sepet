import { useContext, useState } from "react";
import Image from "next/image";
import { ThemeContext } from "../ThemeContextProvider";
import DishPhotoLightbox from "./DishPhotoLightbox";
import ConfirmPopup from "@/app/shared-components/Popup/ConfirmPopup";
import { currencies } from "@/app/static-data/data";
import { useDispatch, useSelector } from "react-redux";
import {
  decreaseDishAmount,
  increaseDishAmount,
  selectDish,
} from "@/app/[locale]/pub/store/basketSlice";
import { addCommissionToPrice } from "../../../../../utils/dish";
import { countCommissionForPub } from "../../../../../utils/pub";

const ACCENT = "#2D7DD2";
const SECONDARY = "#123527";

const Dish = ({ pub, dish, currencyID }) => {
  const dispatch = useDispatch();
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  const dishAmountFromState = useSelector(selectDish(dish?.id));
  const dishAmount = dishAmountFromState?.count ?? 0;
  const themeContext = useContext(ThemeContext);

  const handleIncreaseClick = () => {
    if (!dish.id) return;

    dispatch(increaseDishAmount({ dishID: dish.id }));
  };

  // Going from 1 to 0 removes the dish from the basket entirely - worth a
  // confirmation the same way clearing the whole basket now asks. Any other
  // decrease (2 -> 1, etc.) still just happens immediately.
  const handleDecreaseClick = () => {
    if (!dish.id) return;

    if (dishAmount === 1) {
      setIsRemoveConfirmOpen(true);
      return;
    }

    dispatch(decreaseDishAmount({ dishID: dish.id }));
  };

  const confirmRemove = () => {
    dispatch(decreaseDishAmount({ dishID: dish.id }));
    setIsRemoveConfirmOpen(false);
  };

  const currency = currencies.find(
    (currency) => currency.id === currencyID
  )?.symbol ?? "Lei"

  const hasSale = !!dish?.sale_price && dish?.sale_price < dish?.price;
  const smallestPrice = hasSale ? dish?.sale_price : dish?.price;

  const commission = countCommissionForPub(pub)

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button
        onClick={() => dish.image_file_name && setIsPhotoOpen(true)}
        aria-label={dish.image_file_name ? `${dish.name} - увеличить фото` : undefined}
        style={{
          position: "relative",
          width: 92,
          height: 92,
          borderRadius: 16,
          background: SECONDARY,
          flexShrink: 0,
          overflow: "hidden",
          border: "none",
          padding: 0,
          cursor: dish.image_file_name ? "zoom-in" : "default",
        }}
      >
        {dish.image_file_name && (
          <Image
            src={`/api-static/images/dishes/${dish.image_file_name}`}
            alt={dish.name}
            fill
            sizes="92px"
            style={{ objectFit: "cover" }}
          />
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: themeContext.textColor, lineHeight: 1.25 }}>
          {dish.name}
        </span>
        {dish.ingredients && (
          <span
            style={{
              fontSize: 11.5,
              color: "#94a3b0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dish.ingredients}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            {hasSale && (
              <span style={{ color: "#b0b8bf", textDecoration: "line-through", fontWeight: 500, fontSize: 12.5 }}>
                {addCommissionToPrice(dish?.price, commission)}&nbsp;{currency}
              </span>
            )}
            <span style={{ color: hasSale ? "#d24545" : themeContext.textColor }}>
              {addCommissionToPrice(smallestPrice, commission)}&nbsp;{currency}
            </span>
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {dishAmount > 0 && (
              <button
                onClick={handleDecreaseClick}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: `1.5px solid ${ACCENT}`,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
              </button>
            )}
            {dishAmount > 0 && (
              <span style={{ fontSize: 13.5, fontWeight: 700, color: themeContext.textColor, minWidth: 10, textAlign: "center" }}>
                {dishAmount}
              </span>
            )}
            <button
              onClick={handleIncreaseClick}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "none",
                background: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
        </div>
      </div>

      {isPhotoOpen && (
        <DishPhotoLightbox
          dish={dish}
          currency={currency}
          hasSale={hasSale}
          smallestPrice={smallestPrice}
          commission={commission}
          dishAmount={dishAmount}
          onIncrease={handleIncreaseClick}
          onDecrease={handleDecreaseClick}
          onClose={() => setIsPhotoOpen(false)}
        />
      )}

      <ConfirmPopup
        opened={isRemoveConfirmOpen}
        title={`Убрать «${dish.name}» из корзины?`}
        confirmLabel="Убрать"
        cancelLabel="Отмена"
        onConfirm={confirmRemove}
        onCancel={() => setIsRemoveConfirmOpen(false)}
      />
    </div>
  );
};

export default Dish;
