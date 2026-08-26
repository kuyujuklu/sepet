import { useSelector } from "react-redux";
import OrderList from "./OrderList";
import { selectOrders } from "../../../features/store/orders/ordersSlice";

export const OrderListWithAllClientOrders = ({ ListHeaderComponent }) => {
  const orders = useSelector(selectOrders);

  return (
    <OrderList orders={orders} ListHeaderComponent={ListHeaderComponent} />
  );
};

export default OrderListWithAllClientOrders;
