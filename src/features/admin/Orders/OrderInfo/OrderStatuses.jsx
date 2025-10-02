import { useUpdateOrderStatusMutation } from "@/api/orders/orders";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  errorKeys,
  setReceivingError,
} from "../../../errorHandlers/errorHandlerSlice";
import { appErrors } from "@/errors/errors";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../../static-data/data";
import { selectOrders, setUpdateOrderApproximateTimePopup, updateOrder } from "../ordersSlice";


const OrderStatuses = ({ companyID, pubID, orderID, status }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders)

  const [
    updateStatusQuery,
    {
      data: updateStatusQueryResp,
      error: updateStatusQueryError,
      isLoading,
    },
  ] = useUpdateOrderStatusMutation();

  const setOrderStatus = useCallback(
    (newStatus) => {
      updateStatusQuery({ pubID, companyID, orderID, status: newStatus });
    },
    [companyID, pubID, orderID, updateStatusQuery]
  );

  useEffect(() => {
    if (!updateStatusQueryResp) return;

    if (updateStatusQueryResp.ok === false) {
      dispatch(
        setReceivingError({
          errorKey: errorKeys.update_order_status,
          error: { text: appErrors.something_went_wrong },
        })
      );
    }

    const order = orders.find(order => orderID === order.id)
    if (!order) return;

    dispatch(updateOrder({ order: { ...order, status: updateStatusQueryResp.status } }))

    if (order.status === orderStatuses.preparing) {
      dispatch(setUpdateOrderApproximateTimePopup({
        opened: true,
        pubID,
        companyID,
        orderID,
      }))
    }

  }, [dispatch, updateStatusQueryResp]);

  useEffect(() => {
    if (!updateStatusQueryError) return;

    dispatch(
      setReceivingError({
        errorKey: errorKeys.update_order_status,
        error: updateStatusQueryError,
      })
    );
  }, [dispatch, updateStatusQueryError]);

  return (
    <>
      <div className="w-full flex gap-x-2 sm:gap-x-10">
        <button
          className={`text-3xs sm:text-base px-2 py-2 sm:py-2 rounded-lg border border-black ${status === orderStatuses.notHandled
            ? "bg-black text-white"
            : "bg-transparent text-black"
            }`}
          onClick={() => setOrderStatus(orderStatuses.notHandled)}
        >
          {t(
            "admin.admin_panel.order_page.order_statuses.not_handled"
          )}
        </button>
        <button
          className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${status === orderStatuses.preparing
            ? "bg-black text-white"
            : "bg-transparent text-black"
            }`}
          onClick={() => setOrderStatus(orderStatuses.preparing)}
        >
          {t("admin.admin_panel.order_page.order_statuses.preparing")}
        </button>
        <button
          className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${status === orderStatuses.atCourier
            ? "bg-black text-white"
            : "bg-transparent text-black"
            }`}
          onClick={() => setOrderStatus(orderStatuses.atCourier)}
        >
          {t("admin.admin_panel.order_page.order_statuses.at_courier")}
        </button>
        <button
          className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${status === orderStatuses.completed
            ? "bg-black text-white"
            : "bg-transparent text-black"
            }`}
          onClick={() => setOrderStatus(orderStatuses.completed)}
        >
          {t("admin.admin_panel.order_page.order_statuses.completed")}
        </button>
        <button
          className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${status === orderStatuses.canceled
            ? "bg-black text-white"
            : "bg-transparent text-black"
            }`}
          onClick={() => setOrderStatus(orderStatuses.canceled)}
        >
          {t("admin.admin_panel.order_page.order_statuses.canceled")}
        </button>
        {isLoading && <BlackSpinner />}
      </div>
    </>
  );
};

export default OrderStatuses;
