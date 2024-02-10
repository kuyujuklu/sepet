import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cardPreorder: null,
    cashPreorder: null,
};

const preorderSlice = createSlice({
    name: "preorderSlice",
    initialState,
    reducers: {
        setPreorder(state, action) { 
            state.cardPreorder = action.payload?.card_preorder
            state.cashPreorder = action.payload?.cash_preorder
        },
    },
});

export const selectCardPreorder = (state) => state.preorderSlice.cardPreorder
export const selectCashPreorder = (state) => state.preorderSlice.cashPreorder

export const  {setPreorder} = preorderSlice.actions;

export default preorderSlice.reducer;
