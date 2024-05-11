import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orders: null,
};

export const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
      setOrders(state, action) {
        const orders = action.payload.orders
        if(!orders) return;

        state.orders = orders;
      },
      updateOrder(state, action) {
        const updatedOrder = action.payload.order
        if(!updatedOrder || !updatedOrder.id) return;
        
        if(!state.orders) state.orders = []

        const index = state.orders.findIndex(order => order.id === updatedOrder.id)
        
        if(index === -1){
          state.orders.push(action.payload.order)
          return;
        }

        state.orders[index] = updatedOrder
      },
      addOrder(state, action) {
        const order = action.payload.order
        if(!order) return;

        if(!state.orders) state.orders = []
        
        const orderFromStateIndex = state.orders.findIndex(o => o.id === order.id)
        if(orderFromStateIndex < 0) {
          state.orders.push(order)
          return;
        }
        state.orders[orderFromStateIndex] = order
      }
    }
});

export const { setOrders, addOrder,updateOrder } = ordersSlice.actions;

export const selectOrders = state => state.orders.orders;

export default ordersSlice.reducer;