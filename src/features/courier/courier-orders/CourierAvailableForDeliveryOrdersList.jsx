import { useSelector } from "react-redux";
import { selectCourierOrders } from "./courierOrdersSlice";
import { useMemo } from "react";
import { orderStatuses } from "../../../static-data/data";
import CourierOrderCard from "./CourierOrderCard";
import { courierOrderFilters } from "./CourierOrdersFilter";

const CourierAvailableForDeliveryOrdersList = ({ courierID }) => {
  const courierOrders = useSelector(selectCourierOrders);

  const availableOrders = useMemo(() => {
    if (!courierOrders) return [];

    const orders = courierOrders.filter(
      (order) =>
        order.courier_info?.is_reserved === false &&
        order.status === orderStatuses.preparing
    );
    orders.sort((a,b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())

    return orders;
  }, [courierOrders]);

  return (
    <div className=" w-full flex flex-col items-center gap-y-5">
      {availableOrders.map((order) => (
        <CourierOrderCard
          key={order.id}
          courierID={courierID}
          order={order}
          courierOrdersFilter={courierOrderFilters.available}
        />
      ))}
    </div>
  );
};

export default CourierAvailableForDeliveryOrdersList;
