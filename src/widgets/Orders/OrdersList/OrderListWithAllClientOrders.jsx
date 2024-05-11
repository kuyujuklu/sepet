import OrderList from "./OrderList";
import { useSelector } from "react-redux";
import { selectOrders } from "../../../features/store/orders/ordersSlice";

export const OrderListWithAllClientOrders = () => {
  const orders = useSelector(selectOrders)

  return (
    <>
      <OrderList orders={orders} />
    </>
  );
};
