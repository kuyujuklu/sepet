import { createSlice } from "@reduxjs/toolkit";
import { orderStatuses } from "../../../app/static-data/data";

const initialState = {
  orders: [],
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders(state, action) {
      const orders = action.payload.orders;
      if (!orders) return;

      state.orders = orders;
    },
    updateOrder(state, action) {
      const updatedOrder = action.payload.order;
      if (!updatedOrder || !updatedOrder.id) return;

      const index = state.orders.findIndex(
        (order) => order.id === updatedOrder.id,
      );

      if (index === -1) {
        state.orders.push(action.payload.order);
        return;
      }

      state.orders[index] = updatedOrder;
    },
    addOrder(state, action) {
      const order = action.payload.order;
      if (!order) return;

      const orderFromStateIndex = state.orders.findIndex(
        (o) => o.id === order.id,
      );
      if (orderFromStateIndex < 0) {
        state.orders.push(order);
        return;
      }
      state.orders[orderFromStateIndex] = order;
    },
  },
});

export const { setOrders, addOrder, updateOrder } = ordersSlice.actions;

export const selectOrders = (state) => state.orders.orders;

// Anything the client can still expect something to happen with - used by the
// home screen to offer a way back into an order in progress
export const selectActiveOrders = (state) =>
  state.orders.orders.filter(
    (order) =>
      order?.status !== orderStatuses.completed &&
      order?.status !== orderStatuses.canceled,
  );

export default ordersSlice.reducer;
