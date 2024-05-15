import { ConvertQrMenuApiTimeToLocal } from "@/app/utils/time";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../PubPage/PubPage";
import { currencies, orderTypes } from "@/app/static-data/data";

const LastOrder = ({ order, currencyID }) => {
    const { t, i18n } = useTranslation();
    const themeContext = useContext(ThemeContext);

    
    const currency = currencies.find(
      (currency) => currency.id === currencyID
  )?.symbol ?? "Lei"


    return (
        <div
            style={{
                border: "1px solid " + themeContext.textColor,
                padding: "8px 20px",
                color: themeContext.textColor,
            }}
            className="flex justify-between rounded-xl border-white gap-x-5 text-xs sm:text-base"
        >
            <div>
                <div>{t("client.basket.last_order.headline")}</div>
                <div>
                    {order.order_type === orderTypes.inPlace
                        ? t("client.basket.last_order.in_place_order")
                        : t("client.basket.last_order.delivery")}
                </div>
            </div>
            <div>
                <div>
                    {order.amount} {currency}
                </div>
                <div>
                    {ConvertQrMenuApiTimeToLocal(
                        order.created_time,
                        i18n.language || "ru"
                    )}
                </div>
            </div>
        </div>
    );
};

export default LastOrder;
