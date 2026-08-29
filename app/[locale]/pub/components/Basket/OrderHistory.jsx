import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ConvertQrMenuApiTimeToLocal } from "@/app/utils/time";
import { ThemeContext } from "../PubPage/ThemeContextProvider";
import { currencies, orderTypes } from "@/app/static-data/data";

// A local-only receipt trail (see basketSlice's orderHistory) - not real
// order tracking, just enough for a client to see "yes, I did order this,
// here's what it cost" without needing an account. Scoped by the caller to
// this one pub's orders.
const OrderHistory = ({ orders, currencyID }) => {
  const { t, i18n } = useTranslation();
  const themeContext = useContext(ThemeContext);

  const currency = currencies.find(
    (currency) => currency.id === currencyID
  )?.symbol ?? "Lei"

  if (!orders?.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#94a3b0", fontWeight: 500 }}>
        {t("client.basket.order_history.headline")}
      </span>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid " + themeContext.textColor,
            padding: "8px 20px",
            color: themeContext.textColor,
          }}
          className="flex justify-between rounded-xl border-white gap-x-5 text-xs sm:text-base"
        >
          <div>
            <div>№{order.id}</div>
            <div>
              {order.order_type === orderTypes.inPlace
                ? t("client.basket.order_history.in_place_order")
                : t("client.basket.order_history.delivery")}
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
      ))}
    </div>
  );
};

export default OrderHistory;
