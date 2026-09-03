import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";

export const orderFilters = {
  all: "",
  notHandled: orderStatuses.notHandled,
  preparing: orderStatuses.preparing,
  atCourier: orderStatuses.atCourier,
  completed: orderStatuses.completed,
  canceled: orderStatuses.canceled,
};

// Matches the OrderListMobile/OrderListTablet canvas mockup: rounded pills,
// the active one filled dark (not colored per-status - that distinction
// already lives on each order card's left border and status chip).
const OrdersFilter = ({ ordersFilter, setOrdersFilter }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap" style={{ gap: 8 }}>
      <Filter
        ordersFilter={ordersFilter}
        setOrdersFilter={setOrdersFilter}
        selfFilter={orderFilters.all}
        text={t("admin.admin_panel.order_page.order_filters.all")}
      />
      <Filter
        ordersFilter={ordersFilter}
        setOrdersFilter={setOrdersFilter}
        selfFilter={orderFilters.notHandled}
        text={t("admin.admin_panel.order_page.order_filters.not_handled")}
      />
      <Filter
        ordersFilter={ordersFilter}
        setOrdersFilter={setOrdersFilter}
        selfFilter={orderFilters.preparing}
        text={t("admin.admin_panel.order_page.order_filters.preparing")}
      />
      <Filter
        ordersFilter={ordersFilter}
        setOrdersFilter={setOrdersFilter}
        selfFilter={orderFilters.atCourier}
        text={t("admin.admin_panel.order_page.order_filters.at_courier")}
      />
      <Filter
        ordersFilter={ordersFilter}
        setOrdersFilter={setOrdersFilter}
        selfFilter={orderFilters.completed}
        text={t("admin.admin_panel.order_page.order_filters.completed")}
      />
      <Filter
        ordersFilter={ordersFilter}
        setOrdersFilter={setOrdersFilter}
        selfFilter={orderFilters.canceled}
        text={t("admin.admin_panel.order_page.order_filters.canceled")}
      />
    </div>
  );
};

const Filter = ({ ordersFilter, setOrdersFilter, selfFilter, text }) => {
  const active = ordersFilter === selfFilter;
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 36,
        padding: "0 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        flexShrink: 0,
        background: active ? "#1c2733" : "transparent",
        color: active ? "#fff" : "#526070",
        border: active ? "none" : "1.5px solid #e4e9ee",
        cursor: "pointer",
      }}
      onClick={() => setOrdersFilter(selfFilter)}
    >
      {text}
    </button>
  );
};

export default OrdersFilter;
