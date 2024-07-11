import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";

export const orderFilters = {
    all: "",
    notHandled: orderStatuses.notHandled,
    handled: orderStatuses.handled,
    preparing: orderStatuses.preparing,
    completed: orderStatuses.completed,
    canceled: orderStatuses.canceled,
};

const getFilterColor = (orderStatus) => {
    switch (orderStatus) {
        case orderFilters.notHandled:
            return "#ef4444";
        case orderFilters.handled:
            return "#ed5e21";
        case orderFilters.preparing:
            return "#3b82f6";
        case orderFilters.completed:
            return "#059669";
        case orderStatuses.canceled:
            return "#4a4a48";
        default:
            return "#000";
    }
};

const OrdersFilter = ({ ordersFilter, setOrdersFilter }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full grid grid-cols-3 gap-y-2 sm:flex items-center justify-center gap-x-2 sm:gap-x-5">
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
                selfFilter={orderFilters.handled}
                text={t("admin.admin_panel.order_page.order_filters.handled")}
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
    const { t } = useTranslation();
    return (
        <button
            className={`sm:h-fit text-3xs sm:text-xs px-3 py-2 sm:py-2 rounded-lg border border-black ${
                ordersFilter === selfFilter
                    ? "text-white border-none"
                    : "text-black border border-black"
            }`}
            style={{
                background:
                    ordersFilter === selfFilter
                        ? getFilterColor(ordersFilter)
                        : "transparent",
            }}
            onClick={() => setOrdersFilter(selfFilter)}
        >
            {text}
        </button>
    );
};

export default OrdersFilter;
