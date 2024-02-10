import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    shipping: {
        avaliable: false,
        shapes: []
    }
};

const shippingSlice = createSlice({
    name: "shippingSlice",
    initialState,
    reducers: {
        setShipping(state, action) { 
            state.shipping = action.payload ?? {avaliable:false, shapes:[]};
        },
    },
});

export const selectShipping = (state) => state.shippingSlice.shipping

export const  {setShipping} = shippingSlice.actions;

export default shippingSlice.reducer;
