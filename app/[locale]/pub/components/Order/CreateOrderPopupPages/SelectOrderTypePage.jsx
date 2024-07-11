import { orderTypes } from "@/app/static-data/data";
import React from "react";
import { useTranslation } from "react-i18next";

const SelectOrderTypePage = ({
    orderType,
    setOrderType,
    hasDelivery,
    hasInPlaceOrder,
    shippingWorkHours,
}) => {
    const { t } = useTranslation();

    const now = new Date();
    const currentDayTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const isTimeValid =
        currentDayTimeInMinutes > shippingWorkHours.start &&
        currentDayTimeInMinutes < shippingWorkHours.end;
    const startRoundedHours = parseInt(shippingWorkHours.start / 60);
    const startRoundedMinutes = parseInt(shippingWorkHours.start % 60);
    const endRoundedHours = parseInt(shippingWorkHours.end / 60);
    const endRoundedMinutes = parseInt(shippingWorkHours.end % 60);

    const shippingTimeString = `${
        startRoundedHours > 9 ? startRoundedHours : "0" + startRoundedHours
    }:${
        startRoundedMinutes > 9
            ? startRoundedMinutes
            : "0" + startRoundedMinutes
    } - 
    ${endRoundedHours > 9 ? endRoundedHours : "0" + endRoundedHours}:${
        endRoundedMinutes > 9 ? endRoundedMinutes : "0" + endRoundedMinutes
    }`;
    const isDeliveryAvailable = hasDelivery && isTimeValid;

    return (
        <div className="flex flex-col gap-y-3">
            <span className="font-medium text-lg">
                {t("client.popups.create_order.choose_order_type")}
            </span>
            <div className="flex gap-x-5">
                <button
                    disabled={!hasInPlaceOrder}
                    onClick={() => setOrderType(orderTypes.inPlace)}
                    className={`${
                        !hasInPlaceOrder
                            ? "bg-gray-400 border-none text-gray-300"
                            : orderType === orderTypes.inPlace
                            ? "bg-gray-900 border-none text-white"
                            : "bg-none border-gray-900 text-gray-900"
                    } px-4 py-2 border-2 rounded-xl font-bold`}
                >
                    {t("client.popups.create_order.in_place_order")}
                </button>
                <button
                    disabled={!isDeliveryAvailable}
                    onClick={() => setOrderType(orderTypes.delivery)}
                    className={`${
                        !isDeliveryAvailable
                            ? "bg-gray-400 border-none text-gray-300"
                            : orderType === orderTypes.delivery
                            ? "bg-gray-900 border-none text-white"
                            : "bg-none border-gray-900 text-gray-900"
                    } flex flex-col px-4 py-2 border-2 rounded-xl font-bold`}
                >
                    {t("client.popups.create_order.delivery")}{" "}
                    <span>
                        {hasDelivery &&
                            !isTimeValid &&
                            `(${shippingTimeString})`}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default SelectOrderTypePage;
