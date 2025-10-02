import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";
import { getOrderColor, translateOrderStatus } from "../../../utils/order-utils";


const OrderCard = ({ order, hasArrow = true }) => {
  const { t, i18n } = useTranslation();

  return (
    <div
      className="grid grid-cols-2 relative sm:grid-cols-3 justify-between items-center overflow-visible rounded-2xl gap-y-2 shadow-xl border-gray-300 border px-10 py-5"
      style={{
        maxWidth: "900px",
        border: "solid 2px",
        borderColor: getOrderColor(order.status),
      }}
    >
      <div className="font-bold">
        {t("admin.admin_panel.order_page.order")} №{order?.id}
      </div>
      {order?.client_name === "delivery order from web menu" &&
        <div className="absolute bg-red-500 text-white rounded-xl shadow-xl border-white p-1" style={{ top: -14, right: -10 }}>Обзвонить</div>
      }

      <div className="truncate overflow-visible" style={{ maxWidth: 130 }}>
        <div className="truncate overflow-visible">{order?.client_name}</div>
      </div>

      <div className="flex justify-start sm:justify-end">
        <div
          className="w-fit px-6 py rounded-md text-white"
          style={{ background: getOrderColor(order?.status) }}
        >
          {t(translateOrderStatus(order?.status))}
        </div>
      </div>

      <div className="flex justify-between gap-x-4">
        {ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}
      </div>
      <div
        className="w-fit"
      >
        {order?.total_dishes_price_without_commission?.toFixed(2)} Lei
      </div>
      <div className="flex justify-start sm:justify-end">
        <div className="flex justify-between gap-x-4">
          {hasArrow && (
            <img
              src={"/static/admin/images/svg/arrow-right-black.svg"}
              width={23}
              height={23}
              alt="right arrow"
            />
          )}
        </div>
      </div>
    </div >
  );
};

export default OrderCard;
