import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";
import {
  getOrderColor,
  translateOrderStatus,
} from "../../../utils/order-utils";
import CourierCard from "../../courier/CourierCard";
import {
  useGetCourierByIDQuery,
  useGetCourierQuery,
} from "../../../api/courier/courier";
import { useEffect } from "react";

const OrderCourierInfo = ({ order }) => {
  const { t, i18n } = useTranslation();

  const hasCourier =
    order?.courier_info?.is_reserved && order?.courier_info.reserver_courier_id;

  const {
    data: courierData,
    error: courierError,
    isLoading: isCourierLoading,
  } = useGetCourierByIDQuery(
    { courierID: order?.courier_info?.reserver_courier_id },
    { skip: !hasCourier }
  );

  return (
    <div
      className="gap-y-3 justify-between gap-x-10 rounded-2xl shadow-xl border-gray-300 border px-10 py-5"
      style={{
        maxWidth: "900px",
        border: "solid 2px",
        borderColor: getOrderColor(order.status),
      }}
    >
      <div className="flex gap-x-20 font-bold">
        {order?.status === orderStatuses.notHandled && (
          <div>
            {t("admin.admin_panel.order_page.order_courier_info.set_status_to_preparing_for_couriers")}
          </div>
        )}
        {order?.status === orderStatuses.preparing && (
          <>
            {!hasCourier && (
              <div >{t("admin.admin_panel.order_page.order_courier_info.searching_for_couriers")}...</div>
            )}
            {hasCourier && (
              <div className="flex gap-6 items-center w-full">
                <div>{t("admin.admin_panel.order_page.order_courier_info.courier_was_found")}:</div>
                <div className="flex-1">
                  <CourierCard courier={courierData?.courier} />
                </div>
              </div>
            )}
          </>
        )}
        {order?.status === orderStatuses.atCourier && (
          <>
            {!hasCourier && (
              <div>
                {t("admin.admin_panel.order_page.order_courier_info.set_status_to_preparing_for_couriers")}
              </div>
            )}
            {hasCourier && (
              <div className="flex gap-6 items-center w-full">
                <div>{t("admin.admin_panel.order_page.order_courier_info.courier_was_found")}:</div>
                <div className="flex-1">
                  <CourierCard courier={courierData?.courier} />
                </div>
              </div>
            )}
          </>
        )}
        {(order?.status === orderStatuses.completed || order?.status === orderStatuses.canceled) && (
          <>
            {!hasCourier && (
              <div>
                Courier not found
              </div>
            )}
            {hasCourier && (
              <div className="flex gap-6 items-center w-full">
                <div>{t("admin.admin_panel.order_page.order_courier_info.courier_was_found")}:</div>
                <div className="flex-1">
                  <CourierCard courier={courierData?.courier} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex-col sm:flex-row flex gap-x-10 gap-y-3"></div>
    </div>
  );
};

export default OrderCourierInfo;
