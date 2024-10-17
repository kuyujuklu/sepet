import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";
import { getOrderColor, translateOrderStatus } from "../../../utils/order-utils";


const OrderCard = ({ order, hasArrow = true }) => {
  const { t, i18n } = useTranslation();

  return (
    <div
      className="grid grid-cols-1 gap-y-3 sm:flex flex-wrap justify-between gap-x-10 rounded-2xl shadow-xl border-gray-300 border px-10 py-5"
      style={{
        maxWidth: "900px",
        border: "solid 2px",
        borderColor: getOrderColor(order.status),
      }}
    >
      <div className="flex gap-x-20">
        <div className="font-bold">
          {t("admin.admin_panel.order_page.order")} №{order?.id}
        </div>
        <div className="">{order?.client_name}</div>
      </div>

      <div className="flex-col sm:flex-row flex gap-x-10 gap-y-3">
        <div
          className="w-fit px-6 py rounded-md text-white"
          style={{ background: getOrderColor(order?.status) }}
        >
          {t(translateOrderStatus(order?.status))}
        </div>
        <div className="flex justify-between gap-x-4">
          {ConvertQrMenuApiTimeToLocal(order?.created_time, i18n.language)}
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
    </div>
  );
};

export default OrderCard;
