import { useUpdateOrderStatusMutation } from "@/api/orders/orders";
import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    errorKeys,
    setReceivingError,
} from "../../../errorHandlers/errorHandlerSlice";
import { appErrors } from "@/errors/errors";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { orderStatuses } from "@/static-data/data";
import { useTranslation } from "react-i18next";

const OrderStatuses = ({ companyID, pubID, orderID, status }) => {
    const {t} = useTranslation()
    const dispatch = useDispatch();
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

        console.log("resp: ", updateStatusQueryResp);
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
                    className={`text-3xs sm:text-base px-2 py-2 sm:py-2 rounded-lg border border-black ${
                        status === orderStatuses.notHandled
                            ? "bg-black text-white"
                            : "bg-transparent text-black"
                    }`}
                    onClick={() => setOrderStatus(orderStatuses.notHandled)}
                >
                    {t("admin.admin_panel.order_page.order_statuses.not_handled")}
                </button>
                <button
                    className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${
                        status === orderStatuses.handled
                            ? "bg-black text-white"
                            : "bg-transparent text-black"
                    }`}
                    onClick={() => setOrderStatus(orderStatuses.handled)}
                >
                    {t("admin.admin_panel.order_page.order_statuses.handled")}
                </button>
                <button
                    className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${
                        status === orderStatuses.preparing
                            ? "bg-black text-white"
                            : "bg-transparent text-black"
                    }`}
                    onClick={() => setOrderStatus(orderStatuses.preparing)}
                >
                    {t("admin.admin_panel.order_page.order_statuses.preparing")}
                </button>
                <button
                    className={`text-3xs sm:text-base px-1 sm:px-3 py-0 sm:py-2 rounded-lg border border-black ${
                        status === orderStatuses.completed
                            ? "bg-black text-white"
                            : "bg-transparent text-black"
                    }`}
                    onClick={() => setOrderStatus(orderStatuses.completed)}
                >
                    {t("admin.admin_panel.order_page.order_statuses.completed")}
                </button>
            {isLoading && <BlackSpinner />}
            </div>
        </>
    );
};

export default OrderStatuses;
