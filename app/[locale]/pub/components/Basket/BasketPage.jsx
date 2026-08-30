"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ThemeContext } from "../PubPage/ThemeContextProvider";
import ConfirmPopup from "@/app/shared-components/Popup/ConfirmPopup";
import Dish from "../PubPage/Dishes/Dish";
import {
  clearBasket,
  selectDishes,
  selectOrderHistory,
  setBasketPubID,
  addOrderToHistory,
} from "../../store/basketSlice";
import {
  selectGeoCoords,
  selectManualAddress,
  openSelectLocationPopup,
} from "../../store/locationSlice";
import { useCreateOrderMutation } from "../../api/rtk-query/orders";
import { priceBasket, isBelowMinimumError } from "../../../../utils/pricing";
import { countCommissionForPub, getPubWorkHours } from "../../../../utils/pub";
import { ConvertQrMenuApiTimeToLocalClock } from "../../../../utils/time";
import { currencies, orderPaymentTypes, orderTypes } from "@/app/static-data/data";
import { validateOrder, validatePhone } from "./validators";
import PhoneNumberInput from "@/app/shared-components/Inputs/PhoneNumberInput";
import Textarea from "@/app/shared-components/Inputs/Textarea";
import OrderHistory from "./OrderHistory";

const ACCENT = "#2D7DD2";
const ACCENT_DARK = "#1E6FBF";
const ACCENT_SOFT = "#2D7DD21f";

const cardStyle = { border: "1px solid #e7ebef", borderRadius: 16, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 10 };
const labelStyle = { fontSize: 11, color: "#94a3b0", fontWeight: 500 };

