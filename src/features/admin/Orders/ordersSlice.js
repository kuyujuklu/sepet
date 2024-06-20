import { createSlice } from "@reduxjs/toolkit";
import { selectDeletePubPopupState } from "../../pub/pubSlice";

const initialState = {
  orders: null,
  ordersPreloader: {
    companyID: null,
    pubID: null,
  },
  deleteDishPopupState: {
    opened: false,
    pubID: null,
    pubUrlName: null,
    newDishes: null,
    orderID: null,
    companyID: null
  },
  addDishToOrderPopupPopupState: {
    opened: false,
    pubID: null,
    pubUrlName: null,
    companyID: null,
    orderID: null,
    currentDishes: null,
  }
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

      if (!state.orders) state.orders = [];

      const index = state.orders.findIndex(
        (order) => order.id === updatedOrder.id
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

      if (!state.orders) state.orders = [];

      const orderFromStateIndex = state.orders.findIndex(
        (o) => o.id === order.id
      );
      if (orderFromStateIndex < 0) {
        state.orders.push(order);
        return;
      }
      state.orders[orderFromStateIndex] = order;
    },
    setOrdersPreloader(state, action) {
      if (!action.payload.companyID || !action.payload.pubID) {
        return;
      }

      state.ordersPreloader.companyID = action.payload.companyID;
      state.ordersPreloader.pubID = action.payload.pubID;
    },
    setDeleteFromOrderDishPopupState(state, action) {
      state.deleteDishPopupState.opened = action.payload?.opened;
      state.deleteDishPopupState.pubID = action.payload?.pubID;
      state.deleteDishPopupState.pubUrlName = action.payload?.pubUrlName ;
      state.deleteDishPopupState.companyID = action.payload?.companyID;
      state.deleteDishPopupState.newDishes = action.payload?.newDishes;
      state.deleteDishPopupState.orderID = action.payload?.orderID;
    },
    setAddDishToOrderPopup(state, action) {
      state.addDishToOrderPopupPopupState.opened = action.payload?.opened;
      state.addDishToOrderPopupPopupState.pubID = action.payload?.pubID;
      state.addDishToOrderPopupPopupState.companyID = action.payload?.companyID;
      state.addDishToOrderPopupPopupState.orderID = action.payload?.orderID;      
      state.addDishToOrderPopupPopupState.currentDishes = action.payload?.currentDishes;      
      state.addDishToOrderPopupPopupState.pubUrlName = action.payload?.pubUrlName;      
    }
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  setOrdersPreloader,
  setDeleteFromOrderDishPopupState,
  setAddDishToOrderPopup
} = ordersSlice.actions;

export const selectOrders = (state) => state.orders.orders;
export const selectOrdersPreloader = (state) => state.orders.ordersPreloader;
export const selectDeleteDishFromOrderPopupState = (state) =>
  state.orders.deleteDishPopupState;
export const selectAddDishToOrderPopup = (state) => state.orders.addDishToOrderPopupPopupState

export default ordersSlice.reducer;
