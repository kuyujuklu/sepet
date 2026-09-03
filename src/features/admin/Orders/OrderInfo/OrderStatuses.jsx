import { useUpdateOrderStatusMutation } from "@/api/orders/orders";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  errorKeys,
  setReceivingError,
} from "../../../errorHandlers/errorHandlerSlice";
import { appErrors } from "@/errors/errors";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../../static-data/data";
import { selectOrders, updateOrder } from "../ordersSlice";
import { getOrderColor } from "../../../../utils/order-utils";
import { CheckIcon } from "./icons";

// Same 5 statuses, same underlying action for each - just organized as a
// 4-stage happy-path progress bar with "cancel" pulled out as its own
// distinct (destructive) action, instead of 5 visually-equal buttons in a
// row. Every stage stays directly clickable, same as the old buttons, so a
// pub can still jump straight to any status.
const STAGES = [
  { key: orderStatuses.notHandled, labelKey: "not_handled" },
  { key: orderStatuses.preparing, labelKey: "preparing" },
  { key: orderStatuses.atCourier, labelKey: "at_courier" },
  { key: orderStatuses.completed, labelKey: "completed" },
];

const ADVANCE_LABEL_KEY = {
  [orderStatuses.notHandled]: "advance_to_preparing",
  [orderStatuses.preparing]: "advance_to_courier",
  [orderStatuses.atCourier]: "advance_to_completed",
};

const OrderStatuses = ({ companyID, pubID, orderID, status }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  const [
    updateStatusQuery,
    { data: updateStatusQueryResp, error: updateStatusQueryError, isLoading },
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

    const order = orders.find((order) => orderID === order.id);
    if (!order) return;

    dispatch(updateOrder({ order: { ...order, status: updateStatusQueryResp.status } }));
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

  const stageIndex = STAGES.findIndex((stage) => stage.key === status);
  const isCanceled = status === orderStatuses.canceled;
  const activeColor = isCanceled ? "#d1d5db" : getOrderColor(status);
  const nextStageKey = stageIndex >= 0 && stageIndex < STAGES.length - 1 ? STAGES[stageIndex + 1].key : null;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        {STAGES.map((stage, i) => (
          <div
            key={stage.key}
            className="flex-1 h-1.5 rounded-full"
            style={{ background: !isCanceled && i <= stageIndex ? activeColor : "#e4e9ee" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {STAGES.map((stage, i) => (
          <button
            key={stage.key}
            onClick={() => setOrderStatus(stage.key)}
            className={`text-[11px] font-medium truncate ${i === 0 ? "text-left" : i === STAGES.length - 1 ? "text-right" : "text-center"
              }`}
            style={{
              color: !isCanceled && i === stageIndex ? activeColor : "#94a3b0",
              fontWeight: !isCanceled && i === stageIndex ? 600 : 500,
            }}
          >
            {t(`admin.admin_panel.order_page.order_statuses.${stage.labelKey}`)}
          </button>
        ))}
      </div>

      {isCanceled && (
        <div className="text-xs font-semibold" style={{ color: "#e0483a" }}>
          {t("admin.admin_panel.order_page.order_statuses.canceled")}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {nextStageKey && (
          <button
            onClick={() => setOrderStatus(nextStageKey)}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl text-white text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#2D7DD2" }}
          >
            {isLoading ? <BlackSpinner /> : <CheckIcon />}
            {t(`admin.admin_panel.order_page.${ADVANCE_LABEL_KEY[status]}`)}
          </button>
        )}
        {!isCanceled && (
          <button
            onClick={() => setOrderStatus(orderStatuses.canceled)}
            className="text-[13px] font-semibold whitespace-nowrap"
            style={{ color: "#e0483a" }}
          >
            {t("admin.admin_panel.order_page.cancel_order")}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderStatuses;
