import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../ThemeContextProvider";
import DishPhotoLightbox from "./DishPhotoLightbox";
import ConfirmPopup from "@/app/shared-components/Popup/ConfirmPopup";
import Toast from "@/app/shared-components/Popup/Toast";
import { currencies } from "@/app/static-data/data";
import { useDispatch, useSelector } from "react-redux";
import {
  clearBasket,
  decreaseDishAmount,
  increaseDishAmount,
  selectDish,
  selectDishes,
} from "@/app/[locale]/pub/store/basketSlice";
import { addCommissionToPrice } from "../../../../../utils/dish";
import { countCommissionForPub, getPubWorkHours } from "../../../../../utils/pub";
import { trackEcommerceEvent } from "../../../../../utils/analytics";

const CLOSED_TOAST_MESSAGE = "Сейчас закрыто, но вы можете собрать корзину — оформим, как только заведение откроется.";
const CLOSED_TOAST_DURATION = 3500;

const ACCENT = "#2D7DD2";
const SECONDARY = "#123527";

const Dish = ({ pub, dish, currencyID, isHit }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isCrossPubConfirmOpen, setIsCrossPubConfirmOpen] = useState(false);
  const [isClosedToastVisible, setIsClosedToastVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const closedToastTimerRef = useRef(null);

  const dishAmountFromState = useSelector(selectDish(dish?.id));
  const dishAmount = dishAmountFromState?.count ?? 0;
  const basketDishes = useSelector(selectDishes);
  const themeContext = useContext(ThemeContext);

  // The stop list. `available` is only ever false when the pub actually took
  // the dish off it - a dish from an endpoint that doesn't send the field is
  // orderable, which is how every dish behaved before the field existed.
  const isAvailable = dish?.available !== false;

  useEffect(() => () => clearTimeout(closedToastTimerRef.current), []);

  // Adding while closed is allowed on purpose (no barrier to building a
  // cart for whenever the pub reopens - checkout itself is what actually
  // gates on isDeliveryAvailable) - this just makes sure the client knows
  // why, instead of finding out at checkout. Re-triggering resets the
  // timer rather than stacking, so rapid clicks don't spam toasts.
  const notifyClosed = () => {
    setIsClosedToastVisible(true);
    clearTimeout(closedToastTimerRef.current);
    closedToastTimerRef.current = setTimeout(() => setIsClosedToastVisible(false), CLOSED_TOAST_DURATION);
  };

  // One cart, wherever the dish was tapped from - the home page's "Хиты
  // продаж" already asked before clearing a cart from a different pub;
  // this is the same question, same wording, for every other way to add a
  // dish. basketSlice no longer clears mismatched dishes on its own (see
  // its setBasketPubID) - browsing a pub is never destructive by itself,
  // only actually confirming an add across pubs is.
  const commitAdd = () => {
    if (!getPubWorkHours(pub).isDeliveryAvailable) notifyClosed();
    dispatch(increaseDishAmount({ dishID: dish.id }));
    trackEcommerceEvent("add_to_cart", {
      currency: currencies.find((c) => c.id === currencyID)?.name ?? "MDL",
      value: addCommissionToPrice(smallestPrice, commission),
      items: [{
        item_id: String(dish.id),
        item_name: dish.name,
        price: addCommissionToPrice(smallestPrice, commission),
        quantity: 1,
      }],
    });
  };

  const handleIncreaseClick = () => {
    if (!dish.id || !isAvailable) return;

    const hasOtherPubItems = Object.values(basketDishes).some(
      (d) => d?.count > 0 && d.pubID !== pub?.id
    );
    if (hasOtherPubItems) {
      setIsCrossPubConfirmOpen(true);
      return;
    }

    commitAdd();
  };

  const confirmCrossPubAdd = () => {
    dispatch(clearBasket());
    commitAdd();
    setIsCrossPubConfirmOpen(false);
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
    <div style={{ display: "flex", gap: 12, opacity: isAvailable ? 1 : 0.55 }}>
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
            // The thumbnail is generated on upload and is empty when the
            // original was already small enough (or could not be decoded).
            src={`/api-static/images/dishes/${dish.image_thumb_file_name || dish.image_file_name}`}
            alt={dish.name}
            fill
            sizes="92px"
            style={{ objectFit: "cover", opacity: isImageLoaded ? 1 : 0, transition: "opacity 320ms ease" }}
            onLoad={() => setIsImageLoaded(true)}
          />
        )}
        {isHit && (
          <span style={{ position: "absolute", top: 4, left: 4, background: "#2D7DD2", color: "#fff", fontSize: 9.5, fontWeight: 700, padding: "2.5px 6px", borderRadius: 999 }}>
            ХИТ
          </span>
        )}
        {!isAvailable && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(20,26,33,0.55)",
              color: "#fff",
              fontSize: 10.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 6,
            }}
          >
            {t("client.dish.out_of_stock")}
          </span>
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
              disabled={!isAvailable}
              aria-label={isAvailable ? undefined : t("client.dish.out_of_stock")}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "none",
                background: isAvailable ? ACCENT : "#c7cdd3",
                cursor: isAvailable ? "pointer" : "not-allowed",
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
          isAvailable={isAvailable}
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

      <ConfirmPopup
        opened={isCrossPubConfirmOpen}
        title={`Добавить «${dish.name}»?`}
        message="В корзине уже есть блюда из другого заведения — добавление этого очистит корзину и начнёт новый заказ."
        confirmLabel="Добавить"
        cancelLabel="Отмена"
        onConfirm={confirmCrossPubAdd}
        onCancel={() => setIsCrossPubConfirmOpen(false)}
      />

      <Toast message={CLOSED_TOAST_MESSAGE} visible={isClosedToastVisible} />
    </div>
  );
};

export default Dish;
