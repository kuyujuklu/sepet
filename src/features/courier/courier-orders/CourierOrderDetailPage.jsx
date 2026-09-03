import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { selectCourierOrders } from "./courierOrdersSlice";
import { useGetFullPubInfoQuery } from "@/api/pub/pub";
import {
  useSetOrderStatusToCanceledMutation,
  useSetOrderStatusToCompletedMutation,
} from "@/api/courier/courier";
import { Card, SectionLabel } from "@/components/design/Card";
import PageHeader from "@/components/design/PageHeader";
import { getOrderColor, getOrderColorTint, translateOrderStatus } from "@/utils/order-utils";
import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { orderPaymentTypes } from "@/static-data/data";
import { pushAlert } from "../../alerts/alertSlice";
import CourierOrderTimeline from "./CourierOrderTimeline";
import { getShownDishes, getCourierOrderMoney } from "./courierOrderMoney";
import { CashIcon, CardIcon, ClockIcon, CourierMapIcon, MessageIcon, PhoneIcon } from "../icons";

const mapsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const RouteStop = ({ label, labelColor, title, subtitle, lat, lng, dotStyle, showLine, lineColor }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={dotStyle} />
      {showLine && <div style={{ width: 2, flexGrow: 1, minHeight: 30, background: lineColor }} />}
    </div>
    <div className={`flex-grow min-w-0 flex items-start justify-between gap-2.5 ${showLine ? "pb-4" : ""}`}>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: labelColor }}>
          {label}
        </div>
        <div className="text-[14px] font-semibold text-ink">{title}</div>
        {subtitle && <div className="text-[12.5px] text-muted">{subtitle}</div>}
      </div>
      <a
        href={mapsUrl(lat, lng)}
        className="flex-shrink-0 flex items-center gap-1.5 h-[30px] px-2.5 rounded-full text-[12px] font-semibold"
        style={{ background: "#e8f1fb", color: "#2D7DD2" }}
      >
        <CourierMapIcon width={14} height={14} />
        Маршрут
      </a>
    </div>
  </div>
);

