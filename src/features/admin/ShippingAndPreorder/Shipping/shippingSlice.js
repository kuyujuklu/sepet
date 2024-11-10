import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    shipping: {
        available: null,
        shipping_time_from: null,
        shipping_time_to: null,
        shipping_work_start: null,
        shipping_work_end: null,
        shipping_prices: null,
        shipping_free_delivery_prices: null,
        shapes: []
    },
    addCourierPopup: {
        opened: false,
        companyID: null,
        pubID: null,
    }
};

const shippingSlice = createSlice({
    name: "shippingSlice",
    initialState,
    reducers: {
        setShipping(state, action) { 
            state.shipping = action.payload ?? {avaliable:false, shapes:[]};
        },
        openAddCourierPopup(state, action) {
            state.addCourierPopup.opened = true;
            state.addCourierPopup.companyID = action.payload.companyID
            state.addCourierPopup.pubID = action.payload.pubID
        },
        closeAddCourierPopup(state) {
            state.addCourierPopup.opened = false;
            state.addCourierPopup.companyID = null
            state.addCourierPopup.pubID = null
        }
    },
});

export const selectShipping = (state) => state.shippingSlice.shipping
export const selectAddCourierPopupState = (state) => state.shippingSlice.addCourierPopup

export const  {setShipping, openAddCourierPopup, closeAddCourierPopup} = shippingSlice.actions;

export default shippingSlice.reducer;
