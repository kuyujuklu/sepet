import { useSelector } from "react-redux";
import { selectCourierOrders } from "./courierOrdersSlice";
import { useMemo } from "react";
import { orderStatuses } from "../../../static-data/data";
import CourierOrderCard from "./CourierOrderCard";
import { courierOrderFilters } from "./CourierOrdersFilter";

const CourierActiveOrders = ({ courierID }) => {
  const courierOrders = useSelector(selectCourierOrders);

  const activeOrders = useMemo(() => {
    if (!courierOrders) return [];

    const orders = courierOrders.filter(
      (order) =>
        order.courier_info?.reserver_courier_id === courierID &&
        order.status !== orderStatuses.completed &&
        order.status !== orderStatuses.canceled
    );
    orders.sort((a,b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())

    return orders;
  }, [courierID, courierOrders]);

  return (
    <div className="w-full flex items-center flex-col gap-y-5">
      {activeOrders.map((order) => (
        <CourierOrderCard
          key={order.id}
          courierID={courierID}
          order={order}
          courierOrdersFilter={courierOrderFilters.active}
        />
      ))}
    </div>
  );
};

export default CourierActiveOrders;