const CourierOrderDetailPage = ({ courierID }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orderID = +useParams().orderID;

  const courierOrders = useSelector(selectCourierOrders);
  const order = (courierOrders ?? []).find((o) => o.id === orderID) ?? null;

  const { data: pub } = useGetFullPubInfoQuery(
    { pubUrlName: order?.pub?.url_name },
    { skip: !order?.pub?.url_name }
  );

  const shownDishes = getShownDishes(order, pub?.dishes);
  const { totalFromClient, productsPriceWithoutCommission, courierReward } =
    getCourierOrderMoney(order, shownDishes);

  const [setToCompleted, { isLoading: isCompleting }] = useSetOrderStatusToCompletedMutation();
  const [setToCanceled, { isLoading: isCanceling }] = useSetOrderStatusToCanceledMutation();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const handleDelivered = () => {
    if (!courierID || !order?.id) return;
    setToCompleted({ courierID, orderID: order.id })
      .unwrap()
      .then(() => {
        dispatch(pushAlert({ message: t("courier.courier_order.you_delivered_order"), type: "success", delay: 3000 }));
        navigate("/courier/orders");
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    if (!courierID || !order?.id) return;
    setToCanceled({ courierID, orderID: order.id })
      .unwrap()
      .then(() => navigate("/courier/orders"))
      .catch(() => {});
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center w-full py-10" style={{ background: "#f5f7fa" }}>
        <span className="font-bold text-lg">{t("admin.admin_panel.order_page.order_not_found")}</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center" style={{ background: "#f5f7fa" }}>
      <div className="w-full flex flex-col gap-3.5 px-4 py-4" style={{ maxWidth: "560px" }}>
        <PageHeader
          title={`${t("courier.courier_order.order")} №${order.id}`}
          subtitle={ConvertQrMenuApiTimeToLocal(order.created_time, i18n.language)}
          backTo="/courier/orders"
          right={
            <div
              className="flex items-center gap-1.5 h-[26px] px-3 rounded-full text-[13px] font-semibold"
              style={{ background: getOrderColorTint(order.status), color: getOrderColor(order.status) }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: getOrderColor(order.status) }} />
              {t(translateOrderStatus(order.status))}
            </div>
          }
        />

        <CourierOrderTimeline courierID={courierID} orderID={order.id} status={order.status} />

        {order.prepared && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ background: "rgba(242,153,74,.12)", border: "1px solid rgba(242,153,74,.4)" }}
          >
            <ClockIcon width={20} height={20} style={{ color: "#f2994a", flexShrink: 0 }} />
            <div>
              <div className="text-[14px] font-bold text-ink">{t("courier.courier_order.ready_title")}</div>
              <div className="text-[12.5px] text-muted">{t("courier.courier_order.ready_desc")}</div>
            </div>
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between mb-1">
            <SectionLabel>{t("courier.courier_order.route_label")}</SectionLabel>
            {order?.courier_info?.distance > 0 && (
              <span className="text-[12.5px] font-semibold text-muted num">
                {(order.courier_info.distance / 1000).toFixed(1)} км
              </span>
            )}
          </div>
          <RouteStop
            label={t("courier.courier_order.pickup_label")}
            labelColor="#1a9e6b"
            title={order.pub_name}
            subtitle={order.pub?.address}
            lat={order.pub?.lat}
            lng={order.pub?.lng}
            dotStyle={{ background: "#1a9e6b" }}
            showLine
            lineColor="#1a9e6b"
          />
          <RouteStop
            label={t("courier.courier_order.dropoff_label")}
            labelColor="#2D7DD2"
            title={order.full_address}
            subtitle={order.town}
            lat={order.lat}
            lng={order.lng}
            dotStyle={{ background: "#fff", border: "2px solid #2D7DD2", boxShadow: "0 0 0 3px rgba(45,125,210,.13)" }}
          />
        </Card>

        <Card>
          <SectionLabel>{t("courier.courier_order.client_name")}</SectionLabel>
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink">{order.client_name}</div>
              <div className="text-[12.5px] text-muted num">{order.main_phone_number}</div>
              {order.second_phone_number && (
                <div className="text-[12.5px] text-muted num">{order.second_phone_number}</div>
              )}
            </div>
            {order.main_phone_number && (
              <a
                href={`tel:${order.main_phone_number}`}
                className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center"
                style={{ background: "#e8f1fb", color: "#2D7DD2" }}
              >
                <PhoneIcon width={17} height={17} />
              </a>
            )}
          </div>
          {order.comments && (
            <div className="flex items-start gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "#f7f8fa" }}>
              <MessageIcon width={16} height={16} className="flex-shrink-0 mt-0.5 text-muted-2" />
              <div className="text-[13px] text-muted leading-relaxed">{order.comments}</div>
            </div>
          )}
        </Card>

        <Card>
          <SectionLabel>{t("courier.courier_order.positions")}</SectionLabel>
          <div className="flex flex-col gap-2">
            {shownDishes.map(({ order_dish, pub_dish }) => (
              <div key={pub_dish.id} className="flex items-center justify-between gap-2 text-[13.5px] text-ink">
                <span>{pub_dish.name}</span>
                <span className="text-muted num flex-shrink-0">
                  × {order_dish.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <SectionLabel>{t("courier.courier_order.payment_label")}</SectionLabel>
            <div className="flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-semibold" style={{ background: "#f2f4f6", color: "#526070" }}>
              {order.payment_type === orderPaymentTypes.cash ? <CashIcon width={13} height={13} /> : <CardIcon width={13} height={13} />}
              {order.payment_type === orderPaymentTypes.cash
                ? t("courier.order_payment_types.cash")
                : order.payment_type === orderPaymentTypes.cardOffline
                  ? t("courier.order_payment_types.card_offline")
                  : t("courier.order_payment_types.not_proceeded")}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">{t("courier.courier_order.give_to_pub")}</span>
            <span className="text-[14px] font-semibold text-ink num">{productsPriceWithoutCommission.toFixed(2)} Lei</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">{t("courier.courier_order.total_from_client")}</span>
            <span className="text-[14px] font-semibold text-ink num">{totalFromClient.toFixed(2)} Lei</span>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #e4e9ee" }} />
          <div className="flex items-center justify-between">
            <span className="text-[14.5px] font-bold text-ink">{t("courier.courier_order.your_earning")}</span>
            <span className="text-[20px] font-bold num" style={{ color: "#1a9e6b" }}>{courierReward.toFixed(2)} Lei</span>
          </div>
        </Card>

        <div className="flex flex-col items-center gap-2.5 mt-1">
          <button
            disabled={isCompleting}
            onClick={handleDelivered}
            className="w-full h-[50px] rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2"
            style={{ background: "#1a9e6b", opacity: isCompleting ? 0.7 : 1 }}
          >
            {t("courier.courier_order.set_order_to_completed")}
          </button>

          {!confirmingCancel ? (
            <button
              onClick={() => setConfirmingCancel(true)}
              className="text-[13px] font-semibold p-1"
              style={{ color: "#e0483a" }}
            >
              {t("courier.courier_order.cant_fulfill")}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-muted">{t("courier.courier_order.cancel_confirm")}</span>
              <button disabled={isCanceling} onClick={handleCancel} className="text-[13px] font-bold" style={{ color: "#e0483a" }}>
                {t("courier.courier_order.cancel_confirm_yes")}
              </button>
              <button onClick={() => setConfirmingCancel(false)} className="text-[13px] font-semibold text-muted">
                {t("courier.courier_order.cancel_confirm_no")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierOrderDetailPage;