const BasketPage = ({ data }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const themeContext = useContext(ThemeContext);

  const basketDishes = useSelector(selectDishes);
  const orderHistory = useSelector(selectOrderHistory);
  const geoCoords = useSelector(selectGeoCoords);
  const manualAddress = useSelector(selectManualAddress);

  const pub = data?.pub;
  const pubDishes = data?.dishes;

  useEffect(() => {
    if (!pub) return;
    dispatch(setBasketPubID(pub.id));
  }, [pub, dispatch]);

  // Address (town/street) now lives entirely in the picker's own redux
  // state (manualAddress) - always set together with geoCoords through the
  // map picker, reverse-geocoded then correctable by hand there. Nothing
  // left to resolve or type separately on this page.
  const isApproximateAddress = !manualAddress?.town && !!geoCoords;

  // ---- phone / payment / comment ----
  const [phone, setPhone] = useState("");
  const [paymentType, setPaymentType] = useState(orderPaymentTypes.cash);
  const [comments, setComments] = useState("");
  // No backend field for this yet - folded into the free-text comment at
  // submit time (see buildOrder) so the pub sees it the same way it sees
  // any other note. Purely a wish, not an enforced schedule: nothing here
  // holds the order back or sends it automatically at that time.
  const [deliverByTime, setDeliverByTime] = useState("");

  // ---- pricing ----
  const commission = countCommissionForPub(pub);
  const pubWorkHours = getPubWorkHours(pub);
  const isDeliveryAvailable = pubWorkHours.isDeliveryAvailable;
  const currency = currencies.find((c) => c.id === pub?.currency_id)?.symbol ?? "Lei";

  // Free delivery and the pub's minimum are the server's rules; priceBasket
  // mirrors them so the checkout never promises a total the server would
  // disagree with. Only `isDeliveryAvailable` gates ordering by the clock -
  // a delivery price is a property of the address, not of the hour.
  const pricing = useMemo(
    () => priceBasket({ pub, basketDishes, pubDishes, commission }),
    [pub, basketDishes, pubDishes, commission]
  );

  const basketItems = useMemo(() => {
    if (!pubDishes) return [];
    return Object.keys(basketDishes)
      .map((id) => ({ dish: pubDishes.find((d) => d.id === +id), count: basketDishes[id]?.count }))
      .filter((item) => item.dish && item.count > 0);
  }, [basketDishes, pubDishes]);

  // The stop list. A dish taken off it while the basket sat open is still in
  // the basket, and nothing server-side refuses it on submit, so ordering is
  // blocked here until it is removed.
  const unavailableItems = useMemo(
    () => basketItems.filter((item) => item.dish?.available === false),
    [basketItems]
  );

  // ---- submit ----
  const [createOrder, { data: createOrderResp, error: createOrderError, isLoading, isError, isSuccess }] = useCreateOrderMutation();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (!createOrderResp?.order) return;

    const order = createOrderResp.order;

    // The order comes back priced by the server (items_price / delivery_price
    // / total_price), so the receipt states what was actually charged rather
    // than a second, independently computed guess at it. Older orders and any
    // response without the totals fall back to the basket's own arithmetic.
    const amount = order.total_price || pricing.totalPrice;

    dispatch(addOrderToHistory({
      order: {
        id: order.id,
        pub_id: order.pub_id,
        order_type: order.order_type,
        created_time: order.created_time,
        amount,
      },
    }));

    // The delivery window is the pub's "ready at" estimate plus the window it
    // advertises, worked out server-side - previously this added
    // shipping_time_to to the clock in the browser, which ignored how long
    // the pub actually needs to prepare the order.
    const etaLabel = ConvertQrMenuApiTimeToLocalClock(order.estimated_delivery_time_to);

    setSuccessInfo({ orderID: order.id, total: Math.round(amount), etaLabel });
    dispatch(clearBasket());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOrderResp]);

  const buildOrder = () => ({
    town: manualAddress?.town ?? "",
    comments: [
      deliverByTime.trim() ? `Доставить к: ${deliverByTime.trim()}` : null,
      comments.trim() || null,
    ].filter(Boolean).join("\n"),
    fullAddress: manualAddress?.street ?? "",
    tableNumber: 1,
    mainPhoneNumber: phone,
    paymentType,
    pubID: pub?.real_id,
    dishes: basketItems.map((item) => ({ dishID: item.dish.id, count: item.count })),
    orderType: orderTypes.delivery,
    ...(geoCoords ?? {}),
  });

  // Everything that makes an order impossible right now, in one place: the
  // pub's hours, its minimum, and the stop list.
  const canSubmit =
    isDeliveryAvailable && !pricing.isBelowMinimum && unavailableItems.length === 0;

  const handleSubmit = () => {
    if (!geoCoords || !canSubmit) return;

    const order = buildOrder();
    const validationErrors = validateOrder(order);
    if (validationErrors && validationErrors.length > 0) {
      setHasAttemptedSubmit(true);
      return;
    }
    createOrder({ order });
  };

  const showSuccess = isSuccess && !!successInfo;
  const showError = isError && !showSuccess;
  // A minimum raised while the basket sat open still lands as a 400 here, and
  // "check your internet connection" would be the wrong thing to say about it.
  const showBelowMinimumError = showError && isBelowMinimumError(createOrderError);

  if (!pub) return null;

  if (showSuccess) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "36px 4px 88px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: ACCENT_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={ACCENT_DARK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 800, color: "#1c2733" }}>{t("client.popups.create_order.success_headline")}</h2>
            <span style={{ fontSize: 13.5, color: "#78838d", lineHeight: 1.45 }}>
              {t("client.popups.create_order.success_body", { pubName: pub.name, orderID: successInfo.orderID })}
              {successInfo.etaLabel && (
                <>
                  <br />
                  {t("client.popups.create_order.success_eta", { time: successInfo.etaLabel })}
                </>
              )}
            </span>
          </div>
          <div style={{ width: "100%", background: "#f7f9fa", borderRadius: 16, padding: 14, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13.5, color: "#78838d" }}>{t("client.popups.create_order.payment_on_delivery")}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1c2733" }}>{successInfo.total}&nbsp;{currency}</span>
          </div>
        </div>

        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: 600, margin: "0 auto", background: "#fff", borderTop: "1px solid #f1f3f5", padding: "14px 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => router.push(`/${i18n.language}/pub/${pub.url_name}`)}
            style={{ width: "100%", background: ACCENT, color: "#fff", border: "none", padding: 14, borderRadius: 14, fontSize: 15, fontWeight: 700 }}
          >
            {t("client.popups.create_order.order_more_button")}
          </button>
          <button
            onClick={() => router.push("/")}
            style={{ width: "100%", background: "transparent", color: ACCENT_DARK, border: `1.5px solid ${ACCENT}`, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700 }}
          >
            {t("client.basket.empty_other_pubs")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 78 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: themeContext.textColor }}>{t("client.basket.headline")}</h1>
          <span style={{ fontSize: 12, color: "#94a3b0" }}>{pub.name}</span>
        </div>
        {basketItems.length > 0 && (
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            style={{ width: 34, height: 34, borderRadius: 10, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c2444c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
          </button>
        )}
      </div>

      <ConfirmPopup
        opened={isClearConfirmOpen}
        title={t("client.basket.clear_confirm_title")}
        message={t("client.basket.clear_confirm_body")}
        confirmLabel={t("client.basket.clear_confirm_button")}
        cancelLabel={t("client.basket.clear_confirm_cancel")}
        onConfirm={() => {
          dispatch(clearBasket());
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />

      <OrderHistory
        orders={orderHistory.filter((order) => order.pub_id === pub.real_id)}
        currencyID={pub.currency_id}
      />

      {showError && (
        <div style={{ padding: "12px 14px", borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c2444c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#a3242c" }}>{t("client.popups.create_order.submit_error_title")}</span>
            <span style={{ fontSize: 12.5, color: "#b3474d", lineHeight: 1.4 }}>
              {showBelowMinimumError
                ? t("client.basket.below_min_order_price", {
                    min: Math.round(pricing.minOrderPrice),
                    amount: Math.ceil(pricing.missingForMinimum),
                    currency,
                  })
                : t("client.popups.create_order.submit_error_body")}
            </span>
          </div>
        </div>
      )}

      {basketItems.length === 0 && (
        <div style={{ padding: "40px 14px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <span style={{ color: "#78838d", fontSize: 14, textAlign: "center" }}>{t("client.basket.empty")}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
            <button
              onClick={() => router.push(`/${i18n.language}/pub/${pub.url_name}`)}
              style={{ width: "100%", background: ACCENT, color: "#fff", border: "none", padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700 }}
            >
              {t("client.basket.empty_open_menu", { pubName: pub.name })}
            </button>
            <button
              onClick={() => router.push("/")}
              style={{ width: "100%", background: "transparent", color: ACCENT_DARK, border: `1.5px solid ${ACCENT}`, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700 }}
            >
              {t("client.basket.empty_other_pubs")}
            </button>
          </div>
        </div>
      )}

      {basketItems.length > 0 && (
        <>
          {/* Items - always visible regardless of delivery availability, so
              the client can always see what they've added. Reuses the same
              Dish row the menu page uses (photo lightbox, +/- stepper,
              remove-confirmation and all) instead of a separate read-only
              row, so adjusting the order doesn't require leaving the basket. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {basketItems.map(({ dish }) => (
              <Dish key={dish.id} pub={pub} dish={dish} currencyID={pub?.currency_id} />
            ))}
          </div>

          {/* Summary - also always visible */}
          <div style={{ background: "#f7f9fa", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "#78838d" }}>{t("client.popups.create_order.product_price")}</span>
              <span style={{ color: "#1c2733", fontWeight: 500 }}>{Math.round(pricing.itemsPrice)}&nbsp;{currency}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5 }}>
              <span style={{ color: "#78838d" }}>{t("client.popups.create_order.delivery_price")}</span>
              {pricing.isDeliveryFree ? (
                <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ color: "#94a3b0", textDecoration: "line-through" }}>
                    {Math.round(pricing.zoneDeliveryPrice)}&nbsp;{currency}
                  </span>
                  <span style={{ color: "#1E7F4F", fontWeight: 700 }}>{t("client.popups.create_order.delivery_free")}</span>
                </span>
              ) : (
                <span style={{ color: "#1c2733", fontWeight: 500 }}>{pricing.hasDeliveryPrice ? `${Math.round(pricing.deliveryPrice)} ${currency}` : "—"}</span>
              )}
            </div>
            {pricing.missingForFreeDelivery > 0 && (
              <span style={{ fontSize: 11.5, color: "#78838d" }}>
                {t("client.popups.create_order.free_delivery_hint", {
                  amount: Math.ceil(pricing.missingForFreeDelivery),
                  currency,
                })}
              </span>
            )}
            <div style={{ borderTop: "1px solid #e7ebef", marginTop: 2, paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1c2733" }}>{t("client.popups.create_order.final_price")}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#1c2733" }}>{Math.round(pricing.totalPrice)}&nbsp;{currency}</span>
            </div>
          </div>

          {/* The pub refuses a delivery order under its minimum (HTTP 400),
              so the shortfall is named here rather than at submit. */}
          {pricing.isBelowMinimum && isDeliveryAvailable && (
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 13.5 }}>
              {t("client.basket.below_min_order_price", {
                min: Math.round(pricing.minOrderPrice),
                amount: Math.ceil(pricing.missingForMinimum),
                currency,
              })}
            </div>
          )}

          {unavailableItems.length > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", color: "#a3242c", fontSize: 13.5 }}>
              {t("client.basket.unavailable_dishes", {
                dishes: unavailableItems.map((item) => item.dish.name).join(", "),
              })}
            </div>
          )}

          {!isDeliveryAvailable && (
            <div style={{ padding: "12px 14px", borderRadius: 14, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", fontSize: 13.5 }}>
              {t("client.basket.no_delivery_available")}
            </div>
          )}

          {isDeliveryAvailable && (
            <>
              {/* Address */}
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: ACCENT_SOFT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT_DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={labelStyle}>{t("client.popups.create_order.delivery_address")}</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1c2733" }}>
                      {manualAddress?.town
                        ? [manualAddress.town, manualAddress.street].filter(Boolean).join(", ")
                        : t("client.popups.create_order.choose")}
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(openSelectLocationPopup())}
                    style={{ background: "transparent", border: `1.5px solid ${ACCENT}`, color: ACCENT_DARK, fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 10, flexShrink: 0 }}
                  >
                    {t("client.popups.create_order.change_address")}
                  </button>
                </div>
                {isApproximateAddress && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 42 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c2701a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    <span style={{ fontSize: 11.5, color: "#c2701a" }}>{t("client.popups.create_order.approximate_address")}</span>
                  </div>
                )}
                {hasAttemptedSubmit && (!manualAddress?.street || manualAddress.street.length < 6) && (
                  <span style={{ fontSize: 11.5, color: "#c2444c" }}>{t("client.errors.min_full_address_length_is_6")}</span>
                )}
              </div>

              {/* Phone */}
              <div style={cardStyle}>
                <span style={labelStyle}>{t("client.popups.create_order.phone")}</span>
                <PhoneNumberInput
                  value={phone}
                  setValue={setPhone}
                  style={{ fontSize: 14, border: "1.5px solid #e7ebef", borderRadius: 12, padding: "10px 12px", width: "100%" }}
                  validators={[validatePhone]}
                  validationDependencies={{ requireValidation: hasAttemptedSubmit }}
                />
              </div>

              {/* Payment */}
              <div style={cardStyle}>
                <span style={labelStyle}>{t("client.popups.create_order.payment_method")}</span>
                {[
                  { id: orderPaymentTypes.cash, label: t("client.popups.create_order.cash_for_courier") },
                  { id: orderPaymentTypes.cardOffline, label: t("client.popups.create_order.card_for_courier") },
                ].map((option) => {
                  const active = paymentType === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setPaymentType(option.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, borderRadius: 14, padding: "11px 12px",
                        border: `1.5px solid ${active ? ACCENT : "#e7ebef"}`,
                        background: active ? ACCENT_SOFT : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ width: 19, height: 19, borderRadius: "50%", border: `2px solid ${active ? ACCENT : "#c7cdd3"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {active && <div style={{ width: 10, height: 10, borderRadius: "50%", background: ACCENT }} />}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#1c2733" }}>{option.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Deliver by time - a wish passed along as a note, not an
                  enforced schedule; see buildOrder for how it's folded into
                  the comment sent to the pub. */}
              <div style={cardStyle}>
                <span style={labelStyle}>Желаемое время доставки</span>
                <input
                  type="text"
                  value={deliverByTime}
                  onChange={(e) => setDeliverByTime(e.target.value)}
                  placeholder="Например: 18:30 или после 19:00"
                  style={{ fontSize: 13.5, border: "1.5px solid #e7ebef", borderRadius: 12, padding: "10px 12px", width: "100%" }}
                />
                <span style={{ fontSize: 11, color: "#94a3b0", lineHeight: 1.4 }}>
                  Необязательно. Заведение постарается учесть, но точное время не гарантировано.
                </span>
              </div>

              {/* Comment */}
              <div style={cardStyle}>
                <span style={labelStyle}>{t("client.popups.create_order.comments")}</span>
                <Textarea
                  value={comments}
                  setValue={setComments}
                  placeholder={t("client.popups.create_order.comment_placeholder")}
                  style={{ fontSize: 13.5, border: "1.5px solid #e7ebef", borderRadius: 12, padding: "10px 12px", width: "100%", resize: "vertical" }}
                />
              </div>
            </>
          )}
        </>
      )}

      {basketItems.length > 0 && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: 600, margin: "0 auto", background: "#fff", borderTop: "1px solid #f1f3f5", padding: "14px 20px 16px" }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit}
            style={{
              width: "100%",
              background: isLoading || !canSubmit ? "#c7cdd3" : ACCENT,
              color: "#fff",
              border: "none",
              padding: 14,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{showError ? t("client.popups.create_order.retry_button") : t("client.basket.create_order_button")}</span>
            <span>{Math.round(pricing.totalPrice)}&nbsp;{currency}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BasketPage;
