import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    createOrderPopup: {
        opened: false
    }
};

const orderSlice = createSlice({
    name: "orderSlice",
    initialState,
    reducers: {
        openCreateOrderPopup(state) {
            state.createOrderPopup.opened = true;
        },
        closeCreateOrderPopup(state) {
            state.createOrderPopup.opened = false;
        },
    },
});

export const selectCreateOrderPopupState = (state) => state.orderSlice.createOrderPopup;

export const { openCreateOrderPopup, closeCreateOrderPopup } = orderSlice.actions;

export default orderSlice.reducer;
