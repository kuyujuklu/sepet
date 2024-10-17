import { useTranslation } from "react-i18next";
import { orderStatuses } from "../../../static-data/data";

export const courierOrderFilters = {
  active: "active",
  available: "available",
  completed: "completed"
}

const getFilterColor = (orderStatus) => {
  switch (orderStatus) {
    case courierOrderFilters.active:
      return "#059669";
    case courierOrderFilters.available:
      return "#ed5e21";
    case courierOrderFilters.completed:
      return "#000";
    default:
      return "#000";
  }
};

const CourierOrdersFilter = ({ filter, setFilter }) => {
    const { t } = useTranslation();

  return (
    <div className="w-full grid grid-cols-3 gap-y-2 sm:flex items-center justify-center gap-x-2 sm:gap-x-5">
      <Filter
        filter={filter}
        setFilter={setFilter}
        selfFilter={courierOrderFilters.available}
        text={t("courier.courier_order_types.available")}
      />
      <Filter
        filter={filter}
        setFilter={setFilter}
        selfFilter={courierOrderFilters.active}
        text={t("courier.courier_order_types.active")}
      />
      <Filter
        filter={filter}
        setFilter={setFilter}
        selfFilter={courierOrderFilters.completed}
        text={t("courier.courier_order_types.completed")}
      />
    </div>
  );
};
    
const Filter = ({ filter, setFilter, selfFilter, text }) => {
  const { t } = useTranslation();
  return (
    <button
      className={`sm:h-fit text-3xs sm:text-xs px-3 py-2 sm:py-2 rounded-lg border border-black ${
        filter === selfFilter
          ? "text-white border-none"
          : "text-black border border-black"
      }`}
      style={{
        background:
          filter === selfFilter
            ? getFilterColor(filter)
            : "transparent",
      }}
      onClick={() => setFilter(selfFilter)}
    >
      {text}
    </button>
  );
};

export default CourierOrdersFilter;
