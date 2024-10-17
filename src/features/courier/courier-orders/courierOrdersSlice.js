import { createSlice } from "@reduxjs/toolkit";
import { selectDeletePubPopupState } from "../../pub/pubSlice";

const initialState = {
  courierOrders: null,
  courierOrdersPreloader: {
    courierID: null,
  },
  courierReserveOrderPopup: {
    opened: false,
    orderID: null,
    courierID: null
  }
};

export const courierOrdersSlice = createSlice({
  name: "courierOrders",
  initialState,
  reducers: {
    setCourierOrders(state, action) {
      const orders = action.payload.courierOrders;
      if (!orders) return;
      

      state.courierOrders = orders;
    },
    updateCourierOrder(state, action) {
      const updatedOrder = action.payload.courierOrder;
      if (!updatedOrder || !updatedOrder.id) return;

      if (!state.courierOrders) state.courierOrders = [];

      const index = state.courierOrders.findIndex(
        (order) => order.id === updatedOrder.id
      );

      if (index === -1) {
        state.courierOrders.push(action.payload.courierOrder);
        return;
      }

      state.courierOrders[index] = updatedOrder;
    },
    addCourierOrder(state, action) {
      const order = action.payload.courierOrder;
      if (!order) return;

      if (!state.courierOrders) state.courierOrders = [];

      const orderFromStateIndex = state.courierOrders.findIndex(
        (o) => o.id === order.id
      );
      if (orderFromStateIndex < 0) {
        state.courierOrders.push(order);
        return;
      }
      state.courierOrders[orderFromStateIndex] = order;
    },
    setCourierOrdersPreloader(state, action) {
      if (!action.payload.courierID) {
        return;
      }

      state.courierOrdersPreloader.courierID = action.payload.courierID;
    },
    setCourierReserveOrderPopup(state, action) {
      state.courierReserveOrderPopup.opened = action.payload.opened ?? false
      state.courierReserveOrderPopup.orderID = action.payload.orderID ?? null
      state.courierReserveOrderPopup.courierID = action.payload.courierID ?? null
    },
    closeCourierReserveOrderPopup(state) {
      state.courierReserveOrderPopup.opened = false;
      state.courierReserveOrderPopup.orderID = null;
      state.courierReserveOrderPopup.courierID = null;
    }
  },
});

export const {
  setCourierOrders,
  addCourierOrder,
  updateCourierOrder,
  setCourierOrdersPreloader,
  setCourierReserveOrderPopup,
  closeCourierReserveOrderPopup
} = courierOrdersSlice.actions;

export const selectCourierOrders = (state) => state.courierOrders.courierOrders;
export const selectCourierOrdersPreloader = (state) => state.courierOrders.courierOrdersPreloader;
export const selectCourierReserveOrderPopupState = (state) => state.courierOrders.courierReserveOrderPopup;

export default courierOrdersSlice.reducer;
