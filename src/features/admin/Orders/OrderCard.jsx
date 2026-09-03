import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { useTranslation } from "react-i18next";
import { getOrderColor, getOrderColorTint, translateOrderStatus } from "../../../utils/order-utils";

// Matches the OrderListMobile/OrderListTablet canvas mockup: a colored left
// border keyed to status, a status pill instead of the old full-border +
// solid badge, price pulled forward as its own bold line.
const OrderCard = ({ order }) => {
  const { t, i18n } = useTranslation();
  const needsCall = order?.client_name === "delivery order from web menu";
  const statusColor = getOrderColor(order?.status);

  return (
    <div
      className="relative rounded-2xl bg-white"
      style={{
        border: "1px solid #e4e9ee",
        borderLeft: `4px solid ${statusColor}`,
        boxShadow: "0 1px 2px rgba(20,30,45,.04)",
        padding: 16,
      }}
    >
      {needsCall && (
        <div
          className="absolute text-white font-bold rounded-full"
          style={{ top: -9, right: 14, background: statusColor, fontSize: 10.5, padding: "3px 9px" }}
        >
          {t("admin.admin_panel.orders_page.call_badge")}
        </div>
      )}

      <div className="flex items-center justify-between gap-2" style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {t("admin.admin_panel.order_page.order")} №{order?.id}
        </div>
        <div
          className="rounded-full flex-shrink-0"
          style={{ height: 24, padding: "0 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", background: getOrderColorTint(order?.status), color: statusColor }}
        >
          {t(translateOrderStatus(order?.status))}
        </div>
      </div>

      <div className="truncate" style={{ fontSize: 13, color: "#526070", marginBottom: 10 }}>
        {order?.client_name} · {ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}
      </div>

      <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>
        {order?.total_dishes_price_without_commission?.toFixed(2)} Lei
      </div>
    </div>
  );
};

export default OrderCard;
