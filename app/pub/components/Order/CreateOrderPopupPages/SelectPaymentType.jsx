import { orderPaymentTypes } from "@/app/admin/static-data/data";
import React from "react";
import { useTranslation } from "react-i18next";

const SelectPaymentType = ({paymentType, setPaymentType}) => {
    const {t} = useTranslation()
    return (
        <div className="flex flex-col gap-y-3">
          <span className="font-medium text-lg">
          {t("client.popups.create_order.choose_payment_type")}

          </span>
            <div className="flex gap-x-5">
                <button
                    onClick={() => setPaymentType(orderPaymentTypes.cash)}
                    className={`${
                        paymentType === orderPaymentTypes.cash
                            ? "bg-gray-900 border-none text-white"
                            : "bg-none border-gray-900 text-gray-900"
                    } px-4 py-2 border-2 rounded-xl font-bold`}
                >
                {t("client.popups.create_order.cash_for_courier")}
                </button>
                <button
                    onClick={() => setPaymentType(orderPaymentTypes.cardOffline)}
                    className={`${
                        paymentType === orderPaymentTypes.cardOffline
                        ? "bg-gray-900 border-none text-white"
                        : "bg-none border-gray-900 text-gray-900"
                    } px-4 py-2 border-2 rounded-xl font-bold`}
                >
                {t("client.popups.create_order.card_for_courier")}
                </button>
            </div>
        </div>
    );
};

export default SelectPaymentType;
