import { orderTypes } from "@/app/static-data/data";
import React from "react";
import { useTranslation } from "react-i18next";

const SelectOrderTypePage = ({ orderType, setOrderType }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-y-3">
            <span className="font-medium text-lg">
                {t("client.popups.create_order.choose_order_type")}
            </span>
            <div className="flex gap-x-5">
                <button
                    onClick={() => setOrderType(orderTypes.inPlace)}
                    className={`${
                        orderType === orderTypes.inPlace
                            ? "bg-gray-900 border-none text-white"
                            : "bg-none border-gray-900 text-gray-900"
                    } px-4 py-2 border-2 rounded-xl font-bold`}
                >
                    {t("client.popups.create_order.in_place_order")}
                </button>
                <button
                    onClick={() => setOrderType(orderTypes.delivery)}
                    className={`${
                        orderType === orderTypes.delivery
                            ? "bg-gray-900 border-none text-white"
                            : "bg-none border-gray-900 text-gray-900"
                    } px-4 py-2 border-2 rounded-xl font-bold`}
                >
                    {t("client.popups.create_order.delivery")}
                </button>
            </div>
        </div>
    );
};

export default SelectOrderTypePage;
