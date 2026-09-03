import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { orderPaymentTypes } from "../../../static-data/data";
import { useDispatch } from "react-redux";
import { setCourierReserveOrderPopup } from "./courierOrdersSlice";
import { getOrderColor, getOrderColorTint, translateOrderStatus } from "../../../utils/order-utils";
import { useGetFullPubInfoQuery } from "../../../api/pub/pub";
import { getShownDishes, getCourierOrderMoney } from "./courierOrderMoney";
import { courierOrderFilters } from "./CourierOrdersFilter";
import { CashIcon, CardIcon, ClockIcon, CourierMapIcon, PhoneIcon } from "../icons";

const mapsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const CourierOrderCard = ({ courierID, order, courierOrdersFilter }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: pub } = useGetFullPubInfoQuery(
    { pubUrlName: order?.pub?.url_name },
    { skip: !order?.pub?.url_name }
  );

  const isActive = courierOrdersFilter === courierOrderFilters.active;
  const isCompleted = courierOrdersFilter === courierOrderFilters.completed;
  const isAvailable = courierOrdersFilter === courierOrderFilters.available;

  const shownDishes = getShownDishes(order, pub?.dishes);
  const { courierReward } = getCourierOrderMoney(order, shownDishes);

  const reserveOrder = () => {
    if (!courierID || !order?.id) return;
    dispatch(setCourierReserveOrderPopup({ opened: true, courierID, orderID: order.id }));
  };

  const openDetail = () => {
    if (!isActive) return;
    navigate(`/courier/orders/${order.id}`);
  };

  return (
    <div
      onClick={openDetail}
      className="w-full rounded-2xl overflow-hidden"
      style={{
        maxWidth: 560,
        border: "1px solid #e4e9ee",
        boxShadow: "0 1px 2px rgba(20,30,45,.04)",
        cursor: isActive ? "pointer" : "default",
      }}
    >
      {isActive && order?.prepared && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-[12.5px] font-bold text-white"
          style={{ background: "#f2994a" }}
        >
          <ClockIcon width={14} height={14} />
          {t("courier.courier_order.ready_banner")}
        </div>
      )}

      <div className="bg-white flex flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[14.5px] text-ink">
            {t("courier.courier_order.order")} №{order?.id}
          </span>
          {isAvailable ? (
            <span className="text-[12px] text-muted-2 num">
              {ConvertQrMenuApiTimeToLocal(order?.created_time)}
            </span>
          ) : (
            <div
              className="flex items-center gap-1.5 h-[22px] px-2.5 rounded-full text-[11.5px] font-semibold"
              style={{ background: getOrderColorTint(order?.status), color: getOrderColor(order?.status) }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: getOrderColor(order?.status) }} />
              {t(translateOrderStatus(order?.status))}
            </div>
          )}
        </div>

        <div className="text-[13px] text-muted">
          {order?.pub_name}, {order?.pub?.address}
        </div>

        {isAvailable && (
          <a
            href={mapsUrl(order?.lat, order?.lng)}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[12.5px] font-medium"
            style={{ color: "#2D7DD2" }}
          >
            <CourierMapIcon width={14} height={14} />
            {order?.town} {order?.full_address}
          </a>
        )}

        <hr style={{ border: "none", borderTop: "1px solid #e4e9ee" }} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <CourierMapIcon width={15} height={15} />
            <span className="num">{((order?.courier_info?.distance ?? 0) / 1000).toFixed(1)} км</span>
          </div>
          <span className="font-bold text-[15px] num" style={{ color: "#1a9e6b" }}>
            +{courierReward.toFixed(2)} Lei
          </span>
        </div>

        {(isActive || isCompleted) && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13.5px] font-medium text-ink">{order?.client_name}</span>
              {order?.main_phone_number && (
                <a
                  href={`tel:${order.main_phone_number}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "#e8f1fb", color: "#2D7DD2" }}
                >
                  <PhoneIcon width={14} height={14} />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11.5px] font-semibold w-fit" style={{ background: "#f2f4f6", color: "#526070" }}>
              {order?.payment_type === orderPaymentTypes.cash ? <CashIcon width={12} height={12} /> : <CardIcon width={12} height={12} />}
              {order?.payment_type === orderPaymentTypes.cash
                ? t("courier.order_payment_types.cash")
                : order?.payment_type === orderPaymentTypes.cardOffline
                  ? t("courier.order_payment_types.card_offline")
                  : t("courier.order_payment_types.not_proceeded")}
            </div>
          </>
        )}

        {isAvailable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              reserveOrder();
            }}
            className="w-full h-11 rounded-xl text-white font-bold text-[13.5px]"
            style={{ background: "#2D7DD2" }}
          >
            {t("courier.courier_order.reserve_order")}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourierOrderCard;
