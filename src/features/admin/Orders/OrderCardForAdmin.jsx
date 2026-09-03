import { useTranslation } from "react-i18next";
import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { orderStatuses } from "../../../static-data/data";
import { getOrderColor, getOrderColorTint, translateOrderStatus } from "../../../utils/order-utils";
import { useGetCourierByIDQuery } from "../../../api/courier/courier";
import CourierAvatar from "../../courier/CourierAvatar";
import { PhoneIcon, ClockIcon } from "./OrderInfo/icons";

// Matches the same magic string OrderCard.jsx (the venue-facing card)
// checks for - orders placed through the public web menu have no real
// client name, just a phone number.
const WEB_ORDER_CLIENT_NAME = "delivery order from web menu";

const StatChip = ({ label, value }) => (
  <span
    className="inline-flex items-center gap-1 flex-shrink-0"
    style={{ height: 22, padding: "0 9px", borderRadius: 20, background: "#f2f4f6", color: "#526070", fontSize: 11, fontWeight: 600 }}
  >
    {label} <b style={{ color: "#1c2733", fontWeight: 700 }}>{value ?? 0}</b>
  </span>
);

// Cross-venue order card for the superadmin's Active Orders screen - one
// level "zoomed out" from the venue's own OrderCard.jsx, so it leads with
// which venue this is (name, total/active order counts) before the order
// itself, and surfaces the assigned courier's name/photo/phone directly
// instead of leaving it as raw "Has courier: true, Courier ID: 3" debug
// text. The whole card enters that venue's admin on click (see onClick),
// except the phone pill, which stops that click and dials instead.
const OrderCardForAdmin = ({ order, totalOrdersForPub, activeOrdersForPub, onClick }) => {
  const { t, i18n } = useTranslation();
  const statusColor = getOrderColor(order?.status);
  const needsCall = order?.client_name === WEB_ORDER_CLIENT_NAME;

  const hasCourier = order?.courier_info?.is_reserved && order?.courier_info.reserver_courier_id;
  const { data: courierData } = useGetCourierByIDQuery(
    { courierID: order?.courier_info?.reserver_courier_id },
    { skip: !hasCourier }
  );
  const notYetVisibleToCouriers =
    order?.status === orderStatuses.notHandled || order?.status === orderStatuses.handled;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-2xl cursor-pointer"
      style={{ border: "1px solid #e4e9ee", boxShadow: "0 1px 2px rgba(20,30,45,.04)", padding: 18 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="truncate" style={{ fontSize: 14.5, fontWeight: 700, color: "#1c2733" }}>
          {order?.pub_name}
        </div>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94a3b0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
      <div className="flex gap-2" style={{ marginTop: 8 }}>
        <StatChip label="Всего" value={totalOrdersForPub} />
        <StatChip label="Активных" value={activeOrdersForPub} />
      </div>

      <div style={{ height: 1, background: "#f0f2f5", margin: "14px 0" }} />

      <div className="flex items-center justify-between gap-2">
        <div style={{ fontSize: 15.5, fontWeight: 700, color: "#1c2733" }}>
          {t("admin.admin_panel.order_page.order")} №{order?.id}
        </div>
        <div
          className="rounded-full flex-shrink-0 flex items-center"
          style={{ height: 24, padding: "0 11px", fontSize: 12, fontWeight: 600, gap: 6, background: getOrderColorTint(order?.status), color: statusColor }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
          {t(translateOrderStatus(order?.status))}
        </div>
      </div>

      <div className="flex items-center flex-wrap" style={{ marginTop: 7, gap: 7, fontSize: 13, color: "#526070" }}>
        {needsCall ? (
          <>
            <span>Заказ с сайта</span>
            <span
              className="inline-flex items-center flex-shrink-0 font-bold text-white"
              style={{ height: 19, padding: "0 8px", borderRadius: 20, fontSize: 10.5, background: "#e0483a" }}
            >
              {t("admin.admin_panel.orders_page.call_badge")}
            </span>
          </>
        ) : (
          <span className="truncate">{order?.client_name}</span>
        )}
        <span style={{ color: "#94a3b0" }}>·</span>
        <span>{ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}</span>
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: "#1c2733", marginTop: 8 }}>
        {order?.total_dishes_price_without_commission?.toFixed(2)} Lei
      </div>

      <div className="flex items-center" style={{ gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px dashed #f0f2f5" }}>
        {hasCourier ? (
          <>
            <CourierAvatar courier={courierData?.courier} size={36} />
            <div className="flex-grow min-w-0">
              <div style={{ fontSize: 11, color: "#94a3b0", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".03em" }}>
                {t("admin.admin_panel.order_page.order_courier_info.courier_was_found")}
              </div>
              <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "#1c2733" }}>
                {courierData?.courier?.full_name || t("admin.admin_panel.order_page.order_courier_info.no_name")}
              </div>
            </div>
            {courierData?.courier?.phone_number && (
              <a
                href={`tel:${courierData.courier.phone_number}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center flex-shrink-0"
                style={{ gap: 6, height: 32, padding: "0 12px", borderRadius: 20, background: "#e8f1fb", color: "#1f63ab", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}
              >
                <PhoneIcon width={13} height={13} />
                {courierData.courier.phone_number}
              </a>
            )}
          </>
        ) : notYetVisibleToCouriers ? (
          <div className="flex items-center" style={{ gap: 8, fontSize: 13, color: "#94a3b0" }}>
            <ClockIcon width={15} height={15} className="flex-shrink-0" />
            {t("admin.admin_panel.order_page.order_courier_info.set_status_to_preparing_for_couriers")}
          </div>
        ) : order?.status === orderStatuses.preparing ? (
          <div className="flex items-center" style={{ gap: 8, fontSize: 13, color: "#94a3b0" }}>
            <ClockIcon width={15} height={15} className="flex-shrink-0 animate-pulse" />
            {t("admin.admin_panel.order_page.order_courier_info.searching_for_couriers")}…
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#94a3b0" }}>
            {t("admin.admin_panel.order_page.order_courier_info.no_courier")}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCardForAdmin;
